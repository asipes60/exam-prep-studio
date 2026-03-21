import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  LicenseType,
  StudyFormat,
  GeneratorConfig,
  GeneratedContent,
  SavedMaterial,
  Folder,
  QuizSession,
  StudyMode,
} from '@/types/exam-prep';
import * as storage from '@/lib/exam-prep-storage';
import { generateStudyMaterial } from '@/lib/exam-prep-ai';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

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

  // Load saved materials and folders from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setSavedMaterials([]);
      setFolders([]);
      return;
    }
    storage.getSavedMaterialsAsync().then(setSavedMaterials).catch(() => {});
    storage.getFoldersAsync().then(setFolders).catch(() => {});
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
    } catch (err: any) {
      console.error('Generation failed:', err);
      toast.error(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id]);

  const handleSaveMaterial = useCallback((material: SavedMaterial) => {
    // Optimistic update
    setSavedMaterials((prev) => {
      const idx = prev.findIndex((m) => m.id === material.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...material, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [material, ...prev];
    });
    // Persist to Supabase
    storage.saveMaterialAsync(material).catch(() => {
      toast.error('Failed to save material');
    });
  }, []);

  const handleDeleteMaterial = useCallback((id: string) => {
    setSavedMaterials((prev) => prev.filter((m) => m.id !== id));
    storage.deleteMaterialAsync(id).catch(() => {
      toast.error('Failed to delete material');
    });
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setSavedMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
    storage.toggleFavoriteAsync(id).catch(() => {
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
    }).catch(() => {
      toast.error('Failed to create folder');
    });
    return tempFolder;
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setSavedMaterials((prev) =>
      prev.map((m) => (m.folderId === id ? { ...m, folderId: undefined } : m))
    );
    storage.deleteFolderAsync(id).catch(() => {
      toast.error('Failed to delete folder');
    });
  }, []);

  const refreshSavedMaterials = useCallback(() => {
    storage.getSavedMaterialsAsync().then(setSavedMaterials).catch(() => {});
    storage.getFoldersAsync().then(setFolders).catch(() => {});
  }, []);

  return (
    <ExamPrepContext.Provider
      value={{
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
      }}
    >
      {children}
    </ExamPrepContext.Provider>
  );
}

export function useExamPrep(): ExamPrepState {
  const ctx = useContext(ExamPrepContext);
  if (!ctx) throw new Error('useExamPrep must be used within ExamPrepProvider');
  return ctx;
}
