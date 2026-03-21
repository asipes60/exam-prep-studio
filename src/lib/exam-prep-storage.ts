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

// ─── Quiz Sessions (localStorage — not worth migrating yet) ─────────────

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

// ─── Weak Area Assessments (localStorage) ───────────────────────────────

export function getAssessments(): WeakAreaAssessmentResult[] {
  return getLocal<WeakAreaAssessmentResult[]>(STORAGE_KEYS.ASSESSMENTS, []);
}

export function saveAssessment(result: WeakAreaAssessmentResult): void {
  const assessments = getAssessments();
  assessments.unshift(result);
  setLocal(STORAGE_KEYS.ASSESSMENTS, assessments);
}

// ─── Recent Config (localStorage) ──────────────────────────────────────

export function getRecentConfig(): Record<string, unknown> | null {
  return getLocal<Record<string, unknown> | null>(STORAGE_KEYS.RECENT_CONFIG, null);
}

export function saveRecentConfig(config: Record<string, unknown>): void {
  setLocal(STORAGE_KEYS.RECENT_CONFIG, config);
}
