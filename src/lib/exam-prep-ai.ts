// EduCare Exam Prep Studio - AI Content Generation
// This module contains mock generation logic with clearly marked placeholders
// for Gemini API integration.
//
// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  GEMINI API INTEGRATION POINT                                       ║
// ║  Replace the mock functions below with actual Gemini API calls.     ║
// ║  Recommended model: gemini-1.5-pro or gemini-2.0-flash             ║
// ║                                                                     ║
// ║  1. Install: npm install @google/generative-ai                      ║
// ║  2. Set VITE_GEMINI_API_KEY in .env                                ║
// ║  3. Replace generateContent() calls below                          ║
// ║  4. Add structured output parsing with Zod schemas                  ║
// ╚═══════════════════════════════════════════════════════════════════════╝

import type {
  GeneratorConfig,
  GeneratedContent,
  PracticeQuestion,
  Flashcard,
  StudyGuide,
  StudyPlan,
  QuickReference,
  LicenseType,
} from '@/types/exam-prep';
import { EXAM_DATA, getSeedQuestions, getSeedFlashcards, getSeedStudyGuide, getSeedStudyPlan } from '@/data/exam-prep-data';

// Simulated delay for realistic UX
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── System Prompt Builder ──────────────────────────────────────────────
// This builds the system context for AI generation calls.

export function buildSystemPrompt(config: GeneratorConfig): string {
  const exam = EXAM_DATA[config.licenseType];
  return `You are an expert clinical exam preparation assistant for California mental health licensure.

CONTEXT:
- Exam: ${exam.title} (${exam.id})
- Topic: ${config.topic}
- Difficulty: ${config.difficulty}
- California-specific emphasis: ${config.californiaEmphasis ? 'Yes' : 'No'}
- Beginner review mode: ${config.isBeginnerReview ? 'Yes' : 'No'}

GUIDELINES:
- Generate content that is clinically accurate and relevant to California licensing exams.
- Use plain professional language—not overly academic, not patronizing.
- Be specific to the selected license context.
- Include California-specific laws, codes, and regulations when relevant.
- Do NOT fabricate specific statute numbers or legal citations unless you are confident they are accurate. When uncertain, indicate that users should verify with official California sources.
- Do NOT present content as official legal advice or guaranteed exam material.
- Frame all content as educational study support.

DISCLAIMER TO INCLUDE:
This content is for educational study purposes only and does not replace official exam prep materials, legal consultation, or clinical supervision.`;
}

// ─── Mock Generator Functions ───────────────────────────────────────────
// Each function returns realistic mock content. Replace internals with
// Gemini API calls for production.

async function generatePracticeQuestions(config: GeneratorConfig): Promise<PracticeQuestion[]> {
  // TODO: GEMINI API CALL
  // const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  // const prompt = buildSystemPrompt(config) + `\n\nGenerate ${config.itemCount} practice questions...`;
  // const result = await model.generateContent(prompt);
  // Parse and return structured questions

  await delay(1500 + Math.random() * 1000);
  const seed = getSeedQuestions(config.licenseType);
  const questions: PracticeQuestion[] = [];

  for (let i = 0; i < config.itemCount; i++) {
    const base = seed[i % seed.length];
    questions.push({
      ...base,
      id: generateId(),
      topic: config.topic || base.topic,
      difficulty: config.difficulty,
    });
  }
  return questions;
}

async function generateFlashcards(config: GeneratorConfig): Promise<Flashcard[]> {
  // TODO: GEMINI API CALL — see generatePracticeQuestions for pattern
  await delay(1200 + Math.random() * 800);
  const seed = getSeedFlashcards(config.licenseType);
  const cards: Flashcard[] = [];
  for (let i = 0; i < config.itemCount; i++) {
    const base = seed[i % seed.length];
    cards.push({
      ...base,
      id: generateId(),
      topic: config.topic || base.topic,
    });
  }
  return cards;
}

async function generateStudyGuide(config: GeneratorConfig): Promise<StudyGuide> {
  // TODO: GEMINI API CALL
  await delay(2000 + Math.random() * 1000);
  return {
    ...getSeedStudyGuide(config.licenseType),
    id: generateId(),
    title: `${config.topic || 'Study Guide'} — ${EXAM_DATA[config.licenseType].shortTitle}`,
    topic: config.topic,
  };
}

async function generateQuickReference(config: GeneratorConfig): Promise<QuickReference> {
  // TODO: GEMINI API CALL
  await delay(1000 + Math.random() * 500);
  return {
    id: generateId(),
    title: `Quick Reference: ${config.topic} — ${EXAM_DATA[config.licenseType].shortTitle}`,
    topic: config.topic,
    items: [
      { heading: 'Key Definition', content: `${config.topic} refers to the core principles and regulations governing this area of clinical practice in California.` },
      { heading: 'California Law', content: 'Clinicians must comply with relevant sections of the California Business and Professions Code and associated regulations. Verify specific code sections with official BBS resources.' },
      { heading: 'Clinical Application', content: 'In practice, this topic frequently appears in scenarios involving client safety, ethical decision-making, and professional boundaries.' },
      { heading: 'Exam Tip', content: 'Questions on this topic often test your ability to apply the law to a specific clinical scenario, not just recall the rule. Focus on the reasoning process.' },
      { heading: 'Common Mistakes', content: 'Test-takers often confuse similar concepts or apply rules from other states. Always think "California-specific" when answering.' },
      { heading: 'Memory Aid', content: 'Create a mnemonic or visual association that links the key rule to a concrete clinical example you can remember under test pressure.' },
    ],
  };
}

async function generateStudyPlan(config: GeneratorConfig): Promise<StudyPlan> {
  // TODO: GEMINI API CALL
  await delay(1800 + Math.random() * 700);
  return getSeedStudyPlan(config.licenseType, config.topic ? [config.topic] : []);
}

// ─── Main Generation Entry Point ────────────────────────────────────────

export async function generateStudyMaterial(config: GeneratorConfig): Promise<GeneratedContent> {
  switch (config.studyFormat) {
    case 'practice_questions':
      return { type: 'practice_questions', data: await generatePracticeQuestions(config) };
    case 'scenario_questions':
      return { type: 'scenario_questions', data: await generatePracticeQuestions({ ...config, customPrompt: 'scenario-based' }) };
    case 'flashcards':
      return { type: 'flashcards', data: await generateFlashcards(config) };
    case 'study_guide':
      return { type: 'study_guide', data: await generateStudyGuide(config) };
    case 'quick_reference':
      return { type: 'quick_reference', data: await generateQuickReference(config) };
    case 'mini_quiz':
      return { type: 'mini_quiz', data: await generatePracticeQuestions({ ...config, itemCount: Math.min(config.itemCount, 10) }) };
    case 'mock_exam':
      return { type: 'mock_exam', data: await generatePracticeQuestions({ ...config, itemCount: 25 }) };
    case 'law_ethics_spotter':
      return { type: 'law_ethics_spotter', data: await generatePracticeQuestions({ ...config, customPrompt: 'law-ethics-spotter' }) };
    case 'rationale_review':
      return { type: 'rationale_review', data: await generatePracticeQuestions(config) };
    case 'study_plan':
      return { type: 'study_plan', data: await generateStudyPlan(config) };
    default:
      return { type: 'practice_questions', data: await generatePracticeQuestions(config) };
  }
}

// ─── Weak Area Assessment Generator ─────────────────────────────────────

export async function generateWeakAreaPlan(
  license: LicenseType,
  weakAreas: string[]
): Promise<StudyPlan> {
  // TODO: GEMINI API CALL for truly personalized plan
  await delay(2000);
  return getSeedStudyPlan(license, weakAreas);
}
