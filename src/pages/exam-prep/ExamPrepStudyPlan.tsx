import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { toggleWeekCompleted } from '@/lib/exam-prep-storage';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { GeneratorConfig, StudyFormat } from '@/types/exam-prep';
import {
  CalendarDays,
  CheckCircle,
  Circle,
  Sparkles,
  ArrowRight,
  Brain,
  Loader2,
  BookOpen,
} from 'lucide-react';

export default function ExamPrepStudyPlan() {
  const { isAuthenticated } = useAuth();
  const { activePlan, planLoading, setPendingConfig, setSelectedLicense, loadActivePlan } = useExamPrep();
  const navigate = useNavigate();
  const [completedWeeks, setCompletedWeeks] = useState<number[]>(activePlan?.completedWeeks ?? []);
  const [toggling, setToggling] = useState<number | null>(null);

  // Sync completed weeks when activePlan changes
  useEffect(() => {
    if (activePlan && !toggling) {
      setCompletedWeeks(activePlan.completedWeeks);
    }
  }, [activePlan?.completedWeeks, toggling]);

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center max-w-md">
        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="font-montserrat font-semibold text-xl text-slate-900 mb-2">
          Sign in to view your study plan
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Take the weak area assessment to get a personalized study plan.
        </p>
        <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
          Sign In
        </Button>
      </div>
    );
  }

  if (planLoading) {
    return (
      <div className="container-custom py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="container-custom py-16 text-center max-w-md">
        <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="font-montserrat font-semibold text-xl text-slate-900 mb-2">
          No Study Plan Yet
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Take the weak area assessment to get a personalized, week-by-week study plan tailored to your exam.
        </p>
        <Button
          onClick={() => navigate('/assessment')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Take Assessment
        </Button>
      </div>
    );
  }

  const { plan, licenseType } = activePlan;
  const exam = EXAM_DATA[licenseType];
  const totalWeeks = plan.weeklyPlan.length;
  const completedCount = completedWeeks.length;
  const progressPct = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

  async function handleToggleWeek(weekNum: number) {
    setToggling(weekNum);
    try {
      const updated = await toggleWeekCompleted(activePlan!.id, weekNum);
      setCompletedWeeks(updated);
    } catch {
      // silently fail
    } finally {
      setToggling(null);
    }
  }

  function handleGenerateForWeek(week: typeof plan.weeklyPlan[0]) {
    const topic = week.topics?.[0] || plan.weakAreas?.[0] || 'General Review';
    const format = (week.materialTypes?.[0] || 'practice_questions') as StudyFormat;
    const itemCount =
      format === 'clinical_vignette' ? 1
      : format === 'study_guide' || format === 'quick_reference' ? 1
      : 10;

    const config: GeneratorConfig = {
      licenseType,
      studyFormat: format,
      topic,
      difficulty: 'exam_level',
      itemCount,
      includeRationales: true,
      californiaEmphasis: true,
      isBeginnerReview: false,
    };

    setSelectedLicense(licenseType);
    setPendingConfig(config);
    navigate('/generator');
  }

  return (
    <div className="container-custom py-8 md:py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-montserrat font-bold text-xl text-slate-900">
              {plan.title || 'Your Study Plan'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary">{exam?.shortTitle}</Badge>
              <span className="text-xs text-slate-400">{plan.timeHorizon}</span>
              <span className="text-xs text-slate-400">
                Created {new Date(activePlan.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <Progress value={progressPct} className="h-2.5 flex-1" />
          <span className="text-sm font-semibold text-slate-700 shrink-0">
            {completedCount}/{totalWeeks} weeks
          </span>
        </div>
      </div>

      {/* Weak Areas */}
      {plan.weakAreas && plan.weakAreas.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Focus Areas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {plan.weakAreas.map((area) => (
              <Badge key={area} className="bg-red-100 text-red-700 text-xs border-red-200">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Cards */}
      <div className="space-y-3">
        {plan.weeklyPlan.map((week) => {
          const isCompleted = completedWeeks.includes(week.week);
          const isToggling = toggling === week.week;

          return (
            <Card
              key={week.week}
              className={`border transition-colors ${
                isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Week indicator */}
                  <button
                    onClick={() => handleToggleWeek(week.week)}
                    disabled={isToggling}
                    className="shrink-0 mt-0.5"
                  >
                    {isToggling ? (
                      <Loader2 className="w-7 h-7 text-slate-300 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                    ) : (
                      <Circle className="w-7 h-7 text-blue-300 hover:text-blue-500 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold text-sm ${isCompleted ? 'text-emerald-800' : 'text-slate-800'}`}>
                        Week {week.week}: {week.focus}
                      </h3>
                    </div>

                    {/* Topics */}
                    {week.topics && week.topics.length > 0 && (
                      <p className="text-xs text-slate-500 mb-2">
                        {week.topics.join(' · ')}
                      </p>
                    )}

                    {/* Material types + cadence */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {week.materialTypes?.map((mt) => (
                        <Badge key={mt} variant="outline" className="text-xs">
                          {mt.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {week.reviewCadence} · {week.practiceFrequency}
                    </p>

                    {/* Actions */}
                    {!isCompleted && (
                      <Button
                        size="sm"
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={() => handleGenerateForWeek(week)}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Generate Materials
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All weeks completed */}
      {completedCount === totalWeeks && totalWeeks > 0 && (
        <Card className="border-emerald-300 bg-emerald-50 mt-6">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-emerald-800 mb-1">Plan Complete!</h3>
            <p className="text-sm text-emerald-700">
              You've completed all weeks. Take a practice quiz to test your readiness, or retake the assessment to create a new plan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button variant="outline" onClick={() => navigate('/assessment')}>
          <Brain className="w-4 h-4 mr-2" />
          Retake Assessment
        </Button>
        <Button variant="outline" onClick={() => navigate('/quiz')}>
          <BookOpen className="w-4 h-4 mr-2" />
          Take a Quiz
        </Button>
      </div>
    </div>
  );
}
