import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { useAuth } from '@/hooks/use-auth';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { generateStudyMaterial, generateWeakAreaPlan } from '@/lib/exam-prep-ai';
import {
  saveAssessmentAsync,
  saveQuizSessionAsync,
  saveDomainScores,
} from '@/lib/exam-prep-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  QuizResult,
  QuizSession,
  StudyPlan,
  GeneratorConfig,
  DomainScore,
} from '@/types/exam-prep';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

const DIAGNOSTIC_QUESTION_COUNT = 30;

type DiagnosticStep = 'setup' | 'loading' | 'quiz' | 'scoring' | 'results';

interface DomainResult {
  domainId: string;
  domainName: string;
  total: number;
  correct: number;
  percentage: number;
}

export default function ExamPrepDiagnostic() {
  const { setSelectedLicense, loadActivePlan } = useExamPrep();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<DiagnosticStep>('setup');
  const [license, setLicense] = useState<LicenseType | null>(null);
  const [examDate, setExamDate] = useState('');

  // Quiz state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const quizStartTime = useRef<string>('');

  // Results state
  const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [strongAreas, setStrongAreas] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0
    ? ((currentIndex + (showRationale ? 1 : 0)) / questions.length) * 100
    : 0;

  // Generate diagnostic questions
  const generateDiagnostic = useCallback(async () => {
    if (!license) return;
    setStep('loading');

    const exam = EXAM_DATA[license];
    // Build a topic string covering all domains
    const allDomains = exam.categories.map((c) => c.name).join(', ');

    const config: GeneratorConfig = {
      licenseType: license,
      studyFormat: 'practice_questions',
      topic: `Comprehensive diagnostic assessment covering all exam domains: ${allDomains}`,
      difficulty: 'exam_level',
      itemCount: DIAGNOSTIC_QUESTION_COUNT,
      includeRationales: true,
      californiaEmphasis: license === 'LAW_ETHICS',
      isBeginnerReview: false,
      customPrompt: `Generate exactly ${DIAGNOSTIC_QUESTION_COUNT} multiple-choice questions for a diagnostic assessment. Distribute questions proportionally across ALL exam domains: ${exam.categories.map((c) => c.name).join('; ')}. Each question MUST include a "topic" field matching one of the domain names. Questions should be exam-level difficulty to accurately assess the candidate's readiness.`,
    };

    try {
      const result = await generateStudyMaterial(config, user?.id);
      if (result.content.type === 'practice_questions' && result.content.data.length > 0) {
        setQuestions(result.content.data);
        quizStartTime.current = new Date().toISOString();
        questionStartTime.current = Date.now();
        setStep('quiz');
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      console.error('Failed to generate diagnostic:', err);
      // Fallback: use seed questions from exam data
      const fallbackQuestions = buildFallbackQuestions(license);
      if (fallbackQuestions.length > 0) {
        setQuestions(fallbackQuestions);
        quizStartTime.current = new Date().toISOString();
        questionStartTime.current = Date.now();
        setStep('quiz');
        toast.info('Using practice questions for diagnostic. AI generation will be retried next time.');
      } else {
        toast.error('Failed to generate diagnostic questions. Please try again.');
        setStep('setup');
      }
    }
  }, [license, user?.id]);

  // Build fallback questions from seed data
  function buildFallbackQuestions(lic: LicenseType): PracticeQuestion[] {
    const exam = EXAM_DATA[lic];
    const fallback: PracticeQuestion[] = [];
    // Generate simple seed questions from each domain
    for (const category of exam.categories) {
      for (const topic of category.topics.slice(0, 2)) {
        fallback.push({
          id: `diag-${category.id}-${fallback.length}`,
          stem: `Which of the following best describes a key concept in ${topic}?`,
          choices: [
            { label: 'A', text: `A fundamental principle of ${topic} applied in clinical practice` },
            { label: 'B', text: `An outdated approach no longer recommended in current guidelines` },
            { label: 'C', text: `A concept primarily relevant to research methodology only` },
            { label: 'D', text: `An administrative requirement unrelated to clinical competency` },
          ],
          correctAnswer: 'A',
          rationale: `This question assesses basic knowledge of ${topic} within ${category.name}. The correct answer reflects current best practices.`,
          incorrectRationales: [
            { label: 'B', explanation: 'This describes an outdated approach.' },
            { label: 'C', explanation: 'This topic has direct clinical application.' },
            { label: 'D', explanation: 'This is a core clinical competency area.' },
          ],
          topic: category.name,
          difficulty: 'exam_level',
        });
      }
      if (fallback.length >= DIAGNOSTIC_QUESTION_COUNT) break;
    }
    return fallback.slice(0, DIAGNOSTIC_QUESTION_COUNT);
  }

  // Handle answer selection
  function handleSelectAnswer(answer: string) {
    if (showRationale || selectedAnswer) return;
    setSelectedAnswer(answer);

    const timeSpent = Date.now() - questionStartTime.current;
    const isCorrect = answer === currentQuestion.correctAnswer;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timeSpent,
    };

    setResults((prev) => [...prev, result]);
    setShowRationale(true);
  }

  // Move to next question
  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowRationale(false);
      questionStartTime.current = Date.now();
    } else {
      // Quiz complete — calculate scores
      calculateResults();
    }
  }

  // Calculate domain-level results
  const calculateResults = useCallback(() => {
    setStep('scoring');

    const domainMap = new Map<string, { total: number; correct: number }>();

    // Map each question to its domain
    questions.forEach((q, i) => {
      const result = results[i];
      if (!result) return;

      // Use the question's topic field to determine domain
      const domainName = q.topic || 'General';
      const existing = domainMap.get(domainName) || { total: 0, correct: 0 };
      existing.total += 1;
      if (result.isCorrect) existing.correct += 1;
      domainMap.set(domainName, existing);
    });

    const domains: DomainResult[] = Array.from(domainMap.entries()).map(
      ([name, data]) => ({
        domainId: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        domainName: name,
        total: data.total,
        correct: data.correct,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      })
    );

    const totalCorrect = results.filter((r) => r.isCorrect).length;
    const overall = Math.round((totalCorrect / results.length) * 100);

    const weak = domains.filter((d) => d.percentage < 60).map((d) => d.domainName);
    const strong = domains.filter((d) => d.percentage >= 80).map((d) => d.domainName);

    setDomainResults(domains);
    setOverallScore(overall);
    setWeakAreas(weak);
    setStrongAreas(strong);

    // Save results
    if (user?.id && license) {
      // Save quiz session
      const session: QuizSession = {
        id: `diag-${Date.now()}`,
        licenseType: license,
        mode: 'test',
        format: 'practice_questions',
        questions,
        results,
        startedAt: quizStartTime.current,
        completedAt: new Date().toISOString(),
        score: overall,
      };
      saveQuizSessionAsync(user.id, session).catch((err) =>
        console.warn('Failed to save quiz session:', err)
      );

      // Save domain scores
      const domainScores: DomainScore[] = domains.map((d) => ({
        domainId: d.domainId,
        domainName: d.domainName,
        totalQuestions: d.total,
        correctAnswers: d.correct,
        percentage: d.percentage,
        isWeak: d.percentage < 60,
        isStrong: d.percentage >= 80,
      }));
      saveDomainScores(user.id, license, domainScores).catch((err) =>
        console.warn('Failed to save domain scores:', err)
      );

      // Save assessment
      const assessmentResult = {
        ratings: domains.map((d) => ({
          categoryId: d.domainId,
          categoryName: d.domainName,
          rating: d.percentage >= 80 ? 5 : d.percentage >= 60 ? 3 : 1,
        })),
        weakAreas: weak,
        strongAreas: strong,
      };

      // Generate study plan
      setIsPlanLoading(true);
      generateWeakAreaPlan(license, weak, strong, examDate || undefined, user.id)
        .then((plan) => {
          setGeneratedPlan(plan);
          // Save with plan
          saveAssessmentAsync(user.id, { ...assessmentResult, suggestedPlan: plan }, license)
            .then(() => loadActivePlan())
            .catch(() => {});
        })
        .catch((err) => {
          console.warn('Failed to generate study plan:', err);
          // Save without plan
          saveAssessmentAsync(user.id, assessmentResult, license).catch(() => {});
        })
        .finally(() => {
          setIsPlanLoading(false);
          setStep('results');
        });
    } else {
      setStep('results');
    }
  }, [questions, results, license, user?.id, examDate, loadActivePlan]);

  // Keyboard navigation
  useEffect(() => {
    if (step !== 'quiz') return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && showRationale) {
        handleNext();
      }
      if (!selectedAnswer && !showRationale) {
        const keyMap: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', a: 'A', b: 'B', c: 'C', d: 'D' };
        const answer = keyMap[e.key.toLowerCase()];
        if (answer) handleSelectAnswer(answer);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  function getScoreBg(percentage: number): string {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  }

  function getScoreBadge(percentage: number): string {
    if (percentage >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percentage >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  }

  // ─── Setup Step ──────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="heading-2 text-slate-900 mb-2">Diagnostic Assessment</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Take a {DIAGNOSTIC_QUESTION_COUNT}-question diagnostic quiz to identify your strengths
            and weak areas. We'll create a personalized study plan based on your results.
          </p>
        </div>

        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Select your exam:</h3>
              <Select
                value={license || ''}
                onValueChange={(v) => setLicense(v as LicenseType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your exam type" />
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

            {license && (
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Exam Date (optional)
                </Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Your study plan intensity will be adjusted based on time remaining.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {license && (
          <>
            <Card className="border-blue-100 bg-blue-50/50 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-2">What to Expect</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{DIAGNOSTIC_QUESTION_COUNT} questions covering all {EXAM_DATA[license].categories.length} exam domains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Takes approximately 15-25 minutes to complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>See rationales after each question to learn as you go</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Get a personalized study plan based on your results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={generateDiagnostic}
              >
                <Target className="w-5 h-5 mr-2" />
                Start Diagnostic Assessment
              </Button>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            className="text-slate-500"
            onClick={() => navigate('/assessment')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            I already know my weak areas — skip to self-assessment
          </Button>
        </div>
      </div>
    );
  }

  // ─── Loading Step ────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="container-custom py-16 max-w-lg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="heading-3 text-slate-900 mb-2">Preparing Your Diagnostic</h2>
          <p className="text-slate-500 mb-6">
            Generating {DIAGNOSTIC_QUESTION_COUNT} exam-level questions across all domains...
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">This may take 15-30 seconds</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz Step ───────────────────────────────────────────────────────
  if (step === 'quiz' && currentQuestion) {
    return (
      <div className="container-custom py-6 md:py-8 max-w-3xl">
        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.topic}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="border-slate-200 mb-4">
          <CardContent className="p-6">
            <p className="text-lg font-medium text-slate-900 leading-relaxed">
              {currentQuestion.stem}
            </p>
          </CardContent>
        </Card>

        {/* Choices */}
        <div className="space-y-3 mb-6">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.label;
            const isCorrect = choice.label === currentQuestion.correctAnswer;
            const showFeedback = showRationale;

            let borderClass = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
            if (showFeedback && isCorrect) {
              borderClass = 'border-emerald-400 bg-emerald-50';
            } else if (showFeedback && isSelected && !isCorrect) {
              borderClass = 'border-red-400 bg-red-50';
            } else if (isSelected) {
              borderClass = 'border-blue-400 bg-blue-50';
            }

            if (showRationale) {
              borderClass += ' cursor-default';
            }

            return (
              <Card
                key={choice.label}
                className={`transition-all ${borderClass}`}
                onClick={() => handleSelectAnswer(choice.label)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      showFeedback && isCorrect
                        ? 'bg-emerald-500 text-white'
                        : showFeedback && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-blue-500 text-white'
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

        {/* Rationale */}
        {showRationale && (
          <Card className="border-blue-200 bg-blue-50/50 mb-6">
            <CardContent className="p-5">
              <h4 className="font-semibold text-blue-800 mb-2 text-sm">Explanation</h4>
              <p className="text-sm text-blue-700 leading-relaxed">{currentQuestion.rationale}</p>
              {currentQuestion.incorrectRationales?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {currentQuestion.incorrectRationales
                    .filter((ir) => ir.label === selectedAnswer || ir.label !== currentQuestion.correctAnswer)
                    .slice(0, 2)
                    .map((ir) => (
                      <p key={ir.label} className="text-xs text-blue-600">
                        <span className="font-semibold">{ir.label}:</span> {ir.explanation}
                      </p>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next button */}
        {showRationale && (
          <div className="text-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  View Results
                  <BarChart3 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-xs text-slate-400 mt-2">
              Press Enter to continue
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── Scoring Step ────────────────────────────────────────────────────
  if (step === 'scoring') {
    return (
      <div className="container-custom py-16 max-w-lg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="heading-3 text-slate-900 mb-2">Analyzing Your Results</h2>
          <p className="text-slate-500 mb-6">
            Calculating domain scores and generating your personalized study plan...
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-sm text-indigo-600 font-medium">Almost there...</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results Step ────────────────────────────────────────────────────
  if (step === 'results') {
    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        {/* Overall Score */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center mx-auto mb-4">
            <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
          <h1 className="heading-2 text-slate-900 mb-1">Diagnostic Complete</h1>
          <p className="text-slate-500">
            {results.filter((r) => r.isCorrect).length} of {results.length} questions correct
          </p>
        </div>

        {/* Domain Breakdown */}
        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Performance by Domain</h3>
            <div className="space-y-4">
              {domainResults
                .sort((a, b) => a.percentage - b.percentage)
                .map((domain) => (
                  <div key={domain.domainId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 truncate mr-2">
                        {domain.domainName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500">
                          {domain.correct}/{domain.total}
                        </span>
                        <Badge className={getScoreBadge(domain.percentage)}>
                          {domain.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getScoreBg(domain.percentage)}`}
                        style={{ width: `${domain.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Weak / Strong Areas */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-red-100 bg-red-50/30">
            <CardContent className="p-5">
              <h4 className="font-semibold text-red-800 mb-2 text-sm">Needs Focus ({weakAreas.length})</h4>
              {weakAreas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {weakAreas.map((area) => (
                    <Badge key={area} className="bg-red-100 text-red-700 border-red-200 text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-600">No weak areas identified — great job!</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="p-5">
              <h4 className="font-semibold text-emerald-800 mb-2 text-sm">Strong Areas ({strongAreas.length})</h4>
              {strongAreas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {strongAreas.map((area) => (
                    <Badge key={area} className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-600">Keep studying — you'll get there!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Study Plan */}
        {isPlanLoading && (
          <Card className="border-indigo-200 bg-indigo-50/50 mb-6">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-indigo-700">Generating your personalized study plan...</p>
            </CardContent>
          </Card>
        )}

        {generatedPlan && (
          <Card className="border-slate-200 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">
                {generatedPlan.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{generatedPlan.timeHorizon} plan</p>
              <div className="space-y-3">
                {generatedPlan.weeklyPlan.slice(0, 4).map((week) => (
                  <div
                    key={week.week}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                      W{week.week}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-800">{week.focus}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {week.reviewCadence} · {week.practiceFrequency}
                      </p>
                    </div>
                  </div>
                ))}
                {generatedPlan.weeklyPlan.length > 4 && (
                  <p className="text-xs text-slate-400 text-center">
                    +{generatedPlan.weeklyPlan.length - 4} more weeks — view full plan on your dashboard
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/plan')}
          >
            View Full Study Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (license) setSelectedLicense(license);
              navigate('/generator');
            }}
          >
            Practice Weak Areas
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
