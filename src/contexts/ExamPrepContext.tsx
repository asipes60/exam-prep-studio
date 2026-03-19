import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  LicenseType,
  StudyFormat,
  GeneratorConfig,
  GeneratedContent,
  SavedMaterial,
  Folder,
  UserProfile,
  QuizSession,
  StudyMode,
} from '@/types/exam-prep';
import * as storage from '@/lib/exam-prep-storage';
import { generateStudyMaterial } from '@/lib/exam-prep-ai';

interface ExamPrepState {
  // User
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  loginAsGuest: () => void;
  logout: () => void;

  // Generator
  selectedLicense: LicenseType | null;
  setSelectedLicense: (license: LicenseType | null) => void;
  generatorConfig: Partial<GeneratorConfig>;
  updateGeneratorConfig: (updates: Partial<GeneratorConfig>) => void;
  generatedContent: GeneratedContent | null;
  isGenerating: boolean;
  generateContent: (config: GeneratorConfig) => Promise<void>;

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
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser());
  const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null);
  const [generatorConfig, setGeneratorConfig] = useState<Partial<GeneratorConfig>>({});
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>(() => storage.getSavedMaterials());
  const [folders, setFolders] = useState<Folder[]>(() => storage.getFolders());
  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('study');

  const isAuthenticated = user !== null;

  const login = useCallback((email: string, _password: string) => {
    // TODO: Replace with real auth (Firebase/Supabase)
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      isGuest: false,
    };
    storage.saveUser(profile);
    setUser(profile);
  }, []);

  const signup = useCallback((name: string, email: string, _password: string) => {
    // TODO: Replace with real auth
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date().toISOString(),
      isGuest: false,
    };
    storage.saveUser(profile);
    setUser(profile);
  }, []);

  const loginAsGuest = useCallback(() => {
    const guest = storage.createGuestUser();
    setUser(guest);
  }, []);

  const logout = useCallback(() => {
    storage.clearUser();
    setUser(null);
  }, []);

  const updateGeneratorConfig = useCallback((updates: Partial<GeneratorConfig>) => {
    setGeneratorConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const generateContent = useCallback(async (config: GeneratorConfig) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const content = await generateStudyMaterial(config);
      setGeneratedContent(content);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

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
        user,
        isAuthenticated,
        login,
        signup,
        loginAsGuest,
        logout,
        selectedLicense,
        setSelectedLicense,
        generatorConfig,
        updateGeneratorConfig,
        generatedContent,
        isGenerating,
        generateContent,
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
