// EduCare Exam Prep Studio - Local Storage Utilities
// TODO: Replace with Firebase/Supabase backend for production

import type {
  SavedMaterial,
  Folder,
  UserProfile,
  QuizSession,
  WeakAreaAssessmentResult,
  LicenseType,
  StudyFormat,
} from '@/types/exam-prep';

const STORAGE_KEYS = {
  MATERIALS: 'educare_exam_prep_materials',
  FOLDERS: 'educare_exam_prep_folders',
  USER: 'educare_exam_prep_user',
  QUIZ_SESSIONS: 'educare_exam_prep_quizzes',
  ASSESSMENTS: 'educare_exam_prep_assessments',
  RECENT_CONFIG: 'educare_exam_prep_recent_config',
} as const;

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

// ─── User Profile ───────────────────────────────────────────────────────

export function getUser(): UserProfile | null {
  return getItem<UserProfile | null>(STORAGE_KEYS.USER, null);
}

export function saveUser(user: UserProfile): void {
  setItem(STORAGE_KEYS.USER, user);
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function createGuestUser(): UserProfile {
  const guest: UserProfile = {
    id: `guest-${Date.now()}`,
    email: '',
    name: 'Guest User',
    createdAt: new Date().toISOString(),
    isGuest: true,
  };
  saveUser(guest);
  return guest;
}

// ─── Saved Materials ────────────────────────────────────────────────────

export function getSavedMaterials(): SavedMaterial[] {
  return getItem<SavedMaterial[]>(STORAGE_KEYS.MATERIALS, []);
}

export function saveMaterial(material: SavedMaterial): void {
  const materials = getSavedMaterials();
  const idx = materials.findIndex((m) => m.id === material.id);
  if (idx >= 0) {
    materials[idx] = { ...material, updatedAt: new Date().toISOString() };
  } else {
    materials.unshift(material);
  }
  setItem(STORAGE_KEYS.MATERIALS, materials);
}

export function deleteMaterial(id: string): void {
  const materials = getSavedMaterials().filter((m) => m.id !== id);
  setItem(STORAGE_KEYS.MATERIALS, materials);
}

export function toggleFavorite(id: string): void {
  const materials = getSavedMaterials();
  const idx = materials.findIndex((m) => m.id === id);
  if (idx >= 0) {
    materials[idx].isFavorite = !materials[idx].isFavorite;
    setItem(STORAGE_KEYS.MATERIALS, materials);
  }
}

export function searchMaterials(
  query: string,
  filters?: { licenseType?: LicenseType; studyFormat?: StudyFormat; folderId?: string; favoritesOnly?: boolean }
): SavedMaterial[] {
  let materials = getSavedMaterials();
  if (filters?.licenseType) materials = materials.filter((m) => m.licenseType === filters.licenseType);
  if (filters?.studyFormat) materials = materials.filter((m) => m.studyFormat === filters.studyFormat);
  if (filters?.folderId) materials = materials.filter((m) => m.folderId === filters.folderId);
  if (filters?.favoritesOnly) materials = materials.filter((m) => m.isFavorite);
  if (query.trim()) {
    const q = query.toLowerCase();
    materials = materials.filter(
      (m) => m.name.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return materials;
}

// ─── Folders ────────────────────────────────────────────────────────────

export function getFolders(): Folder[] {
  return getItem<Folder[]>(STORAGE_KEYS.FOLDERS, []);
}

export function createFolder(name: string): Folder {
  const folder: Folder = {
    id: `folder-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    materialCount: 0,
  };
  const folders = getFolders();
  folders.unshift(folder);
  setItem(STORAGE_KEYS.FOLDERS, folders);
  return folder;
}

export function deleteFolder(id: string): void {
  setItem(STORAGE_KEYS.FOLDERS, getFolders().filter((f) => f.id !== id));
  // Unassign materials from deleted folder
  const materials = getSavedMaterials().map((m) => (m.folderId === id ? { ...m, folderId: undefined } : m));
  setItem(STORAGE_KEYS.MATERIALS, materials);
}

export function moveMaterialToFolder(materialId: string, folderId: string | undefined): void {
  const materials = getSavedMaterials();
  const idx = materials.findIndex((m) => m.id === materialId);
  if (idx >= 0) {
    materials[idx].folderId = folderId;
    setItem(STORAGE_KEYS.MATERIALS, materials);
  }
}

// ─── Quiz Sessions ──────────────────────────────────────────────────────

export function getQuizSessions(): QuizSession[] {
  return getItem<QuizSession[]>(STORAGE_KEYS.QUIZ_SESSIONS, []);
}

export function saveQuizSession(session: QuizSession): void {
  const sessions = getQuizSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  setItem(STORAGE_KEYS.QUIZ_SESSIONS, sessions);
}

// ─── Weak Area Assessments ──────────────────────────────────────────────

export function getAssessments(): WeakAreaAssessmentResult[] {
  return getItem<WeakAreaAssessmentResult[]>(STORAGE_KEYS.ASSESSMENTS, []);
}

export function saveAssessment(result: WeakAreaAssessmentResult): void {
  const assessments = getAssessments();
  assessments.unshift(result);
  setItem(STORAGE_KEYS.ASSESSMENTS, assessments);
}

// ─── Recent Config ──────────────────────────────────────────────────────

export function getRecentConfig(): Record<string, unknown> | null {
  return getItem<Record<string, unknown> | null>(STORAGE_KEYS.RECENT_CONFIG, null);
}

export function saveRecentConfig(config: Record<string, unknown>): void {
  setItem(STORAGE_KEYS.RECENT_CONFIG, config);
}
