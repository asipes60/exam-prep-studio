import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LicenseType } from '@/types/exam-prep';
import { getAllActivePlansAsync, type ActivePlanData } from '@/lib/exam-prep-storage';
import {
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Trophy,
  ArrowRight,
  Loader2,
  Brain,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

export default function ExamPrepDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [license, setLicense] = useState<LicenseType | null>(null);
  const { data, loading } = useDashboardData(license);
  const [allPlans, setAllPlans] = useState<ActivePlanData[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setAllPlans([]);
      return;
    }
    setPlansLoading(true);
    getAllActivePlansAsync(user.id)
      .then(setAllPlans)
      .catch((err) => console.warn('Failed to load active plans:', err))
      .finally(() => setPlansLoading(false));
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center max-w-md">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="font-montserrat font-semibold text-xl text-slate-900 mb-2">
          Sign in to view your dashboard
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Track your progress across exam domains and identify weak areas.
        </p>
        <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 md:py-12 max-w-4xl">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-montserrat font-semibold tracking-tight text-foreground text-2xl sm:text-3xl lg:text-4xl mb-1">
            Your Progress Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Track your exam readiness by domain.
          </p>
        </div>
        <Select value={license || ''} onValueChange={(v) => setLicense(v as LicenseType)}>
          <SelectTrigger className="w-full lg:w-[200px] shrink-0">
            <SelectValue placeholder="Select exam" />
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

      {/* Active Study Plans (cross-track, independent of the dropdown) */}
      <section className="mb-8">
        <h2 className="font-montserrat font-semibold text-slate-900 text-lg mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Active Study Plans
        </h2>

        {plansLoading ? (
          <Card className="border-slate-200">
            <CardContent className="p-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : allPlans.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">No study plan yet</p>
                <p className="text-xs text-slate-500">
                  Take the assessment to get a personalized plan for any exam track.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/assessment')}>
                <Brain className="w-3 h-3 mr-1" />
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {allPlans.map((p) => {
              const plan = p.suggestedPlan;
              if (!plan) return null;
              const totalWeeks = plan.weeklyPlan.length;
              const completedCount = p.completedWeeks.length;
              const percent =
                totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;
              const currentWeek = plan.weeklyPlan.find(
                (w) => !p.completedWeeks.includes(w.week),
              );
              const examLabel = EXAM_DATA[p.licenseType]?.shortTitle ?? p.licenseType;
              return (
                <Card key={p.id} className="border-slate-200 min-w-0">
                  <CardContent className="p-4 sm:p-5 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <Badge className="bg-primary-light text-primary-dark border-0 text-[11px] font-medium mb-1.5">
                          {examLabel}
                        </Badge>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2 break-words">
                          {currentWeek
                            ? `Week ${currentWeek.week}: ${currentWeek.focus}`
                            : 'All weeks completed'}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-primary-dark">
                        {percent}%
                      </span>
                    </div>
                    <Progress value={percent} className="h-2 mb-3" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 truncate">
                        {completedCount}/{totalWeeks} weeks completed
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary-dark text-xs h-7 px-2 shrink-0"
                        onClick={() => {
                          setLicense(p.licenseType);
                          navigate('/plan');
                        }}
                      >
                        {currentWeek ? 'Continue' : 'Review'}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {!license && (
        <Card className="border-slate-200">
          <CardContent className="p-6 sm:p-10 text-center">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Select an exam above to view your progress by domain.
            </p>
          </CardContent>
        </Card>
      )}

      {license && loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {license && !loading && data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {data.totalQuestions > 0 ? `${data.readinessScore}%` : '—'}
                </p>
                <p className="text-xs text-slate-500">Readiness Score</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{data.totalQuizzes}</p>
                <p className="text-xs text-slate-500">Quizzes Taken</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{data.weakAreas.length}</p>
                <p className="text-xs text-slate-500">Weak Areas</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{data.strongAreas.length}</p>
                <p className="text-xs text-slate-500">Strong Areas</p>
              </CardContent>
            </Card>
          </div>

          {/* Domain Progress Bars */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-montserrat font-semibold text-slate-900 mb-4">
                Domain Performance
              </h3>
              {data.domainScores.length > 0 ? (
                <div className="space-y-4">
                  {data.domainScores.map((d) => {
                    const barColor = d.totalQuestions === 0
                      ? 'bg-slate-200'
                      : d.isWeak
                      ? 'bg-red-500'
                      : d.isStrong
                      ? 'bg-emerald-500'
                      : 'bg-amber-500';

                    return (
                      <div key={d.domainId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-700 truncate pr-4">
                            {d.domainName}
                          </span>
                          <span className="text-sm font-semibold text-slate-900 shrink-0">
                            {d.totalQuestions > 0 ? `${d.percentage}%` : 'No data'}
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${d.totalQuestions > 0 ? Math.max(d.percentage, 2) : 0}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-slate-400">
                            {d.totalQuestions > 0
                              ? `${d.correctAnswers}/${d.totalQuestions} correct`
                              : 'Take a quiz to track this domain'}
                          </span>
                          {d.isWeak && (
                            <Badge className="bg-red-100 text-red-700 text-xs border-red-200">
                              Needs Focus
                            </Badge>
                          )}
                          {d.isStrong && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs border-emerald-200">
                              Strong
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  No quiz data yet. Take a quiz to start tracking your progress.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Weak Area Alerts */}
          {data.weakAreas.length > 0 && (
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas Needing Focus
                </h3>
                <div className="space-y-2">
                  {data.weakAreas.map((area) => (
                    <div key={area} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{area}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-red-200 text-red-700 hover:bg-red-100"
                        onClick={() => navigate('/generator')}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Practice
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Quizzes */}
          {data.recentQuizzes.length > 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-montserrat font-semibold text-slate-900 mb-4">
                  Recent Quizzes
                </h3>
                <div className="space-y-2">
                  {data.recentQuizzes.map((q) => {
                    const pct = q.total > 0 ? Math.round((q.score / q.total) * 100) : 0;
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {q.score}/{q.total} correct ({pct}%)
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(q.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            pct >= 80
                              ? 'bg-emerald-100 text-emerald-700'
                              : pct >= 60
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {pct}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/quiz')}
            >
              Take a Quiz <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/assessment')}>
              <Brain className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
            <Button variant="outline" onClick={() => navigate('/generator')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Materials
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
