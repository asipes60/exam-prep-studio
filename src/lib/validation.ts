// EduCare Exam Prep Studio - Zod Runtime Validation
// Validates AI responses and Supabase data at system boundaries.

import { z } from 'zod';

// ─── Shared Primitives ──────────────────────────────────────────────────

const difficultySchema = z.enum(['beginner', 'intermediate', 'exam_level']);

const choiceSchema = z.object({
  label: z.string(),
  text: z.string(),
});

const incorrectRationaleSchema = z.object({
  label: z.string(),
  explanation: z.string(),
});

// ─── Practice Questions ─────────────────────────────────────────────────

const practiceQuestionSchema = z.object({
  id: z.string(),
  stem: z.string(),
  choices: z.array(choiceSchema).min(2),
  correctAnswer: z.string(),
  rationale: z.string(),
  incorrectRationales: z.array(incorrectRationaleSchema).default([]),
  topic: z.string(),
  difficulty: difficultySchema,
});

// ─── Flashcards ─────────────────────────────────────────────────────────

const flashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  category: z.string(),
  topic: z.string(),
});

// ─── Study Guide ────────────────────────────────────────────────────────

const studyGuideSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  overview: z.string(),
  keyTerms: z.array(z.object({ term: z.string(), definition: z.string() })).default([]),
  practicalTakeaways: z.array(z.string()).default([]),
  commonExamTraps: z.array(z.string()).default([]),
  memoryAids: z.array(z.string()).default([]),
});

const studyGuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  sections: z.array(studyGuideSectionSchema).min(1),
});

// ─── Quick Reference ────────────────────────────────────────────────────

const quickReferenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  items: z.array(z.object({ heading: z.string(), content: z.string() })).min(1),
});

// ─── Clinical Vignette ──────────────────────────────────────────────────

const clinicalVignetteQuestionSchema = z.object({
  questionText: z.string(),
  competencyArea: z.string(),
  choices: z.array(choiceSchema).min(2),
  correctAnswer: z.string(),
  rationale: z.string(),
  incorrectRationales: z.array(incorrectRationaleSchema).default([]),
});

const clinicalVignetteSchema = z.object({
  id: z.string(),
  clientPresentation: z.string(),
  demographics: z.string(),
  presentingProblem: z.string(),
  relevantHistory: z.string(),
  questions: z.array(clinicalVignetteQuestionSchema).min(1),
});

// ─── Study Plan ─────────────────────────────────────────────────────────

const weeklyPlanSchema = z.object({
  week: z.number(),
  focus: z.string(),
  materialTypes: z.array(z.string()),
  reviewCadence: z.string(),
  practiceFrequency: z.string(),
  topics: z.array(z.string()),
});

const studyPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  licenseType: z.string(),
  timeHorizon: z.string(),
  weeklyPlan: z.array(weeklyPlanSchema).min(1),
  weakAreas: z.array(z.string()).default([]),
});

// ─── AI Response Validators ─────────────────────────────────────────────
// These validate the `data` field returned by the edge function, keyed by
// study format. Returns the validated data or throws with a clear message.

const aiResponseSchemas = {
  practice_questions: z.array(practiceQuestionSchema).min(1),
  clinical_vignette: z.array(clinicalVignetteSchema).min(1),
  flashcards: z.array(flashcardSchema).min(1),
  study_guide: studyGuideSchema,
  quick_reference: quickReferenceSchema,
  study_plan: studyPlanSchema,
} as const;

export type ValidatableFormat = keyof typeof aiResponseSchemas;

/**
 * Validates AI-generated content data against the expected schema for a given format.
 * Throws a descriptive error if validation fails rather than letting malformed data
 * propagate to the UI where it would cause cryptic render errors.
 */
export function validateAIResponse(format: string, data: unknown): unknown {
  const schema = aiResponseSchemas[format as ValidatableFormat];
  if (!schema) {
    // Unknown format — pass through without validation (backward compat)
    return data;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.slice(0, 3).map(
      (i) => `${i.path.join('.')}: ${i.message}`
    ).join('; ');
    throw new Error(`AI response validation failed for ${format}: ${issues}`);
  }

  return result.data;
}

/**
 * Validates a study plan response from the AI.
 */
export function validateStudyPlan(data: unknown) {
  const result = studyPlanSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.slice(0, 3).map(
      (i) => `${i.path.join('.')}: ${i.message}`
    ).join('; ');
    throw new Error(`Study plan validation failed: ${issues}`);
  }
  return result.data;
}
