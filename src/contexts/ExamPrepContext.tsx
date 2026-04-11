import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type {
  LicenseType,
  StudyFormat,
  GeneratorConfig,
  GeneratedContent,
  SavedMaterial,
  Folder,
  QuizSession,
  StudyMode,
  StudyPlan,
} from '@/types/exam-prep';
import * as storage from '@/lib/exam-prep-storage';
import { generateStudyMaterial } from '@/lib/exam-prep-ai';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { DomainScoreRow } from '@/lib/exam-prep-storage';

interface ExamPrepState {
  // Generator
  selectedLicense: LicenseType | null;
  setSelectedLicense: (license: LicenseType | null) => void;
  generatorConfig: Partial<GeneratorConfig>;
  updateGeneratorConfig: (updates: Partial<GeneratorConfig>) => void;
  generatedContent: GeneratedContent | null;
  isGenerating: boolean;
  generateContent: (config: GeneratorConfig) => Promise<void>;
  latestAuditEntryId: string | null;

  // Pending generation (set by assessment, consumed by generator)
  pendingConfig: GeneratorConfig | null;
  setPendingConfig: (config: GeneratorConfig | null) => void;

  // Saved Materials
  savedMaterials: SavedMaterial[];
  folders: Folder[];
  saveMaterial: (material: SavedMaterial) => void;
  deleteMaterial: (id: string) => void;
  toggleFavorite: (id: string) => void;
  createFolder: (name: string) => Folder;
  deleteFolder: (id: string) => void;
  refreshSavedMaterials: () => void;

  // Study Plan
  activePlan: { id: string; plan: StudyPlan; licenseType: LicenseType; createdAt: string; completedWeeks: number[] } | null;
  loadActivePlan: () => Promise<void>;
  planLoading: boolean;

  // Weak areas (derived from domain scores)
  weakAreas: string[];

  // Quiz
  activeQuiz: QuizSession | null;
  setActiveQuiz: (quiz: QuizSession | null) => void;
  studyMode: StudyMode;
  setStudyMode: (mode: StudyMode) => void;
}

const ExamPrepContext = createContext<ExamPrepState | null>(null);

export function ExamPrepProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null);
  const [generatorConfig, setGeneratorConfig] = useState<Partial<GeneratorConfig>>({});
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestAuditEntryId, setLatestAuditEntryId] = useState<string | null>(null);
  const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('study');
  const [pendingConfig, setPendingConfig] = useState<GeneratorConfig | null>(null);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [activePlan, setActivePlan] = useState<ExamPrepState['activePlan']>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Load active study plan when user or license changes
  const loadActivePlan = useCallback(async () => {
    if (!user) {
      setActivePlan(null);
      return;
    }
    setPlanLoading(true);
    try {
      const data = await storage.getLatestAssessmentAsync(user.id, selectedLicense ?? undefined);
      if (data?.suggestedPlan) {
        setActivePlan({
          id: data.id,
          plan: data.suggestedPlan,
          licenseType: data.licenseType,
          createdAt: data.createdAt,
          completedWeeks: data.completedWeeks,
        });
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      console.warn('Failed to load active plan:', err);
      setActivePlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [user, selectedLicense]);

  useEffect(() => {
    loadActivePlan();
  }, [loadActivePlan]);

  // Load weak areas from domain scores when license or user changes
  useEffect(() => {
    if (!user || !selectedLicense) {
      setWeakAreas([]);
      return;
    }
    storage.getDomainScores(user.id, selectedLicense).then((scores) => {
      const weak = scores
        .filter((s) => s.totalQuestions > 0 && (s.correctAnswers / s.totalQuestions) < 0.6)
        .map((s) => s.domainName);
      setWeakAreas(weak);
    }).catch((err) => console.warn('Failed to load domain scores:', err));
  }, [user, selectedLicense]);

  // Load saved materials and folders from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setSavedMaterials([]);
      setFolders([]);
      return;
    }
    storage.getSavedMaterialsAsync().then(setSavedMaterials).catch((err) => console.warn('Failed to load materials:', err));
    storage.getFoldersAsync().then(setFolders).catch((err) => console.warn('Failed to load folders:', err));
  }, [user]);

  const updateGeneratorConfig = useCallback((updates: Partial<GeneratorConfig>) => {
    setGeneratorConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const generateContent = useCallback(async (config: GeneratorConfig) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setLatestAuditEntryId(null);
    try {
      const result = await generateStudyMaterial(config, user?.id);
      setGeneratedContent(result.content);
      setLatestAuditEntryId(result.auditEntryId);
    } catch (err: unknown) {
      console.error('Generation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id]);

  const handleSaveMaterial = useCallback((material: SavedMaterial) => {
    // Capture previous state for rollback
    let previousMaterials: SavedMaterial[] = [];
    setSavedMaterials((prev) => {
      previousMaterials = prev;
      const idx = prev.findIndex((m) => m.id === material.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...material, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [material, ...prev];
    });
    // Persist to Supabase — rollback on failure
    storage.saveMaterialAsync(material).catch((err) => {
      console.warn('Failed to save material:', err);
      setSavedMaterials(previousMaterials);
      toast.error('Failed to save material');
    });
  }, []);

  const handleDeleteMaterial = useCallback((id: string) => {
    let previousMaterials: SavedMaterial[] = [];
    setSavedMaterials((prev) => {
      previousMaterials = prev;
      return prev.filter((m) => m.id !== id);
    });
    storage.deleteMaterialAsync(id).catch((err) => {
      console.warn('Failed to delete material:', err);
      setSavedMaterials(previousMaterials);
      toast.error('Failed to delete material');
    });
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    let previousMaterials: SavedMaterial[] = [];
    setSavedMaterials((prev) => {
      previousMaterials = prev;
      return prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
    });
    storage.toggleFavoriteAsync(id).catch((err) => {
      console.warn('Failed to update favorite:', err);
      setSavedMaterials(previousMaterials);
      toast.error('Failed to update favorite');
    });
  }, []);

  const handleCreateFolder = useCallback((name: string) => {
    const tempFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      materialCount: 0,
    };
    setFolders((prev) => [tempFolder, ...prev]);
    // Create in Supabase (will use real ID on next refresh)
    storage.createFolderAsync(name).then((folder) => {
      setFolders((prev) => prev.map((f) => (f.id === tempFolder.id ? folder : f)));
    }).catch((err) => {
      console.warn('Failed to create folder:', err);
      setFolders((prev) => prev.filter((f) => f.id !== tempFolder.id));
      toast.error('Failed to create folder');
    });
    return tempFolder;
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    let previousFolders: Folder[] = [];
    let previousMaterials: SavedMaterial[] = [];
    setFolders((prev) => {
      previousFolders = prev;
      return prev.filter((f) => f.id !== id);
    });
    setSavedMaterials((prev) => {
      previousMaterials = prev;
      return prev.map((m) => (m.folderId === id ? { ...m, folderId: undefined } : m));
    });
    storage.deleteFolderAsync(id).catch((err) => {
      console.warn('Failed to delete folder:', err);
      setFolders(previousFolders);
      setSavedMaterials(previousMaterials);
      toast.error('Failed to delete folder');
    });
  }, []);

  const refreshSavedMaterials = useCallback(() => {
    storage.getSavedMaterialsAsync().then(setSavedMaterials).catch((err) => console.warn('Failed to refresh materials:', err));
    storage.getFoldersAsync().then(setFolders).catch((err) => console.warn('Failed to refresh folders:', err));
  }, []);

  const value = useMemo<ExamPrepState>(() => ({
    selectedLicense,
    setSelectedLicense,
    generatorConfig,
    updateGeneratorConfig,
    generatedContent,
    isGenerating,
    generateContent,
    latestAuditEntryId,
    pendingConfig,
    setPendingConfig,
    activePlan,
    loadActivePlan,
    planLoading,
    weakAreas,
    savedMaterials,
    folders,
    saveMaterial: handleSaveMaterial,
    deleteMaterial: handleDeleteMaterial,
    toggleFavorite: handleToggleFavorite,
    createFolder: handleCreateFolder,
    deleteFolder: handleDeleteFolder,
    refreshSavedMaterials,
    activeQuiz,
    setActiveQuiz,
    studyMode,
    setStudyMode,
  }), [
    selectedLicense,
    generatorConfig,
    generatedContent,
    isGenerating,
    generateContent,
    latestAuditEntryId,
    pendingConfig,
    activePlan,
    loadActivePlan,
    planLoading,
    weakAreas,
    savedMaterials,
    folders,
    handleSaveMaterial,
    handleDeleteMaterial,
    handleToggleFavorite,
    handleCreateFolder,
    handleDeleteFolder,
    refreshSavedMaterials,
    activeQuiz,
    studyMode,
    updateGeneratorConfig,
  ]);

  return (
    <ExamPrepContext.Provider value={value}>
      {children}
    </ExamPrepContext.Provider>
  );
}

export function useExamPrep(): ExamPrepState {
  const ctx = useContext(ExamPrepContext);
  if (!ctx) throw new Error('useExamPrep must be used within ExamPrepProvider');
  return ctx;
}
