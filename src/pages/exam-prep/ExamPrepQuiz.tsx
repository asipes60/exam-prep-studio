import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { generateStudyMaterial } from '@/lib/exam-prep-ai';
import { saveQuizSession } from '@/lib/exam-prep-storage';
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
  DifficultyLevel,
  PracticeQuestion,
  QuizSession,
  QuizResult,
  StudyMode,
} from '@/types/exam-prep';
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
  BarChart3,
} from 'lucide-react';

type QuizState = 'setup' | 'active' | 'review';

export default function ExamPrepQuiz() {
  const { selectedLicense, setSelectedLicense, studyMode, setStudyMode } = useExamPrep();
  const navigate = useNavigate();

  const [state, setState] = useState<QuizState>('setup');
  const [license, setLicense] = useState<LicenseType | null>(selectedLicense);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questionCount, setQuestionCount] = useState(10);
  const [mode, setMode] = useState<StudyMode>(studyMode);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);

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
    try {
      const content = await generateStudyMaterial({
        licenseType: license,
        studyFormat: 'practice_questions',
        topic: 'General Review',
        difficulty,
        itemCount: questionCount,
        includeRationales: true,
        californiaEmphasis: true,
        isBeginnerReview: difficulty === 'beginner',
      });
      if (content.type === 'practice_questions') {
        setQuestions(content.data);
        setState('active');
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setCurrentIdx(0);
        setResults([]);
        setStudyMode(mode);
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswer(label: string) {
    if (selectedAnswer) return;
    setSelectedAnswer(label);

    const q = questions[currentIdx];
    const isCorrect = label === q.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;

    const result: QuizResult = {
      questionId: q.id,
      selectedAnswer: label,
      isCorrect,
      timeSpent,
    };

    setResults((prev) => [...prev, result]);

    if (mode === 'study') {
      setShowRationale(true);
    }
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
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
      questions,
      results,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      score: results.filter((r) => r.isCorrect).length,
    };
    saveQuizSession(session);
    setState('review');
  }

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const score = results.filter((r) => r.isCorrect).length;

  if (state === 'setup') {
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

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">License Type</label>
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

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Difficulty</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="exam_level">Exam Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Questions: {questionCount}
              </label>
              <Select
                value={String(questionCount)}
                onValueChange={(v) => setQuestionCount(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="25">25 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              onClick={handleStart}
              disabled={!license || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparing Quiz...
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

  if (state === 'active' && currentQuestion) {
    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Question {currentIdx + 1} of {questions.length}
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

        {/* Question */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{currentQuestion.difficulty}</Badge>
              <Badge variant="secondary">{currentQuestion.topic}</Badge>
            </div>

            <p className="text-slate-800 leading-relaxed mb-6">{currentQuestion.stem}</p>

            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedAnswer === choice.label;
                const isCorrectChoice = choice.label === currentQuestion.correctAnswer;
                const hasAnswered = !!selectedAnswer;

                let style = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
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
                  {currentIdx < questions.length - 1 ? (
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

  // Review State
  if (state === 'review') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        {/* Score Card */}
        <Card className="border-slate-200 mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className={`w-10 h-10 ${percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <h2 className="font-montserrat font-bold text-3xl text-slate-900 mb-1">
              {score} / {questions.length}
            </h2>
            <p className="text-lg text-slate-500 mb-4">{percentage}% Correct</p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {score} Correct
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                {questions.length - score} Incorrect
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
        <div className="space-y-4">
          {questions.map((q, i) => {
            const result = results[i];
            const isCorrect = result?.isCorrect;
            return (
              <Card
                key={q.id}
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
                      <p className="text-sm text-slate-800 mb-2">{q.stem}</p>
                      {!isCorrect && (
                        <div className="text-sm space-y-1 mb-2">
                          <p className="text-red-600">
                            Your answer: {result?.selectedAnswer}
                          </p>
                          <p className="text-emerald-600">
                            Correct answer: {q.correctAnswer}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                        {q.rationale}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
