// EduCare Exam Prep Studio - Supabase-backed Storage
// Materials and folders are stored in Supabase. Falls back to localStorage
// for non-authenticated features (quiz sessions, assessments, recent config).

import { supabase } from '@/integrations/supabase/client';
import type {
  SavedMaterial,
  Folder,
  GeneratedContent,
  QuizSession,
  WeakAreaAssessmentResult,
  LicenseType,
  StudyFormat,
  StudyPlan,
} from '@/types/exam-prep';

const STORAGE_KEYS = {
  QUIZ_SESSIONS: 'educare_exam_prep_quizzes',
  ASSESSMENTS: 'educare_exam_prep_assessments',
  RECENT_CONFIG: 'educare_exam_prep_recent_config',
} as const;

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

// ─── Helper: get current user id ────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// ─── Saved Materials (Supabase) ─────────────────────────────────────────

export async function getSavedMaterialsAsync(): Promise<SavedMaterial[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('exam_prep_materials')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    licenseType: row.license_type as LicenseType,
    studyFormat: row.study_format as StudyFormat,
    topic: row.topic,
    content: row.content as unknown as GeneratedContent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFavorite: row.is_favorite,
    folderId: row.folder_id ?? undefined,
    tags: row.tags ?? [],
  }));
}

export async function saveMaterialAsync(material: SavedMaterial): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const payload = {
    id: material.id,
    user_id: userId,
    name: material.name,
    license_type: material.licenseType,
    study_format: material.studyFormat,
    topic: material.topic,
    content: material.content as unknown as Record<string, unknown>,
    is_favorite: material.isFavorite,
    folder_id: material.folderId ?? null,
    tags: material.tags,
    updated_at: new Date().toISOString(),
  };

  await supabase.from('exam_prep_materials').upsert(payload);
}

export async function deleteMaterialAsync(id: string): Promise<void> {
  await supabase.from('exam_prep_materials').delete().eq('id', id);
}

export async function toggleFavoriteAsync(id: string): Promise<void> {
  const { data } = await supabase
    .from('exam_prep_materials')
    .select('is_favorite')
    .eq('id', id)
    .single();

  if (data) {
    await supabase
      .from('exam_prep_materials')
      .update({ is_favorite: !data.is_favorite })
      .eq('id', id);
  }
}

// ─── Synchronous wrappers (for context compatibility) ───────────────────
// These return empty data synchronously. The context should use the async
// versions and manage state with useEffect.

export function getSavedMaterials(): SavedMaterial[] {
  return [];
}

export function saveMaterial(_material: SavedMaterial): void {
  // no-op — use saveMaterialAsync
}

export function deleteMaterial(_id: string): void {
  // no-op — use deleteMaterialAsync
}

export function toggleFavorite(_id: string): void {
  // no-op — use toggleFavoriteAsync
}

export function searchMaterials(
  _query: string,
  _filters?: { licenseType?: LicenseType; studyFormat?: StudyFormat; folderId?: string; favoritesOnly?: boolean }
): SavedMaterial[] {
  return [];
}

// ─── Folders (Supabase) ─────────────────────────────────────────────────

export async function getFoldersAsync(): Promise<Folder[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('exam_prep_folders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    materialCount: 0,
  }));
}

export async function createFolderAsync(name: string): Promise<Folder> {
  const userId = await getCurrentUserId();
  const { data } = await supabase
    .from('exam_prep_folders')
    .insert({ user_id: userId!, name })
    .select()
    .single();

  return {
    id: data?.id ?? `folder-${Date.now()}`,
    name,
    createdAt: data?.created_at ?? new Date().toISOString(),
    materialCount: 0,
  };
}

export async function deleteFolderAsync(id: string): Promise<void> {
  // Unassign materials from this folder first
  await supabase
    .from('exam_prep_materials')
    .update({ folder_id: null })
    .eq('folder_id', id);

  await supabase.from('exam_prep_folders').delete().eq('id', id);
}

// Synchronous wrappers for compatibility
export function getFolders(): Folder[] {
  return [];
}

export function createFolder(name: string): Folder {
  return { id: `folder-${Date.now()}`, name, createdAt: new Date().toISOString(), materialCount: 0 };
}

export function deleteFolder(_id: string): void {
  // no-op
}

export function moveMaterialToFolder(_materialId: string, _folderId: string | undefined): void {
  // no-op
}

// ─── Quiz Sessions (Supabase + localStorage fallback) ───────────────────

export function getQuizSessions(): QuizSession[] {
  return getLocal<QuizSession[]>(STORAGE_KEYS.QUIZ_SESSIONS, []);
}

export function saveQuizSession(session: QuizSession): void {
  const sessions = getQuizSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  setLocal(STORAGE_KEYS.QUIZ_SESSIONS, sessions);
}

export async function saveQuizSessionAsync(
  userId: string,
  session: QuizSession,
): Promise<void> {
  await supabase.from('exam_prep_quiz_sessions').insert({
    user_id: userId,
    license_type: session.licenseType,
    mode: session.mode,
    format: session.format ?? 'practice_questions',
    topic: 'General Review',
    questions: session.questions as unknown as Record<string, unknown>[],
    results: session.results as unknown as Record<string, unknown>[],
    started_at: session.startedAt,
    completed_at: session.completedAt,
    score: session.score,
  });
}

export async function getQuizSessionsAsync(
  userId: string,
  licenseType?: LicenseType,
  limit = 10,
): Promise<QuizSession[]> {
  let query = supabase
    .from('exam_prep_quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (licenseType) {
    query = query.eq('license_type', licenseType);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    licenseType: row.license_type as LicenseType,
    mode: row.mode as 'study' | 'test',
    format: (row.format ?? 'practice_questions') as 'practice_questions' | 'clinical_vignette',
    questions: row.questions as unknown as QuizSession['questions'],
    results: row.results as unknown as QuizSession['results'],
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    score: row.score ?? undefined,
  }));
}

// ─── Weak Area Assessments (Supabase + localStorage fallback) ───────────

export function getAssessments(): WeakAreaAssessmentResult[] {
  return getLocal<WeakAreaAssessmentResult[]>(STORAGE_KEYS.ASSESSMENTS, []);
}

export function saveAssessment(result: WeakAreaAssessmentResult): void {
  const assessments = getAssessments();
  assessments.unshift(result);
  setLocal(STORAGE_KEYS.ASSESSMENTS, assessments);
}

export async function saveAssessmentAsync(
  userId: string,
  result: WeakAreaAssessmentResult,
  licenseType: LicenseType,
): Promise<string | null> {
  const { data } = await supabase
    .from('exam_prep_assessments')
    .insert({
      user_id: userId,
      license_type: licenseType,
      ratings: result.ratings as unknown as Record<string, unknown>[],
      weak_areas: result.weakAreas,
      strong_areas: result.strongAreas,
      suggested_plan: result.suggestedPlan as unknown as Record<string, unknown>,
    })
    .select('id')
    .single();
  // Also save to localStorage as fallback
  saveAssessment(result);
  return data?.id ?? null;
}

export async function getAssessmentsAsync(
  userId: string,
  licenseType?: LicenseType,
): Promise<WeakAreaAssessmentResult[]> {
  let query = supabase
    .from('exam_prep_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (licenseType) {
    query = query.eq('license_type', licenseType);
  }

  const { data, error } = await query;
  if (error || !data) return getAssessments(); // fallback to localStorage

  return data.map((row) => ({
    ratings: row.ratings as unknown as WeakAreaAssessmentResult['ratings'],
    weakAreas: row.weak_areas ?? [],
    strongAreas: row.strong_areas ?? [],
    suggestedPlan: row.suggested_plan as unknown as WeakAreaAssessmentResult['suggestedPlan'],
  }));
}

// ─── Active Study Plan (Supabase) ────────────────────────────────────────

export interface ActivePlanData {
  id: string;
  licenseType: LicenseType;
  suggestedPlan: StudyPlan | null;
  weakAreas: string[];
  strongAreas: string[];
  completedWeeks: number[];
  createdAt: string;
}

export async function getLatestAssessmentAsync(
  userId: string,
  licenseType?: LicenseType,
): Promise<ActivePlanData | null> {
  let query = supabase
    .from('exam_prep_assessments')
    .select('id, license_type, suggested_plan, weak_areas, strong_areas, completed_weeks, created_at')
    .eq('user_id', userId)
    .not('suggested_plan', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (licenseType) {
    query = query.eq('license_type', licenseType);
  }

  const { data, error } = await query;
  if (error || !data) return null;

  return {
    id: data.id,
    licenseType: data.license_type as LicenseType,
    suggestedPlan: data.suggested_plan as unknown as StudyPlan | null,
    weakAreas: data.weak_areas ?? [],
    strongAreas: data.strong_areas ?? [],
    completedWeeks: (data as any).completed_weeks ?? [],
    createdAt: data.created_at,
  };
}

export async function toggleWeekCompleted(
  assessmentId: string,
  weekNumber: number,
): Promise<number[]> {
  // Read current completed weeks
  const { data } = await supabase
    .from('exam_prep_assessments')
    .select('completed_weeks')
    .eq('id', assessmentId)
    .single();

  const current: number[] = (data as any)?.completed_weeks ?? [];
  const updated = current.includes(weekNumber)
    ? current.filter((w) => w !== weekNumber)
    : [...current, weekNumber];

  await supabase
    .from('exam_prep_assessments')
    .update({ completed_weeks: updated })
    .eq('id', assessmentId);

  return updated;
}

// ─── Domain Scores (Supabase) ───────────────────────────────────────────

export interface DomainScoreRow {
  domainId: string;
  domainName: string;
  totalQuestions: number;
  correctAnswers: number;
  lastQuizAt: string;
}

export async function getDomainScores(
  userId: string,
  licenseType: LicenseType,
): Promise<DomainScoreRow[]> {
  const { data, error } = await supabase
    .from('exam_prep_domain_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('license_type', licenseType);

  if (error || !data) return [];

  return data.map((row) => ({
    domainId: row.domain_id,
    domainName: row.domain_name,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    lastQuizAt: row.last_quiz_at,
  }));
}

export async function saveDomainScores(
  userId: string,
  licenseType: LicenseType,
  scores: { domainId: string; domainName: string; correct: number; total: number }[],
): Promise<void> {
  // Upsert each domain score — accumulate totals
  for (const score of scores) {
    // Try to read existing first
    const { data: existing } = await supabase
      .from('exam_prep_domain_scores')
      .select('total_questions, correct_answers')
      .eq('user_id', userId)
      .eq('license_type', licenseType)
      .eq('domain_id', score.domainId)
      .single();

    if (existing) {
      await supabase
        .from('exam_prep_domain_scores')
        .update({
          total_questions: existing.total_questions + score.total,
          correct_answers: existing.correct_answers + score.correct,
          last_quiz_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('license_type', licenseType)
        .eq('domain_id', score.domainId);
    } else {
      await supabase.from('exam_prep_domain_scores').insert({
        user_id: userId,
        license_type: licenseType,
        domain_id: score.domainId,
        domain_name: score.domainName,
        total_questions: score.total,
        correct_answers: score.correct,
        last_quiz_at: new Date().toISOString(),
      });
    }
  }
}

// ─── Recent Config (localStorage) ──────────────────────────────────────

export function getRecentConfig(): Record<string, unknown> | null {
  return getLocal<Record<string, unknown> | null>(STORAGE_KEYS.RECENT_CONFIG, null);
}

export function saveRecentConfig(config: Record<string, unknown>): void {
  setLocal(STORAGE_KEYS.RECENT_CONFIG, config);
}
