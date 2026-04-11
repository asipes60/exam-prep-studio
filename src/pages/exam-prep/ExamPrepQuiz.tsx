import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { useAuth } from '@/hooks/use-auth';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { generateQuizBatches } from '@/lib/exam-prep-ai';
import { saveQuizSession, saveQuizSessionAsync, saveDomainScores } from '@/lib/exam-prep-storage';
import { computeDomainScoresFromQuiz } from '@/lib/domain-mapping';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  LicenseType,
  PracticeQuestion,
  ClinicalVignette,
  ClinicalVignetteQuestion,
  IGAction,
  IGActionRating,
  DMDecisionPoint,
  QuizSession,
  QuizResult,
  StudyMode,
} from '@/types/exam-prep';
import { getExamFormat } from '@/types/exam-prep';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Timer,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type QuizState = 'setup' | 'active' | 'review';
type SimPhase = 'ig' | 'dm';

/** Check if a vignette uses the two-phase NCMHCE format */
function hasTwoPhase(v: ClinicalVignette): boolean {
  return !!(v.igPhase && v.dmPhase && v.igPhase.actions.length > 0 && v.dmPhase.decisionPoints.length > 0);
}

/** IG action rating display config */
const IG_RATING_CONFIG: Record<IGActionRating, { label: string; color: string; bgColor: string; points: number }> = {
  most_productive: { label: 'Most Productive', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', points: 3 },
  productive: { label: 'Productive', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', points: 2 },
  unproductive: { label: 'Unproductive', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', points: 0 },
  counterproductive: { label: 'Counterproductive', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', points: -1 },
};

/** Flatten vignettes into a linear question list for quiz navigation (legacy format) */
function flattenVignetteQuestions(
  vignettes: ClinicalVignette[],
): { question: ClinicalVignetteQuestion; vignetteIdx: number }[] {
  const flat: { question: ClinicalVignetteQuestion; vignetteIdx: number }[] = [];
  vignettes.forEach((v, vi) => {
    v.questions.forEach((q) => {
      flat.push({ question: q, vignetteIdx: vi });
    });
  });
  return flat;
}

// ─── Question count options ─────────────────────────────────────────────

function getQuestionCountOptions(
  license: LicenseType,
  isPro: boolean,
): { value: number; label: string; vignetteCount?: number; qPerVignette?: number }[] {
  const format = getExamFormat(license);

  if (format === 'clinical_vignette') {
    // LPCC / NCMHCE — vignette-based
    const options = isPro
      ? [
          { value: 25, label: '1 Vignette (25 Qs)', vignetteCount: 1, qPerVignette: 25 },
          { value: 50, label: '2 Vignettes (50 Qs)', vignetteCount: 2, qPerVignette: 25 },
          { value: 75, label: '3 Vignettes (75 Qs)', vignetteCount: 3, qPerVignette: 25 },
        ]
      : [{ value: 10, label: '1 Vignette (10 Qs)', vignetteCount: 1, qPerVignette: 10 }];
    return options;
  }

  // MCQ-based exams
  return isPro
    ? [
        { value: 25, label: '25 Questions' },
        { value: 50, label: '50 Questions' },
        { value: 75, label: '75 Questions' },
      ]
    : [{ value: 10, label: '10 Questions' }];
}

// ─── Track-specific tips ────────────────────────────────────────────────
const TRACK_TIPS: Record<LicenseType, { title: string; tips: string[] }> = {
  LPCC: {
    title: 'NCMHCE Simulation Tips',
    tips: [
      'The NCMHCE uses clinical simulations, not standard MCQs — practice with the two-phase format',
      'In Information Gathering, select only what is clinically necessary. "Less is more" — unnecessary actions lose points',
      'Decision Making tests clinical judgment under ambiguity. The "most correct" answer may not be the "ideal" answer',
      'Focus on: DSM-5-TR diagnosis, treatment selection, risk assessment, and ethical decision-making',
    ],
  },
  LMFT: {
    title: 'California MFT Clinical Exam Tips',
    tips: [
      'Know the systemic theories cold: Structural (Minuchin), Strategic (Haley), Bowenian, EFT (Johnson), Gottman, Narrative, SFBT',
      'Questions emphasize relational and systemic thinking — avoid individually-focused answers',
      'Expect scenario-based questions where you must identify the correct theory or intervention',
      'Crisis management and domestic violence protocols are heavily tested',
    ],
  },
  LCSW: {
    title: 'ASWB Clinical Exam Tips',
    tips: [
      'Think through the Person-in-Environment (PIE) lens — social work values permeate every answer',
      'NASW Code of Ethics is the single most tested content area. Know specific standards, not just principles',
      'Domain weights matter: Assessment/Diagnosis (30%) > Interventions (27%) > Human Development (24%) > Ethics (19%)',
      'The exam uses three-option (A/B/C) format as of 2025 — no process of elimination with 4 choices',
    ],
  },
  LAW_ETHICS: {
    title: 'California Law & Ethics Tips',
    tips: [
      'Know the difference between mandatory and permissive reporting obligations',
      'Tarasoff, CANRA, elder abuse reporting, and LPS Act are the highest-yield topics',
      'Understand where California law differs from federal law (HIPAA) and other states',
      'Ethics code differences matter: NASW (LCSW) vs. AAMFT/CAMFT (LMFT) vs. ACA (LPCC)',
    ],
  },
};

export default function ExamPrepQuiz() {
  const { selectedLicense, setSelectedLicense, studyMode, setStudyMode } = useExamPrep();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPro = user?.subscriptionStatus === 'pro';

  const [state, setState] = useState<QuizState>('setup');
  const [license, setLicense] = useState<LicenseType | null>(selectedLicense);
  const [questionCount, setQuestionCount] = useState(isPro ? 25 : 10);
  const [mode, setMode] = useState<StudyMode>(studyMode);

  // MCQ state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  // Vignette state
  const [vignettes, setVignettes] = useState<ClinicalVignette[]>([]);
  const [flatQuestions, setFlatQuestions] = useState<
    { question: ClinicalVignetteQuestion; vignetteIdx: number }[]
  >([]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [vignetteContextOpen, setVignetteContextOpen] = useState(true);

  // Two-phase NCMHCE simulation state
  const [simPhase, setSimPhase] = useState<SimPhase>('ig');
  const [currentVignetteIdx, setCurrentVignetteIdx] = useState(0);
  const [selectedIGActions, setSelectedIGActions] = useState<Set<string>>(new Set());
  const [igRevealed, setIgRevealed] = useState(false);
  const [dmIdx, setDmIdx] = useState(0);

  // Derived
  const format = license ? getExamFormat(license) : 'practice_questions';
  const isTwoPhase = format === 'clinical_vignette' && vignettes.length > 0 && vignettes.some(hasTwoPhase);
  const totalQuestions = isTwoPhase
    ? vignettes.reduce((sum, v) => sum + (v.dmPhase?.decisionPoints.length ?? 0), 0)
    : format === 'clinical_vignette'
    ? flatQuestions.length
    : questions.length;

  // Reset question count when license changes
  useEffect(() => {
    if (license) {
      const options = getQuestionCountOptions(license, isPro);
      setQuestionCount(options[0].value);
    }
  }, [license, isPro]);

  // Timer for test mode
  useEffect(() => {
    if (state !== 'active' || mode !== 'test') return;
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [state, mode, startTime]);

  const formatTime = useCallback((ms: number) => {
    const s = Math.floor(ms / 1000);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }, []);

  async function handleStart() {
    if (!license) return;
    setIsLoading(true);
    setLoadingProgress('Preparing quiz...');

    const examFormat = getExamFormat(license);
    const countOptions = getQuestionCountOptions(license, isPro);
    const selected = countOptions.find((o) => o.value === questionCount) ?? countOptions[0];

    try {
      const result = await generateQuizBatches(
        {
          licenseType: license,
          studyFormat: examFormat,
          topic: 'General Review',
          difficulty: 'exam_level',
          itemCount:
            examFormat === 'clinical_vignette'
              ? (selected.vignetteCount ?? 1)
              : questionCount,
          includeRationales: true,
          californiaEmphasis: true,
          isBeginnerReview: false,
          questionsPerVignette:
            examFormat === 'clinical_vignette'
              ? (selected.qPerVignette ?? 25)
              : undefined,
        },
        (batch, total) => {
          setLoadingProgress(
            total > 1
              ? `Generating... (batch ${batch} of ${total})`
              : 'Generating questions...',
          );
        },
        user?.id,
      );

      if (result.content.type === 'clinical_vignette') {
        setVignettes(result.content.data);
        setFlatQuestions(flattenVignetteQuestions(result.content.data));
        setQuestions([]);
      } else if (result.content.type === 'practice_questions') {
        setQuestions(result.content.data);
        setVignettes([]);
        setFlatQuestions([]);
      }

      setState('active');
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setCurrentIdx(0);
      setResults([]);
      setSelectedAnswer(null);
      setShowRationale(false);
      setVignetteContextOpen(true);
      setStudyMode(mode);
      // Reset two-phase state
      setSimPhase('ig');
      setCurrentVignetteIdx(0);
      setSelectedIGActions(new Set());
      setIgRevealed(false);
      setDmIdx(0);
    } catch (err: unknown) {
      console.error('Failed to generate quiz:', err);
      setLoadingProgress(err instanceof Error ? err.message : 'Generation failed. Please try again.');
      setTimeout(() => setLoadingProgress(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Shared answer/navigation logic ─────────────────────────────────

  function getCurrentQuestion(): {
    stem: string;
    choices: { label: string; text: string }[];
    correctAnswer: string;
    rationale: string;
    incorrectRationales: { label: string; explanation: string }[];
    topic: string;
    id: string;
  } | null {
    if (format === 'clinical_vignette') {
      const item = flatQuestions[currentIdx];
      if (!item) return null;
      const q = item.question;
      return {
        stem: q.questionText,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale,
        incorrectRationales: q.incorrectRationales,
        topic: q.competencyArea,
        id: `vq-${item.vignetteIdx}-${currentIdx}`,
      };
    }
    const q = questions[currentIdx];
    if (!q) return null;
    return { ...q };
  }

  function handleAnswer(label: string) {
    if (selectedAnswer) return;
    setSelectedAnswer(label);

    const q = getCurrentQuestion();
    if (!q) return;

    const isCorrect = label === q.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;

    setResults((prev) => [
      ...prev,
      { questionId: q.id, selectedAnswer: label, isCorrect, timeSpent },
    ]);

    if (mode === 'study') {
      setShowRationale(true);
    }
  }

  function handleNext() {
    if (currentIdx < totalQuestions - 1) {
      const nextIdx = currentIdx + 1;
      // If crossing into a new vignette, re-expand the context card
      if (format === 'clinical_vignette') {
        const curVigIdx = flatQuestions[currentIdx]?.vignetteIdx;
        const nextVigIdx = flatQuestions[nextIdx]?.vignetteIdx;
        if (curVigIdx !== nextVigIdx) {
          setVignetteContextOpen(true);
        }
      }
      setCurrentIdx(nextIdx);
      setSelectedAnswer(null);
      setShowRationale(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const session: QuizSession = {
      id: `quiz-${Date.now()}`,
      licenseType: license!,
      mode,
      format,
      questions,
      vignettes: vignettes.length > 0 ? vignettes : undefined,
      results,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      score: results.filter((r) => r.isCorrect).length,
    };
    saveQuizSession(session);

    // Save to Supabase and update domain scores if authenticated
    if (user?.id) {
      saveQuizSessionAsync(user.id, session).catch(() => {});
      const domainResults = computeDomainScoresFromQuiz(session);
      if (domainResults.length > 0) {
        saveDomainScores(user.id, license!, domainResults).catch(() => {});
      }
    }

    setState('review');
  }

  const currentQuestion = getCurrentQuestion();
  const progress = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;
  const score = results.filter((r) => r.isCorrect).length;

  // ─── SETUP SCREEN ───────────────────────────────────────────────────

  if (state === 'setup') {
    const countOptions = license ? getQuestionCountOptions(license, isPro) : [];
    const examFormatLabel =
      license && getExamFormat(license) === 'clinical_vignette'
        ? 'Clinical Vignettes (NCMHCE simulation style)'
        : 'Multiple-Choice Questions';

    return (
      <div className="container-custom py-8 md:py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="heading-2 text-slate-900 mb-2">Practice & Quiz Mode</h1>
          <p className="text-slate-500">
            Test your knowledge in Study Mode or Test Mode.
          </p>
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-5">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  mode === 'study'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
                onClick={() => setMode('study')}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-sm text-slate-800">Study Mode</p>
                <p className="text-xs text-slate-500 mt-1">
                  See rationales after each question
                </p>
              </button>
              <button
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  mode === 'test'
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
                onClick={() => setMode('test')}
              >
                <Timer className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                <p className="font-semibold text-sm text-slate-800">Test Mode</p>
                <p className="text-xs text-slate-500 mt-1">
                  Timed, review answers at the end
                </p>
              </button>
            </div>

            {/* License Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                License Type
              </label>
              <Select
                value={license || ''}
                onValueChange={(v) => setLicense(v as LicenseType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your exam" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EXAM_DATA).map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.shortTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-selected format display */}
            {license && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-sm text-slate-500">Format:</span>
                <Badge variant="secondary">{examFormatLabel}</Badge>
              </div>
            )}

            {/* Question Count */}
            {license && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Quiz Size
                </label>
                <Select
                  value={String(questionCount)}
                  onValueChange={(v) => setQuestionCount(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isPro && (
                  <p className="text-xs text-slate-400 mt-1">
                    <a href="/upgrade" className="text-blue-600 hover:underline">
                      Upgrade to Pro
                    </a>{' '}
                    for 25, 50, or 75 question quizzes.
                  </p>
                )}
              </div>
            )}

            {/* Track-specific tips */}
            {license && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  {TRACK_TIPS[license].title}
                </p>
                <ul className="space-y-1.5">
                  {TRACK_TIPS[license].tips.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              onClick={handleStart}
              disabled={!license || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {loadingProgress || 'Preparing Quiz...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start {mode === 'study' ? 'Study' : 'Test'} Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── TWO-PHASE NCMHCE SIMULATION ─────────────────────────────────────

  if (state === 'active' && isTwoPhase) {
    const currentVignette = vignettes[currentVignetteIdx];
    if (!currentVignette) return null;

    const igActions = currentVignette.igPhase?.actions ?? [];
    const dmPoints = currentVignette.dmPhase?.decisionPoints ?? [];
    const currentDM = dmPoints[dmIdx];

    // Calculate overall progress across all vignettes
    const totalDMPoints = vignettes.reduce((s, v) => s + (v.dmPhase?.decisionPoints.length ?? 0), 0);
    const completedDMBefore = vignettes.slice(0, currentVignetteIdx).reduce((s, v) => s + (v.dmPhase?.decisionPoints.length ?? 0), 0);
    const overallProgress = totalDMPoints > 0
      ? ((completedDMBefore + (simPhase === 'dm' ? dmIdx : 0)) / totalDMPoints) * 100
      : 0;

    function handleIGToggle(actionId: string) {
      if (igRevealed) return;
      setSelectedIGActions((prev) => {
        const next = new Set(prev);
        if (next.has(actionId)) next.delete(actionId);
        else next.add(actionId);
        return next;
      });
    }

    function handleIGSubmit() {
      const timeSpent = Date.now() - questionStartTime;
      // Record results for each selected action
      igActions.forEach((action) => {
        if (selectedIGActions.has(action.id)) {
          setResults((prev) => [
            ...prev,
            {
              questionId: action.id,
              selectedAnswer: action.text,
              isCorrect: action.rating === 'most_productive' || action.rating === 'productive',
              timeSpent,
              igRating: action.rating,
            },
          ]);
        }
      });
      setIgRevealed(true);
    }

    function handleIGContinue() {
      setSimPhase('dm');
      setDmIdx(0);
      setSelectedAnswer(null);
      setShowRationale(false);
      setQuestionStartTime(Date.now());
    }

    function handleDMAnswer(label: string) {
      if (selectedAnswer || !currentDM) return;
      setSelectedAnswer(label);
      const isCorrect = label === currentDM.correctAnswer;
      const timeSpent = Date.now() - questionStartTime;
      setResults((prev) => [
        ...prev,
        { questionId: currentDM.id, selectedAnswer: label, isCorrect, timeSpent },
      ]);
      if (mode === 'study') setShowRationale(true);
    }

    function handleDMNext() {
      if (dmIdx < dmPoints.length - 1) {
        setDmIdx(dmIdx + 1);
        setSelectedAnswer(null);
        setShowRationale(false);
        setQuestionStartTime(Date.now());
      } else if (currentVignetteIdx < vignettes.length - 1) {
        // Move to next vignette
        setCurrentVignetteIdx(currentVignetteIdx + 1);
        setSimPhase('ig');
        setSelectedIGActions(new Set());
        setIgRevealed(false);
        setDmIdx(0);
        setSelectedAnswer(null);
        setShowRationale(false);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz();
      }
    }

    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Simulation {currentVignetteIdx + 1} of {vignettes.length}
              {simPhase === 'dm' && ` — Decision ${dmIdx + 1} of ${dmPoints.length}`}
            </span>
            <div className="flex items-center gap-3">
              {mode === 'test' && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {formatTime(elapsed)}
                </span>
              )}
              <Badge variant={simPhase === 'ig' ? 'secondary' : 'default'}>
                {simPhase === 'ig' ? 'Information Gathering' : 'Decision Making'}
              </Badge>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Vignette Context — always visible */}
        <Card className="border-indigo-200 bg-indigo-50/30 mb-4">
          <CardContent className="p-4">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setVignetteContextOpen(!vignetteContextOpen)}
            >
              <span className="font-semibold text-sm text-indigo-800">
                Client Presentation — Simulation {currentVignetteIdx + 1}
              </span>
              {vignetteContextOpen ? (
                <ChevronUp className="w-4 h-4 text-indigo-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-indigo-400" />
              )}
            </button>
            {vignetteContextOpen && (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>{currentVignette.clientPresentation}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div className="bg-white rounded p-2 border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-600 mb-0.5">Demographics</p>
                    <p className="text-xs text-slate-600">{currentVignette.demographics}</p>
                  </div>
                  <div className="bg-white rounded p-2 border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-600 mb-0.5">Presenting Problem</p>
                    <p className="text-xs text-slate-600">{currentVignette.presentingProblem}</p>
                  </div>
                  <div className="bg-white rounded p-2 border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-600 mb-0.5">Relevant History</p>
                    <p className="text-xs text-slate-600">{currentVignette.relevantHistory}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IG Phase */}
        {simPhase === 'ig' && (
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2">Information Gathering</Badge>
                <p className="text-slate-800 leading-relaxed">
                  {currentVignette.igPhase?.prompt ?? 'Select the clinical actions you would take with this client. Choose all that apply.'}
                </p>
              </div>

              <div className="space-y-2">
                {igActions.map((action) => {
                  const isSelected = selectedIGActions.has(action.id);
                  const ratingConfig = IG_RATING_CONFIG[action.rating];

                  let style = isSelected
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30';

                  if (igRevealed) {
                    style = isSelected
                      ? `${ratingConfig.bgColor} border`
                      : 'border-slate-200 opacity-50';
                  }

                  return (
                    <button
                      key={action.id}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${style}`}
                      onClick={() => handleIGToggle(action.id)}
                      disabled={igRevealed}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-slate-700">{action.text}</span>
                          {igRevealed && (
                            <div className="mt-1">
                              <span className={`text-xs font-medium ${ratingConfig.color}`}>
                                {ratingConfig.label}
                              </span>
                              {mode === 'study' && (
                                <p className="text-xs text-slate-500 mt-1">{action.rationale}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {!igRevealed ? (
                  <Button
                    onClick={handleIGSubmit}
                    disabled={selectedIGActions.size === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Selections ({selectedIGActions.size} selected)
                  </Button>
                ) : (
                  <Button onClick={handleIGContinue} className="bg-blue-600 hover:bg-blue-700">
                    Continue to Decision Making <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DM Phase */}
        {simPhase === 'dm' && currentDM && (
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default">Decision Making</Badge>
                <Badge variant="secondary">{currentDM.competencyArea}</Badge>
              </div>

              <p className="text-slate-800 leading-relaxed mb-6">{currentDM.questionText}</p>

              <div className="space-y-3">
                {currentDM.choices.map((choice) => {
                  const isSelected = selectedAnswer === choice.label;
                  const isCorrectChoice = choice.label === currentDM.correctAnswer;
                  const hasAnswered = !!selectedAnswer;

                  let choiceStyle =
                    'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
                  if (hasAnswered && mode === 'study') {
                    if (isCorrectChoice) choiceStyle = 'border-emerald-300 bg-emerald-50';
                    else if (isSelected) choiceStyle = 'border-red-300 bg-red-50';
                    else choiceStyle = 'border-slate-200 opacity-60';
                  } else if (hasAnswered && mode === 'test') {
                    if (isSelected) choiceStyle = 'border-blue-400 bg-blue-50';
                    else choiceStyle = 'border-slate-200 opacity-60';
                  }

                  return (
                    <button
                      key={choice.label}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${choiceStyle}`}
                      onClick={() => handleDMAnswer(choice.label)}
                      disabled={hasAnswered}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">
                          {choice.label}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{choice.text}</span>
                        {hasAnswered && mode === 'study' && isCorrectChoice && (
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
                        )}
                        {hasAnswered && mode === 'study' && isSelected && !isCorrectChoice && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Study Mode Rationale */}
              {showRationale && mode === 'study' && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm space-y-3 animate-fade-in">
                  <div>
                    <p className="font-semibold text-emerald-700 mb-1">
                      Correct Answer: {currentDM.correctAnswer}
                    </p>
                    <p className="text-slate-700">{currentDM.rationale}</p>
                  </div>
                  {currentDM.incorrectRationales.map((ir) => (
                    <div key={ir.label}>
                      <p className="font-medium text-slate-500">Why not {ir.label}:</p>
                      <p className="text-slate-600">{ir.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Button */}
              {selectedAnswer && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleDMNext} className="bg-blue-600 hover:bg-blue-700">
                    {dmIdx < dmPoints.length - 1 ? (
                      <>Next Decision <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : currentVignetteIdx < vignettes.length - 1 ? (
                      <>Next Simulation <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>Finish Quiz <CheckCircle className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── ACTIVE QUIZ (MCQ + Legacy Vignette) ────────────────────────────

  if (state === 'active' && currentQuestion) {
    // Vignette context card (LPCC only)
    const vignetteContext =
      format === 'clinical_vignette'
        ? vignettes[flatQuestions[currentIdx]?.vignetteIdx]
        : null;
    const vignetteNum =
      format === 'clinical_vignette'
        ? flatQuestions[currentIdx]?.vignetteIdx + 1
        : 0;

    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Question {currentIdx + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-3">
              {mode === 'test' && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {formatTime(elapsed)}
                </span>
              )}
              <Badge variant={mode === 'study' ? 'secondary' : 'default'}>
                {mode === 'study' ? 'Study Mode' : 'Test Mode'}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Vignette Context Card */}
        {vignetteContext && (
          <Card className="border-indigo-200 bg-indigo-50/30 mb-4">
            <CardContent className="p-4">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setVignetteContextOpen(!vignetteContextOpen)}
              >
                <span className="font-semibold text-sm text-indigo-800">
                  Vignette {vignetteNum} of {vignettes.length}
                </span>
                {vignetteContextOpen ? (
                  <ChevronUp className="w-4 h-4 text-indigo-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-indigo-400" />
                )}
              </button>
              {vignetteContextOpen && (
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>{vignetteContext.clientPresentation}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                    <div className="bg-white rounded p-2 border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-600 mb-0.5">Demographics</p>
                      <p className="text-xs text-slate-600">{vignetteContext.demographics}</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-600 mb-0.5">Presenting Problem</p>
                      <p className="text-xs text-slate-600">{vignetteContext.presentingProblem}</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-600 mb-0.5">Relevant History</p>
                      <p className="text-xs text-slate-600">{vignetteContext.relevantHistory}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{currentQuestion.topic}</Badge>
            </div>

            <p className="text-slate-800 leading-relaxed mb-6">{currentQuestion.stem}</p>

            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedAnswer === choice.label;
                const isCorrectChoice = choice.label === currentQuestion.correctAnswer;
                const hasAnswered = !!selectedAnswer;

                let style =
                  'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
                if (hasAnswered && mode === 'study') {
                  if (isCorrectChoice) style = 'border-emerald-300 bg-emerald-50';
                  else if (isSelected) style = 'border-red-300 bg-red-50';
                  else style = 'border-slate-200 opacity-60';
                } else if (hasAnswered && mode === 'test') {
                  if (isSelected) style = 'border-blue-400 bg-blue-50';
                  else style = 'border-slate-200 opacity-60';
                }

                return (
                  <button
                    key={choice.label}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${style}`}
                    onClick={() => handleAnswer(choice.label)}
                    disabled={hasAnswered}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">
                        {choice.label}
                      </span>
                      <span className="text-sm text-slate-700 pt-0.5">{choice.text}</span>
                      {hasAnswered && mode === 'study' && isCorrectChoice && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
                      )}
                      {hasAnswered && mode === 'study' && isSelected && !isCorrectChoice && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Study Mode Rationale */}
            {showRationale && mode === 'study' && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm space-y-3 animate-fade-in">
                <div>
                  <p className="font-semibold text-emerald-700 mb-1">
                    Correct Answer: {currentQuestion.correctAnswer}
                  </p>
                  <p className="text-slate-700">{currentQuestion.rationale}</p>
                </div>
                {currentQuestion.incorrectRationales.map((ir) => (
                  <div key={ir.label}>
                    <p className="font-medium text-slate-500">Why not {ir.label}:</p>
                    <p className="text-slate-600">{ir.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Next Button */}
            {selectedAnswer && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  {currentIdx < totalQuestions - 1 ? (
                    <>
                      Next Question <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Finish Quiz <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── REVIEW SCREEN ──────────────────────────────────────────────────

  if (state === 'review') {
    const percentage =
      totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Build review items — either flat MCQs or grouped by vignette
    const reviewSections: {
      vignetteContext?: ClinicalVignette;
      items: {
        stem: string;
        rationale: string;
        correctAnswer: string;
        result: QuizResult | undefined;
        id: string;
      }[];
    }[] = [];

    if (format === 'clinical_vignette' && vignettes.length > 0) {
      let qIdx = 0;
      vignettes.forEach((v) => {
        const items = v.questions.map((q) => {
          const r = results[qIdx];
          qIdx++;
          return {
            stem: q.questionText,
            rationale: q.rationale,
            correctAnswer: q.correctAnswer,
            result: r,
            id: `review-${qIdx}`,
          };
        });
        reviewSections.push({ vignetteContext: v, items });
      });
    } else {
      reviewSections.push({
        items: questions.map((q, i) => ({
          stem: q.stem,
          rationale: q.rationale,
          correctAnswer: q.correctAnswer,
          result: results[i],
          id: q.id,
        })),
      });
    }

    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        {/* Score Card */}
        <Card className="border-slate-200 mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Trophy
                className={`w-10 h-10 ${percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}
              />
            </div>
            <h2 className="font-montserrat font-bold text-3xl text-slate-900 mb-1">
              {score} / {totalQuestions}
            </h2>
            <p className="text-lg text-slate-500 mb-4">{percentage}% Correct</p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {score} Correct
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                {totalQuestions - score} Incorrect
              </span>
              {mode === 'test' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {formatTime(elapsed)}
                </span>
              )}
            </div>

            {percentage >= 80 && (
              <p className="mt-4 text-emerald-600 font-medium">
                Excellent work! You're showing strong knowledge in this area.
              </p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="mt-4 text-blue-600 font-medium">
                Good progress! Review the missed questions to strengthen your understanding.
              </p>
            )}
            {percentage < 60 && (
              <p className="mt-4 text-amber-600 font-medium">
                Keep studying! Focus on the topics where you missed questions.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Question Review */}
        <h3 className="font-montserrat font-semibold text-lg text-slate-900 mb-4">
          Question Review
        </h3>
        {reviewSections.map((section, si) => (
          <div key={si} className="mb-6">
            {section.vignetteContext && (
              <Card className="border-indigo-200 bg-indigo-50/30 mb-3">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm text-indigo-800 mb-2">
                    Vignette {si + 1}
                  </p>
                  <p className="text-sm text-slate-700">
                    {section.vignetteContext.clientPresentation}
                  </p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-4">
              {section.items.map((item) => {
                const isCorrect = item.result?.isCorrect;
                return (
                  <Card
                    key={item.id}
                    className={`border ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-emerald-100' : 'bg-red-100'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-800 mb-2">{item.stem}</p>
                          {!isCorrect && (
                            <div className="text-sm space-y-1 mb-2">
                              <p className="text-red-600">
                                Your answer: {item.result?.selectedAnswer}
                              </p>
                              <p className="text-emerald-600">
                                Correct answer: {item.correctAnswer}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                            {item.rationale}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setState('setup');
              setSelectedAnswer(null);
              setShowRationale(false);
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Take Another Quiz
          </Button>
          <Button variant="outline" onClick={() => navigate('/generator')}>
            Go to Generator
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
