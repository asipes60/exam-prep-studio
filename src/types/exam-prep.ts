// EduCare Exam Prep Studio - Type Definitions

export type LicenseType = 'LPCC' | 'LMFT' | 'LCSW' | 'LAW_ETHICS';

export type StudyFormat =
  | 'practice_questions'
  | 'clinical_vignette'
  | 'flashcards'
  | 'study_guide'
  | 'quick_reference'
  | 'study_plan';

// Legacy formats from removed study modes — kept for backward compat with
// saved materials and seed study plan data. Not selectable in the UI.
export type LegacyStudyFormat =
  | 'scenario_questions'
  | 'mini_quiz'
  | 'mock_exam'
  | 'law_ethics_spotter'
  | 'rationale_review';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'exam_level';

export type StudyMode = 'study' | 'test';

export interface ExamInfo {
  id: LicenseType;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  categories: TopicCategory[];
}

export interface TopicCategory {
  id: string;
  name: string;
  topics: string[];
}

export interface GeneratorConfig {
  licenseType: LicenseType;
  studyFormat: StudyFormat;
  topic: string;
  difficulty: DifficultyLevel;
  itemCount: number;
  includeRationales: boolean;
  californiaEmphasis: boolean;
  isBeginnerReview: boolean;
  customPrompt?: string;
  questionsPerVignette?: number;
}

export interface PracticeQuestion {
  id: string;
  stem: string;
  choices: { label: string; text: string }[];
  correctAnswer: string;
  rationale: string;
  incorrectRationales: { label: string; explanation: string }[];
  topic: string;
  difficulty: DifficultyLevel;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  topic: string;
}

export interface StudyGuideSection {
  id: string;
  title: string;
  overview: string;
  keyTerms: { term: string; definition: string }[];
  practicalTakeaways: string[];
  commonExamTraps: string[];
  memoryAids: string[];
}

export interface StudyGuide {
  id: string;
  title: string;
  topic: string;
  sections: StudyGuideSection[];
}

export interface QuickReference {
  id: string;
  title: string;
  topic: string;
  items: { heading: string; content: string }[];
}

export interface StudyPlan {
  id: string;
  title: string;
  licenseType: LicenseType;
  timeHorizon: string;
  weeklyPlan: {
    week: number;
    focus: string;
    materialTypes: (StudyFormat | LegacyStudyFormat)[];
    reviewCadence: string;
    practiceFrequency: string;
    topics: string[];
  }[];
  weakAreas: string[];
}

export interface ClinicalVignetteQuestion {
  questionText: string;
  competencyArea: string;
  choices: { label: string; text: string }[];
  correctAnswer: string;
  rationale: string;
  incorrectRationales: { label: string; explanation: string }[];
}

// ─── NCMHCE Two-Phase Simulation Types ──────────────────────────────

export type IGActionRating = 'most_productive' | 'productive' | 'unproductive' | 'counterproductive';

/** An action the candidate can select during Information Gathering */
export interface IGAction {
  id: string;
  text: string;
  rating: IGActionRating;
  rationale: string;
}

/** A decision point in the Decision Making phase */
export interface DMDecisionPoint {
  id: string;
  questionText: string;
  competencyArea: string;
  choices: { label: string; text: string }[];
  correctAnswer: string;
  rationale: string;
  incorrectRationales: { label: string; explanation: string }[];
}

/** Information Gathering phase for an NCMHCE simulation */
export interface IGPhase {
  prompt: string;
  actions: IGAction[];
}

/** Decision Making phase for an NCMHCE simulation */
export interface DMPhase {
  prompt: string;
  decisionPoints: DMDecisionPoint[];
}

export interface ClinicalVignette {
  id: string;
  clientPresentation: string;
  demographics: string;
  presentingProblem: string;
  relevantHistory: string;
  /** Legacy: flat question list (used when igPhase/dmPhase are absent) */
  questions: ClinicalVignetteQuestion[];
  /** NCMHCE two-phase: Information Gathering */
  igPhase?: IGPhase;
  /** NCMHCE two-phase: Decision Making */
  dmPhase?: DMPhase;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  /** For IG actions: the rating of the selected action */
  igRating?: IGActionRating;
}

export interface QuizSession {
  id: string;
  licenseType: LicenseType;
  mode: StudyMode;
  format: 'practice_questions' | 'clinical_vignette';
  questions: PracticeQuestion[];
  vignettes?: ClinicalVignette[];
  results: QuizResult[];
  startedAt: string;
  completedAt?: string;
  score?: number;
}

/** Maps license type to the real exam format */
export function getExamFormat(license: LicenseType): 'practice_questions' | 'clinical_vignette' {
  return license === 'LPCC' ? 'clinical_vignette' : 'practice_questions';
}

export type GeneratedContent =
  | { type: 'practice_questions'; data: PracticeQuestion[] }
  | { type: 'clinical_vignette'; data: ClinicalVignette[] }
  | { type: 'flashcards'; data: Flashcard[] }
  | { type: 'study_guide'; data: StudyGuide }
  | { type: 'quick_reference'; data: QuickReference }
  | { type: 'study_plan'; data: StudyPlan };

export interface SavedMaterial {
  id: string;
  name: string;
  licenseType: LicenseType;
  studyFormat: StudyFormat;
  topic: string;
  content: GeneratedContent;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  folderId?: string;
  tags: string[];
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  materialCount: number;
}

export interface WeakAreaRating {
  categoryId: string;
  categoryName: string;
  rating: number; // 1-5, 1 = very weak, 5 = very strong
}

export interface WeakAreaAssessmentResult {
  ratings: WeakAreaRating[];
  weakAreas: string[];
  strongAreas: string[];
  suggestedPlan?: StudyPlan;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferredLicense?: LicenseType;
  createdAt: string;
  isGuest: boolean;
}

// ─── Dashboard Types ────────────────────────────────────────────────────

export interface DomainScore {
  domainId: string;
  domainName: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  isWeak: boolean;   // < 60%
  isStrong: boolean; // >= 80%
}

export interface DashboardData {
  domainScores: DomainScore[];
  readinessScore: number;
  totalQuizzes: number;
  totalQuestions: number;
  weakAreas: string[];
  strongAreas: string[];
  recentQuizzes: { id: string; score: number; total: number; date: string; licenseType: LicenseType }[];
}

// Admin-ready interfaces for future expansion
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  usageLimits: {
    generationsPerDay: number;
    savedMaterials: number;
    exportEnabled: boolean;
  };
}

export interface UsageMetrics {
  userId: string;
  generationsToday: number;
  totalGenerations: number;
  savedMaterialsCount: number;
  lastActive: string;
}
