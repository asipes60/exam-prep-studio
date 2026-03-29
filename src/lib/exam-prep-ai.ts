// EduCare Exam Prep Studio - AI Content Generation
// Calls the Supabase Edge Function which proxies to Gemini 2.0 Flash.
// Falls back to mock generators if the edge function is unavailable.

import type {
  GeneratorConfig,
  GeneratedContent,
  PracticeQuestion,
  Flashcard,
  StudyGuide,
  StudyPlan,
  QuickReference,
  ClinicalVignette,
  LicenseType,
} from '@/types/exam-prep';
import { EXAM_DATA, getSeedQuestions, getSeedFlashcards, getSeedStudyGuide, getSeedStudyPlan, getSeedVignettes } from '@/data/exam-prep-data';
import { getRelevantKBEntries, formatKBForPrompt } from '@/lib/kb-retrieval';
import { logGeneration } from '@/lib/audit-log';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';
import { validateAIResponse, validateStudyPlan } from '@/lib/validation';

function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Fetch with Timeout + Retry ─────────────────────────────────────────

const EDGE_FN_TIMEOUT_MS = 30_000; // 30 seconds
const MAX_RETRIES = 2; // up to 3 total attempts
const BASE_DELAY_MS = 1_000; // 1s, doubles each retry

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  { timeoutMs = EDGE_FN_TIMEOUT_MS, maxRetries = MAX_RETRIES }: { timeoutMs?: number; maxRetries?: number } = {},
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      // Don't retry client errors (4xx) — only server errors (5xx) or network failures
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }

      lastError = new Error(`Edge function returned ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError = new Error(`Request timed out after ${timeoutMs / 1000}s`);
      } else {
        lastError = err instanceof Error ? err : new Error('Network request failed');
      }
    }

    // Exponential backoff before next retry
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * 2 ** attempt));
    }
  }

  throw lastError ?? new Error('Edge function request failed');
}

// ─── System Prompt Builder ──────────────────────────────────────────────

export function buildSystemPrompt(config: GeneratorConfig, kbContext?: string): string {
  const exam = EXAM_DATA[config.licenseType];

  let prompt = `You are an expert clinical exam preparation assistant for California mental health licensure.

CONTEXT:
- Exam: ${exam.title} (${exam.id})
- Topic: ${config.topic}
- California-specific emphasis: ${config.californiaEmphasis ? 'Yes' : 'No'}

GUIDELINES:
- Generate exam-level content that is clinically accurate and relevant to California licensing exams.
- All content should match the difficulty and complexity candidates will encounter on the actual exam.
- Use plain professional language—not overly academic, not patronizing.
- Be specific to the selected license context.
- Include California-specific laws, codes, and regulations when relevant.
- Do NOT fabricate specific statute numbers or legal citations unless you are confident they are accurate. When uncertain, indicate that users should verify with official California sources.
- Do NOT present content as official legal advice or guaranteed exam material.
- Frame all content as educational study support.

DISCLAIMER TO INCLUDE:
This content is for educational study purposes only and does not replace official exam prep materials, legal consultation, or clinical supervision.`;

  if (config.studyFormat === 'clinical_vignette') {
    const qPerVignette = config.questionsPerVignette ?? 5;
    prompt += `

CLINICAL VIGNETTE INSTRUCTIONS:
- Create a realistic, paragraph-length client presentation with demographics, presenting problem, and relevant history.
- Follow each vignette with exactly ${qPerVignette} questions testing different competency areas (diagnosis, treatment planning, ethics, risk assessment, cultural competence).
- Each question should have 4 answer choices with detailed rationales for correct and incorrect answers.
- Present nuanced cases with competing clinical priorities, reflecting actual exam complexity.
- Ensure vignettes reflect diverse client populations and clinical settings.`;
  }

  if (kbContext) {
    prompt += kbContext;
  }

  return prompt;
}

// ─── User Prompt Builder ────────────────────────────────────────────────

function buildUserPrompt(config: GeneratorConfig): string {
  const exam = EXAM_DATA[config.licenseType];
  const formatLabel = config.studyFormat.replace(/_/g, ' ');
  const itemCount = config.itemCount;

  const base = `Generate ${formatLabel} for the ${exam.shortTitle} exam on the topic: "${config.topic}".
All content should be at exam-level difficulty.`;

  switch (config.studyFormat) {
    case 'practice_questions':
      return `${base}
Generate exactly ${itemCount} multiple-choice questions. Each question must have exactly 4 answer choices (A, B, C, D).
Include detailed rationale for the correct answer and explanations for why each incorrect answer is wrong.
Assign each question a unique id starting with "gen-".`;

    case 'clinical_vignette': {
      const qPerVignette = config.questionsPerVignette ?? 5;
      return `${base}
Generate exactly ${itemCount} clinical vignettes. Each vignette must include:
- A realistic paragraph-length client presentation
- Client demographics
- Presenting problem
- Relevant history
- Exactly ${qPerVignette} follow-up questions testing different competency areas (diagnosis, treatment planning, ethics, risk assessment, cultural competence)
Each question should have 4 choices with detailed rationales.
Assign each vignette and question a unique id starting with "gen-".`;
    }

    case 'flashcards':
      return `${base}
Generate exactly ${itemCount} flashcards. Each flashcard should have a clear question or term on the front and a concise, accurate answer on the back.
Assign each flashcard a category based on the content area and a unique id starting with "gen-".`;

    case 'study_guide':
      return `${base}
Generate a comprehensive study guide with 3-5 sections. Each section should include:
- A clear overview paragraph
- 3-5 key terms with definitions
- 3-5 practical takeaways for exam preparation
- 2-4 common exam traps to avoid
- 2-3 memory aids or mnemonics
Assign unique ids starting with "gen-" to the guide and each section.`;

    case 'quick_reference':
      return `${base}
Generate a quick reference sheet with 6-8 items. Each item should have a heading and concise content covering key definitions, California law references, clinical applications, exam tips, common mistakes, and memory aids.
Assign a unique id starting with "gen-".`;

    default:
      return `${base}\nGenerate ${itemCount} items. Assign each a unique id starting with "gen-".`;
  }
}

// ─── Edge Function Call ─────────────────────────────────────────────────

async function callGeminiEdgeFunction(
  systemPrompt: string,
  config: GeneratorConfig,
): Promise<{ data: unknown; model: string }> {
  const userPrompt = buildUserPrompt(config);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const res = await fetchWithRetry(
    `${supabaseUrl}/functions/v1/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        studyFormat: config.studyFormat,
        config: {
          licenseType: config.licenseType,
          topic: config.topic,
          difficulty: config.difficulty,
          itemCount: config.itemCount,
          includeRationales: config.includeRationales,
          californiaEmphasis: config.californiaEmphasis,
          isBeginnerReview: config.isBeginnerReview,
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    if (body.limitReached) {
      throw new Error(body.message || 'Daily generation limit reached');
    }
    throw new Error(body.error || `Edge function returned ${res.status}`);
  }

  return await res.json();
}

// ─── Mock Fallback Generators ───────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockPracticeQuestions(config: GeneratorConfig): Promise<PracticeQuestion[]> {
  await delay(1500 + Math.random() * 1000);
  const seed = getSeedQuestions(config.licenseType);
  const questions: PracticeQuestion[] = [];
  for (let i = 0; i < config.itemCount; i++) {
    const base = seed[i % seed.length];
    questions.push({ ...base, id: generateId(), topic: config.topic || base.topic, difficulty: config.difficulty });
  }
  return questions;
}

async function mockFlashcards(config: GeneratorConfig): Promise<Flashcard[]> {
  await delay(1200 + Math.random() * 800);
  const seed = getSeedFlashcards(config.licenseType);
  const cards: Flashcard[] = [];
  for (let i = 0; i < config.itemCount; i++) {
    const base = seed[i % seed.length];
    cards.push({ ...base, id: generateId(), topic: config.topic || base.topic });
  }
  return cards;
}

async function mockStudyGuide(config: GeneratorConfig): Promise<StudyGuide> {
  await delay(2000 + Math.random() * 1000);
  return { ...getSeedStudyGuide(config.licenseType), id: generateId(), title: `${config.topic || 'Study Guide'} — ${EXAM_DATA[config.licenseType].shortTitle}`, topic: config.topic };
}

async function mockQuickReference(config: GeneratorConfig): Promise<QuickReference> {
  await delay(1000 + Math.random() * 500);
  return {
    id: generateId(),
    title: `Quick Reference: ${config.topic} — ${EXAM_DATA[config.licenseType].shortTitle}`,
    topic: config.topic,
    items: [
      { heading: 'Key Definition', content: `${config.topic} refers to the core principles and regulations governing this area of clinical practice in California.` },
      { heading: 'California Law', content: 'Clinicians must comply with relevant sections of the California Business and Professions Code and associated regulations.' },
      { heading: 'Clinical Application', content: 'This topic frequently appears in scenarios involving client safety, ethical decision-making, and professional boundaries.' },
      { heading: 'Exam Tip', content: 'Questions on this topic often test your ability to apply the law to a specific clinical scenario.' },
      { heading: 'Common Mistakes', content: 'Test-takers often confuse similar concepts or apply rules from other states.' },
      { heading: 'Memory Aid', content: 'Create a mnemonic or visual association that links the key rule to a concrete clinical example.' },
    ],
  };
}

async function mockVignettes(config: GeneratorConfig): Promise<ClinicalVignette[]> {
  await delay(2000 + Math.random() * 1000);
  const seed = getSeedVignettes(config.licenseType);
  const vignettes: ClinicalVignette[] = [];
  for (let i = 0; i < config.itemCount; i++) {
    const base = seed[i % seed.length];
    vignettes.push({ ...base, id: generateId() });
  }
  return vignettes;
}

async function generateMockContent(config: GeneratorConfig): Promise<GeneratedContent> {
  switch (config.studyFormat) {
    case 'practice_questions':
      return { type: 'practice_questions', data: await mockPracticeQuestions(config) };
    case 'clinical_vignette':
      return { type: 'clinical_vignette', data: await mockVignettes(config) };
    case 'flashcards':
      return { type: 'flashcards', data: await mockFlashcards(config) };
    case 'study_guide':
      return { type: 'study_guide', data: await mockStudyGuide(config) };
    case 'quick_reference':
      return { type: 'quick_reference', data: await mockQuickReference(config) };
    default:
      return { type: 'practice_questions', data: await mockPracticeQuestions(config) };
  }
}

// ─── Main Generation Entry Point ────────────────────────────────────────

export interface GenerationResult {
  content: GeneratedContent;
  auditEntryId: string | null;
  model: string;
}

export async function generateStudyMaterial(
  config: GeneratorConfig,
  userId?: string
): Promise<GenerationResult> {
  const startTime = Date.now();

  // Fetch relevant KB entries for prompt injection
  let kbContext = '';
  let kbEntryIds: string[] = [];
  try {
    const kbEntries = await getRelevantKBEntries({
      licenseType: config.licenseType,
      topic: config.topic,
    });
    if (kbEntries.length > 0) {
      kbContext = formatKBForPrompt(kbEntries);
      kbEntryIds = kbEntries.map((e) => e.id);
    }
  } catch {
    // KB retrieval is non-critical; continue without it
  }

  const systemPrompt = buildSystemPrompt(config, kbContext);

  let content: GeneratedContent;
  let modelUsed = 'mock-generator';

  // Try Gemini edge function first, fall back to mock if unavailable
  try {
    const result = await callGeminiEdgeFunction(systemPrompt, config);
    modelUsed = result.model || 'gemini-2.0-flash';

    // Validate and wrap the raw data in the GeneratedContent envelope
    const validatedData = validateAIResponse(config.studyFormat, result.data);
    content = { type: config.studyFormat, data: validatedData } as GeneratedContent;
  } catch (err: unknown) {
    // If it's a usage limit error, re-throw so the UI can show it
    if (err instanceof Error && err.message?.includes('limit')) {
      throw err;
    }

    console.warn('Gemini edge function unavailable, falling back to mock:', err instanceof Error ? err.message : err);
    content = await generateMockContent(config);
  }

  const generationTimeMs = Date.now() - startTime;

  // Log to audit table if user is authenticated
  let auditEntryId: string | null = null;
  if (userId) {
    try {
      auditEntryId = await logGeneration({
        userId,
        systemPrompt,
        promptText: `Format: ${config.studyFormat}, Topic: ${config.topic}, Difficulty: ${config.difficulty}, Items: ${config.itemCount}`,
        outputText: JSON.stringify(content.data).slice(0, 10000),
        licenseType: config.licenseType,
        studyFormat: config.studyFormat,
        topic: config.topic,
        difficulty: config.difficulty,
        modelUsed,
        generationTimeMs,
        kbEntriesUsed: kbEntryIds,
      });
    } catch {
      // Audit logging is non-critical; continue
    }
  }

  return { content, auditEntryId, model: modelUsed };
}

// ─── Quiz Batch Generator ───────────────────────────────────────────────

const BATCH_SIZE_MCQ = 25;

export async function generateQuizBatches(
  config: GeneratorConfig,
  onProgress?: (batch: number, total: number) => void,
  userId?: string,
): Promise<GenerationResult> {
  const totalItems = config.itemCount;

  // For vignettes: each batch = 1 vignette, questionsPerVignette determines Qs per vignette
  if (config.studyFormat === 'clinical_vignette') {
    const vignetteCount = totalItems; // itemCount = number of vignettes
    const allVignettes: ClinicalVignette[] = [];
    let lastResult: GenerationResult | null = null;

    for (let i = 0; i < vignetteCount; i++) {
      onProgress?.(i + 1, vignetteCount);
      const batchConfig: GeneratorConfig = {
        ...config,
        itemCount: 1,
      };
      const result = await generateStudyMaterial(batchConfig, userId);
      lastResult = result;
      if (result.content.type === 'clinical_vignette') {
        allVignettes.push(...result.content.data);
      }
    }

    return {
      content: { type: 'clinical_vignette', data: allVignettes },
      auditEntryId: lastResult?.auditEntryId ?? null,
      model: lastResult?.model ?? 'unknown',
    };
  }

  // For MCQs: batch in groups of BATCH_SIZE_MCQ
  if (totalItems <= BATCH_SIZE_MCQ) {
    onProgress?.(1, 1);
    return generateStudyMaterial(config, userId);
  }

  const batchCount = Math.ceil(totalItems / BATCH_SIZE_MCQ);
  const allQuestions: PracticeQuestion[] = [];
  let lastResult: GenerationResult | null = null;

  for (let i = 0; i < batchCount; i++) {
    const remaining = totalItems - i * BATCH_SIZE_MCQ;
    const batchSize = Math.min(BATCH_SIZE_MCQ, remaining);
    onProgress?.(i + 1, batchCount);

    const batchConfig: GeneratorConfig = {
      ...config,
      itemCount: batchSize,
    };
    const result = await generateStudyMaterial(batchConfig, userId);
    lastResult = result;
    if (result.content.type === 'practice_questions') {
      allQuestions.push(...result.content.data);
    }
  }

  return {
    content: { type: 'practice_questions', data: allQuestions },
    auditEntryId: lastResult?.auditEntryId ?? null,
    model: lastResult?.model ?? 'unknown',
  };
}

// ─── Weak Area Assessment Generator ─────────────────────────────────────

export async function generateWeakAreaPlan(
  license: LicenseType,
  weakAreas: string[],
  strongAreas: string[] = [],
  examDate?: string,
  userId?: string,
): Promise<StudyPlan> {
  const exam = EXAM_DATA[license];

  const systemPrompt = `You are an expert study plan designer for California mental health licensure exams.

Create a personalized 6-8 week study plan for the ${exam.title} (${exam.id}).
The plan should heavily weight the student's weak areas while maintaining coverage of strong areas.

GUIDELINES:
- Front-load weak areas in the first half of the plan.
- Use a variety of study formats: practice_questions, clinical_vignette, flashcards, study_guide, quick_reference.
- Include review cycles — don't just cover a topic once.
- Week 7-8 should focus on mock exams and comprehensive review.
- Keep it realistic: 5-7 study hours per week for working professionals.
- Be specific to the ${exam.shortTitle} exam content domains.

Assign the plan a unique id starting with "sp-".`;

  const examDateLine = examDate
    ? `\nThe student's exam date is ${examDate}. Adjust the plan intensity accordingly.`
    : '';

  const userPrompt = `Create a personalized study plan for the ${exam.shortTitle} exam.

Weak areas (need heavy focus): ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None identified'}
Strong areas (lighter review): ${strongAreas.length > 0 ? strongAreas.join(', ') : 'None identified'}${examDateLine}

Generate a structured 6-8 week plan with weekly focus topics, recommended material types, review cadence, and practice frequency.`;

  try {
    const config: GeneratorConfig = {
      licenseType: license,
      studyFormat: 'study_plan',
      topic: weakAreas.join(', ') || 'General Review',
      difficulty: 'exam_level',
      itemCount: 1,
      includeRationales: false,
      californiaEmphasis: true,
      isBeginnerReview: false,
    };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const res = await fetchWithRetry(
      `${supabaseUrl}/functions/v1/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          studyFormat: 'study_plan',
          config: {
            licenseType: license,
            topic: weakAreas.join(', ') || 'General Review',
            difficulty: 'exam_level',
            itemCount: 1,
            includeRationales: false,
            californiaEmphasis: true,
            isBeginnerReview: false,
          },
        }),
      },
      { timeoutMs: 45_000 }, // study plans take longer to generate
    );

    if (!res.ok) {
      throw new Error(`Edge function returned ${res.status}`);
    }

    const result = await res.json();
    const plan = validateStudyPlan(result.data) as StudyPlan;

    // Ensure required fields
    return {
      ...plan,
      id: plan.id || `sp-${Date.now()}`,
      licenseType: license,
      weakAreas: weakAreas,
    };
  } catch (err) {
    console.warn('Gemini study plan generation failed, using seed plan:', err);
    return getSeedStudyPlan(license, weakAreas);
  }
}
