import React, { createContext, useContext, useState, useCallback } from 'react';
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
  const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>(() => storage.getSavedMaterials());
  const [folders, setFolders] = useState<Folder[]>(() => storage.getFolders());
  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('study');

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
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id]);

  const handleSaveMaterial = useCallback((material: SavedMaterial) => {
    storage.saveMaterial(material);
    setSavedMaterials(storage.getSavedMaterials());
  }, []);

  const handleDeleteMaterial = useCallback((id: string) => {
    storage.deleteMaterial(id);
    setSavedMaterials(storage.getSavedMaterials());
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    storage.toggleFavorite(id);
    setSavedMaterials(storage.getSavedMaterials());
  }, []);

  const handleCreateFolder = useCallback((name: string) => {
    const folder = storage.createFolder(name);
    setFolders(storage.getFolders());
    return folder;
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    storage.deleteFolder(id);
    setFolders(storage.getFolders());
    setSavedMaterials(storage.getSavedMaterials());
  }, []);

  const refreshSavedMaterials = useCallback(() => {
    setSavedMaterials(storage.getSavedMaterials());
    setFolders(storage.getFolders());
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
