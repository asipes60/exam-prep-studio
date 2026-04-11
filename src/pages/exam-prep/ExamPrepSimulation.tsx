import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { useAuth } from '@/hooks/use-auth';
import { generateStudyMaterial } from '@/lib/exam-prep-ai';
import { saveQuizSessionAsync, saveDomainScores } from '@/lib/exam-prep-storage';
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
  ClinicalVignette,
  IGAction,
  DMDecisionPoint,
  QuizResult,
  QuizSession,
  DomainScore,
  GeneratorConfig,
  IGActionRating,
} from '@/types/exam-prep';
import {
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  FileText,
  Search,
  Brain,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

type SimStep = 'setup' | 'loading' | 'case' | 'ig' | 'dm' | 'review' | 'results';

const IG_RATING_CONFIG: Record<IGActionRating, { label: string; color: string; bg: string; points: number }> = {
  most_productive: { label: 'Most Productive', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', points: 4 },
  productive: { label: 'Productive', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', points: 3 },
  unproductive: { label: 'Unproductive', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', points: 1 },
  counterproductive: { label: 'Counterproductive', color: 'text-red-700', bg: 'bg-red-100 border-red-200', points: 0 },
};

interface IGSelection {
  actionId: string;
  rating: IGActionRating;
}

interface DMAnswer {
  decisionPointId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export default function ExamPrepSimulation() {
  const { setSelectedLicense } = useExamPrep();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<SimStep>('setup');
  const [simCount, setSimCount] = useState<string>('1');
  const [topic, setTopic] = useState<string>('comprehensive');
  const [studyMode, setStudyMode] = useState(true); // true = immediate feedback

  // Simulation state
  const [vignettes, setVignettes] = useState<ClinicalVignette[]>([]);
  const [currentVignetteIndex, setCurrentVignetteIndex] = useState(0);
  const [igSelections, setIgSelections] = useState<IGSelection[]>([]);
  const [dmAnswers, setDmAnswers] = useState<DMAnswer[]>([]);
  const [currentDmIndex, setCurrentDmIndex] = useState(0);
  const [selectedDmAnswer, setSelectedDmAnswer] = useState<string | null>(null);
  const [showDmRationale, setShowDmRationale] = useState(false);

  // All simulations results
  const [allIgSelections, setAllIgSelections] = useState<IGSelection[][]>([]);
  const [allDmAnswers, setAllDmAnswers] = useState<DMAnswer[][]>([]);
  const quizStartTime = useRef<string>('');

  const currentVignette = vignettes[currentVignetteIndex];
  const currentDmPoint = currentVignette?.dmPhase?.decisionPoints?.[currentDmIndex];

  // Topic options for LPCC/NCMHCE
  const topicOptions = [
    { value: 'comprehensive', label: 'Comprehensive (All Domains)' },
    { value: 'assessment_diagnosis', label: 'Assessment & Diagnosis' },
    { value: 'treatment_planning', label: 'Treatment Planning' },
    { value: 'counseling_interventions', label: 'Counseling & Interventions' },
    { value: 'ethics_professional', label: 'Ethics & Professional Practice' },
    { value: 'crisis_risk', label: 'Crisis & Risk Assessment' },
  ];

  // Generate simulations
  const generateSimulations = useCallback(async () => {
    setStep('loading');

    const count = parseInt(simCount, 10);
    const topicLabel = topicOptions.find((t) => t.value === topic)?.label || 'Comprehensive';

    const config: GeneratorConfig = {
      licenseType: 'LPCC',
      studyFormat: 'clinical_vignette',
      topic: topic === 'comprehensive'
        ? 'Comprehensive NCMHCE clinical simulation across all counseling domains'
        : topicLabel,
      difficulty: 'exam_level',
      itemCount: count,
      includeRationales: true,
      californiaEmphasis: false,
      isBeginnerReview: false,
      customPrompt: `Generate ${count} NCMHCE-style clinical simulation(s). Each MUST include both igPhase (Information Gathering with 8-12 rated actions) and dmPhase (Decision Making with 3-5 decision points). Ensure diverse client presentations and clinical scenarios.`,
    };

    try {
      const result = await generateStudyMaterial(config, user?.id);
      if (result.content.type === 'clinical_vignette' && result.content.data.length > 0) {
        // Filter to only vignettes with both phases
        const validVignettes = result.content.data.filter(
          (v) => v.igPhase && v.dmPhase && v.igPhase.actions.length > 0 && v.dmPhase.decisionPoints.length > 0
        );
        if (validVignettes.length === 0) throw new Error('No valid simulations generated');
        setVignettes(validVignettes);
        quizStartTime.current = new Date().toISOString();
        setStep('case');
      } else {
        throw new Error('No simulations generated');
      }
    } catch (err) {
      console.error('Failed to generate simulations:', err);
      toast.error('Failed to generate clinical simulations. Please try again.');
      setStep('setup');
    }
  }, [simCount, topic, user?.id]);

  // Handle IG action selection
  function handleIgSelect(action: IGAction) {
    // Don't allow re-selecting
    if (igSelections.some((s) => s.actionId === action.id)) return;

    const selection: IGSelection = {
      actionId: action.id,
      rating: action.rating,
    };
    setIgSelections((prev) => [...prev, selection]);
  }

  // Check if an IG action is selected
  function isIgSelected(actionId: string): boolean {
    return igSelections.some((s) => s.actionId === actionId);
  }

  // Get IG action selection state
  function getIgSelectionState(action: IGAction): IGSelection | undefined {
    return igSelections.find((s) => s.actionId === action.id);
  }

  // Handle DM answer selection
  function handleDmSelect(answer: string) {
    if (showDmRationale || selectedDmAnswer) return;
    if (!currentDmPoint) return;

    setSelectedDmAnswer(answer);
    const isCorrect = answer === currentDmPoint.correctAnswer;

    const dmAnswer: DMAnswer = {
      decisionPointId: currentDmPoint.id,
      selectedAnswer: answer,
      isCorrect,
    };
    setDmAnswers((prev) => [...prev, dmAnswer]);
    setShowDmRationale(true);
  }

  // Move to next DM question
  function handleNextDm() {
    const dmPoints = currentVignette?.dmPhase?.decisionPoints || [];
    if (currentDmIndex < dmPoints.length - 1) {
      setCurrentDmIndex((prev) => prev + 1);
      setSelectedDmAnswer(null);
      setShowDmRationale(false);
    } else {
      // DM phase complete — go to review
      setStep('review');
    }
  }

  // Move to next simulation or final results
  function handleNextSimulation() {
    // Save current simulation results
    setAllIgSelections((prev) => [...prev, igSelections]);
    setAllDmAnswers((prev) => [...prev, dmAnswers]);

    if (currentVignetteIndex < vignettes.length - 1) {
      // Reset for next simulation
      setCurrentVignetteIndex((prev) => prev + 1);
      setIgSelections([]);
      setDmAnswers([]);
      setCurrentDmIndex(0);
      setSelectedDmAnswer(null);
      setShowDmRationale(false);
      setStep('case');
    } else {
      // All simulations complete
      saveResults([...allIgSelections, igSelections], [...allDmAnswers, dmAnswers]);
      setStep('results');
    }
  }

  // Save results to Supabase
  function saveResults(allIg: IGSelection[][], allDm: DMAnswer[][]) {
    if (!user?.id) return;

    const quizResults: QuizResult[] = [];

    // IG results
    allIg.forEach((simIg) => {
      simIg.forEach((sel) => {
        quizResults.push({
          questionId: sel.actionId,
          selectedAnswer: sel.actionId,
          isCorrect: sel.rating === 'most_productive' || sel.rating === 'productive',
          timeSpent: 0,
          igRating: sel.rating,
        });
      });
    });

    // DM results
    allDm.forEach((simDm) => {
      simDm.forEach((ans) => {
        quizResults.push({
          questionId: ans.decisionPointId,
          selectedAnswer: ans.selectedAnswer,
          isCorrect: ans.isCorrect,
          timeSpent: 0,
        });
      });
    });

    const totalDm = allDm.flat();
    const dmCorrect = totalDm.filter((a) => a.isCorrect).length;
    const dmScore = totalDm.length > 0 ? Math.round((dmCorrect / totalDm.length) * 100) : 0;

    const session: QuizSession = {
      id: `sim-${Date.now()}`,
      licenseType: 'LPCC',
      mode: studyMode ? 'study' : 'test',
      format: 'clinical_vignette',
      questions: [],
      vignettes,
      results: quizResults,
      startedAt: quizStartTime.current,
      completedAt: new Date().toISOString(),
      score: dmScore,
    };

    saveQuizSessionAsync(user.id, session).catch((err) =>
      console.warn('Failed to save simulation session:', err)
    );

    // Save domain scores from DM competency areas
    const domainMap = new Map<string, { total: number; correct: number }>();
    allDm.flat().forEach((ans) => {
      // Find the decision point to get competency area
      for (const v of vignettes) {
        const dp = v.dmPhase?.decisionPoints.find((d) => d.id === ans.decisionPointId);
        if (dp) {
          const domain = dp.competencyArea || 'General';
          const existing = domainMap.get(domain) || { total: 0, correct: 0 };
          existing.total += 1;
          if (ans.isCorrect) existing.correct += 1;
          domainMap.set(domain, existing);
          break;
        }
      }
    });

    const domainScores: DomainScore[] = Array.from(domainMap.entries()).map(([name, data]) => ({
      domainId: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      domainName: name,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      isWeak: data.total > 0 && (data.correct / data.total) < 0.6,
      isStrong: data.total > 0 && (data.correct / data.total) >= 0.8,
    }));

    if (domainScores.length > 0) {
      saveDomainScores(user.id, 'LPCC', domainScores).catch((err) =>
        console.warn('Failed to save domain scores:', err)
      );
    }
  }

  // Calculate scores for display
  function getIgScore(selections: IGSelection[]): { points: number; maxPoints: number; percentage: number } {
    const points = selections.reduce((sum, s) => sum + IG_RATING_CONFIG[s.rating].points, 0);
    const maxPoints = selections.length * 4;
    return { points, maxPoints, percentage: maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0 };
  }

  function getDmScore(answers: DMAnswer[]): { correct: number; total: number; percentage: number } {
    const correct = answers.filter((a) => a.isCorrect).length;
    return { correct, total: answers.length, percentage: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0 };
  }

  // ─── Setup ───────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="heading-2 text-slate-900 mb-2">NCMHCE Clinical Simulation</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Practice with realistic clinical simulations that mirror the NCMHCE exam format —
            Information Gathering followed by Decision Making.
          </p>
        </div>

        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Number of Simulations</h3>
              <Select value={simCount} onValueChange={setSimCount}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Simulation (~15 min)</SelectItem>
                  <SelectItem value="3">3 Simulations (~45 min)</SelectItem>
                  <SelectItem value="5">5 Simulations (~75 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Focus Area</h3>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topicOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Study Mode</h3>
              <div className="flex gap-3">
                <Button
                  variant={studyMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStudyMode(true)}
                  className={studyMode ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  Immediate Feedback
                </Button>
                <Button
                  variant={!studyMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStudyMode(false)}
                  className={!studyMode ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <EyeOff className="w-4 h-4 mr-1.5" />
                  Exam Mode
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {studyMode
                  ? 'See action ratings and answer rationales immediately'
                  : 'No feedback until simulation review — like the real exam'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={generateSimulations}
          >
            <Stethoscope className="w-5 h-5 mr-2" />
            Begin Simulation
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-slate-500" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="container-custom py-16 max-w-lg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Stethoscope className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="heading-3 text-slate-900 mb-2">Preparing Clinical Simulation</h2>
          <p className="text-slate-500 mb-6">
            Creating realistic client scenarios with clinical decision points...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
        </div>
      </div>
    );
  }

  if (!currentVignette) return null;

  // ─── Case Presentation ───────────────────────────────────────────────
  if (step === 'case') {
    return (
      <div className="container-custom py-6 md:py-8 max-w-3xl">
        {vignettes.length > 1 && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              Simulation {currentVignetteIndex + 1} of {vignettes.length}
            </Badge>
          </div>
        )}

        <Card className="border-purple-200 bg-purple-50/30 mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-purple-900 text-lg mb-4">Case Presentation</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Demographics</p>
                  <p className="text-sm text-slate-700">{currentVignette.demographics}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Presenting Problem</p>
                  <p className="text-sm text-slate-700">{currentVignette.presentingProblem}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Relevant History</p>
                  <p className="text-sm text-slate-700">{currentVignette.relevantHistory}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinical Presentation</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{currentVignette.clientPresentation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setStep('ig')}
          >
            Begin Information Gathering
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Information Gathering Phase ─────────────────────────────────────
  if (step === 'ig' && currentVignette.igPhase) {
    const igPhase = currentVignette.igPhase;
    return (
      <div className="container-custom py-6 md:py-8 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Search className="w-3 h-3 mr-1" />
              Information Gathering
            </Badge>
            <span className="text-sm text-slate-500">
              {igSelections.length} actions selected
            </span>
          </div>
        </div>

        <Card className="border-slate-200 mb-4">
          <CardContent className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed">{igPhase.prompt}</p>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 mb-3">
          Select the clinical actions you would take. Choose wisely — each action is rated.
        </p>

        <div className="space-y-2.5 mb-6">
          {igPhase.actions.map((action) => {
            const selected = isIgSelected(action.id);
            const selection = getIgSelectionState(action);
            const showRating = selected && studyMode;

            return (
              <Card
                key={action.id}
                className={`transition-all ${
                  selected
                    ? showRating
                      ? `border ${IG_RATING_CONFIG[action.rating].bg}`
                      : 'border-purple-300 bg-purple-50'
                    : 'border-slate-200 hover:border-purple-200 cursor-pointer'
                }`}
                onClick={() => handleIgSelect(action)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        selected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{action.text}</p>
                      {showRating && (
                        <div className="mt-2">
                          <Badge className={`${IG_RATING_CONFIG[action.rating].bg} ${IG_RATING_CONFIG[action.rating].color} text-xs`}>
                            {IG_RATING_CONFIG[action.rating].label}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">{action.rationale}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              setCurrentDmIndex(0);
              setSelectedDmAnswer(null);
              setShowDmRationale(false);
              setStep('dm');
            }}
            disabled={igSelections.length < 3}
          >
            Proceed to Decision Making
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {igSelections.length < 3 && (
            <p className="text-xs text-slate-400 mt-2">Select at least 3 actions to continue</p>
          )}
        </div>
      </div>
    );
  }

  // ─── Decision Making Phase ───────────────────────────────────────────
  if (step === 'dm' && currentVignette.dmPhase && currentDmPoint) {
    const dmPhase = currentVignette.dmPhase;
    const dmProgress = ((currentDmIndex + (showDmRationale ? 1 : 0)) / dmPhase.decisionPoints.length) * 100;

    return (
      <div className="container-custom py-6 md:py-8 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
              <Brain className="w-3 h-3 mr-1" />
              Decision Making
            </Badge>
            <span className="text-sm text-slate-500">
              Decision {currentDmIndex + 1} of {dmPhase.decisionPoints.length}
            </span>
          </div>
          <Progress value={dmProgress} className="h-2" />
        </div>

        {currentDmIndex === 0 && (
          <Card className="border-slate-200 mb-4">
            <CardContent className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{dmPhase.prompt}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 mb-4">
          <CardContent className="p-6">
            {currentDmPoint.competencyArea && (
              <Badge variant="outline" className="text-xs mb-3">
                {currentDmPoint.competencyArea}
              </Badge>
            )}
            <p className="text-lg font-medium text-slate-900 leading-relaxed">
              {currentDmPoint.questionText}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-6">
          {currentDmPoint.choices.map((choice) => {
            const isSelected = selectedDmAnswer === choice.label;
            const isCorrect = choice.label === currentDmPoint.correctAnswer;
            const showFeedback = showDmRationale && studyMode;

            let borderClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer';
            if (showFeedback && isCorrect) {
              borderClass = 'border-emerald-400 bg-emerald-50';
            } else if (showFeedback && isSelected && !isCorrect) {
              borderClass = 'border-red-400 bg-red-50';
            } else if (isSelected) {
              borderClass = 'border-indigo-400 bg-indigo-50';
            }
            if (showDmRationale) borderClass += ' cursor-default';

            return (
              <Card
                key={choice.label}
                className={`transition-all ${borderClass}`}
                onClick={() => handleDmSelect(choice.label)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      showFeedback && isCorrect
                        ? 'bg-emerald-500 text-white'
                        : showFeedback && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {showFeedback && isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : showFeedback && isSelected && !isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      choice.label
                    )}
                  </span>
                  <span className="text-sm text-slate-700 pt-1">{choice.text}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {showDmRationale && studyMode && (
          <Card className="border-indigo-200 bg-indigo-50/50 mb-6">
            <CardContent className="p-5">
              <h4 className="font-semibold text-indigo-800 mb-2 text-sm">Explanation</h4>
              <p className="text-sm text-indigo-700 leading-relaxed">{currentDmPoint.rationale}</p>
            </CardContent>
          </Card>
        )}

        {showDmRationale && (
          <div className="text-center">
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleNextDm}>
              {currentDmIndex < dmPhase.decisionPoints.length - 1 ? (
                <>Next Decision <ArrowRight className="w-4 h-4 ml-2" /></>
              ) : (
                <>Review Simulation <BarChart3 className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        )}

        {!showDmRationale && !studyMode && selectedDmAnswer && (
          <div className="text-center">
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleNextDm}>
              {currentDmIndex < dmPhase.decisionPoints.length - 1 ? 'Next Decision' : 'Review Simulation'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ─── Simulation Review ───────────────────────────────────────────────
  if (step === 'review') {
    const igScore = getIgScore(igSelections);
    const dmScore = getDmScore(dmAnswers);

    return (
      <div className="container-custom py-6 md:py-8 max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="heading-3 text-slate-900 mb-1">Simulation Review</h2>
          {vignettes.length > 1 && (
            <p className="text-sm text-slate-500">
              Simulation {currentVignetteIndex + 1} of {vignettes.length}
            </p>
          )}
        </div>

        {/* Score summary */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-purple-200">
            <CardContent className="p-5 text-center">
              <Search className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-500 uppercase">IG Phase Score</p>
              <p className="text-2xl font-bold text-purple-700">{igScore.percentage}%</p>
              <p className="text-xs text-slate-400">{igScore.points}/{igScore.maxPoints} points</p>
            </CardContent>
          </Card>
          <Card className="border-indigo-200">
            <CardContent className="p-5 text-center">
              <Brain className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-500 uppercase">DM Phase Score</p>
              <p className="text-2xl font-bold text-indigo-700">{dmScore.percentage}%</p>
              <p className="text-xs text-slate-400">{dmScore.correct}/{dmScore.total} correct</p>
            </CardContent>
          </Card>
        </div>

        {/* IG Review */}
        <Card className="border-slate-200 mb-4">
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Information Gathering Actions</h3>
            <div className="space-y-2">
              {currentVignette.igPhase?.actions.map((action) => {
                const selected = isIgSelected(action.id);
                return (
                  <div
                    key={action.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-sm ${
                      selected ? IG_RATING_CONFIG[action.rating].bg : 'bg-slate-50'
                    }`}
                  >
                    <span className={`shrink-0 ${selected ? '' : 'opacity-40'}`}>
                      {selected ? '✓' : '○'}
                    </span>
                    <div className="flex-1">
                      <span className={selected ? '' : 'text-slate-400'}>{action.text}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${IG_RATING_CONFIG[action.rating].bg} ${IG_RATING_CONFIG[action.rating].color} text-xs`}>
                          {IG_RATING_CONFIG[action.rating].label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* DM Review */}
        <Card className="border-slate-200 mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Decision Making Results</h3>
            <div className="space-y-3">
              {currentVignette.dmPhase?.decisionPoints.map((dp, i) => {
                const answer = dmAnswers[i];
                return (
                  <div key={dp.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      {answer?.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{dp.questionText}</p>
                        {answer && !answer.isCorrect && (
                          <p className="text-xs text-slate-500 mt-1">
                            Your answer: {answer.selectedAnswer} · Correct: {dp.correctAnswer}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{dp.rationale}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleNextSimulation}>
            {currentVignetteIndex < vignettes.length - 1 ? (
              <>Next Simulation <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <>View Overall Results <BarChart3 className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Final Results ───────────────────────────────────────────────────
  if (step === 'results') {
    const finalIg = [...allIgSelections, igSelections];
    const finalDm = [...allDmAnswers, dmAnswers];
    const totalIgScore = getIgScore(finalIg.flat());
    const totalDmScore = getDmScore(finalDm.flat());
    const overallPercentage = Math.round((totalIgScore.percentage + totalDmScore.percentage) / 2);

    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center mx-auto mb-4">
            <span className={`text-3xl font-bold ${
              overallPercentage >= 80 ? 'text-emerald-600' : overallPercentage >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {overallPercentage}%
            </span>
          </div>
          <h1 className="heading-2 text-slate-900 mb-1">Simulation Complete</h1>
          <p className="text-slate-500">
            {vignettes.length} simulation{vignettes.length > 1 ? 's' : ''} completed
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-purple-200">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Information Gathering</p>
              <p className="text-3xl font-bold text-purple-700">{totalIgScore.percentage}%</p>
              <p className="text-xs text-slate-400">{totalIgScore.points}/{totalIgScore.maxPoints} points</p>
            </CardContent>
          </Card>
          <Card className="border-indigo-200">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Decision Making</p>
              <p className="text-3xl font-bold text-indigo-700">{totalDmScore.percentage}%</p>
              <p className="text-xs text-slate-400">{totalDmScore.correct}/{totalDmScore.total} correct</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
            setStep('setup');
            setVignettes([]);
            setCurrentVignetteIndex(0);
            setIgSelections([]);
            setDmAnswers([]);
            setAllIgSelections([]);
            setAllDmAnswers([]);
          }}>
            Practice More Simulations
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
