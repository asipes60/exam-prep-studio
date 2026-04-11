import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { useAuth } from '@/hooks/use-auth';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { generateWeakAreaPlan } from '@/lib/exam-prep-ai';
import { saveAssessment, saveAssessmentAsync } from '@/lib/exam-prep-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LicenseType, WeakAreaRating, StudyPlan, StudyFormat } from '@/types/exam-prep';
import { Brain, ArrowRight, CheckCircle, AlertTriangle, Loader2, Sparkles, Calendar, Target } from 'lucide-react';

type AssessmentStep = 'choose' | 'rate' | 'results';

const ratingLabels: Record<number, string> = {
  1: 'Very Weak',
  2: 'Weak',
  3: 'Moderate',
  4: 'Strong',
  5: 'Very Strong',
};

export default function ExamPrepAssessment() {
  const { setSelectedLicense, setPendingConfig, loadActivePlan } = useExamPrep();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<AssessmentStep>('choose');
  const [approach, setApproach] = useState<'know' | 'help' | null>(null);
  const [license, setLicense] = useState<LicenseType | null>(null);
  const [ratings, setRatings] = useState<WeakAreaRating[]>([]);
  const [manualWeakAreas, setManualWeakAreas] = useState<string[]>([]);
  const [examDate, setExamDate] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function initRatings(lic: LicenseType) {
    const exam = EXAM_DATA[lic];
    const r: WeakAreaRating[] = exam.categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      rating: 3,
    }));
    setRatings(r);
  }

  function handleLicenseSelect(lic: LicenseType) {
    setLicense(lic);
    initRatings(lic);
  }

  function updateRating(categoryId: string, value: number) {
    setRatings((prev) =>
      prev.map((r) => (r.categoryId === categoryId ? { ...r, rating: value } : r))
    );
  }

  function toggleManualArea(topic: string) {
    setManualWeakAreas((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  async function handleGeneratePlan() {
    if (!license) return;
    setIsLoading(true);

    let weakAreas: string[];
    if (approach === 'know') {
      weakAreas = manualWeakAreas;
    } else {
      weakAreas = ratings
        .filter((r) => r.rating <= 2)
        .map((r) => r.categoryName);
    }

    const strongAreas =
      approach === 'help'
        ? ratings.filter((r) => r.rating >= 4).map((r) => r.categoryName)
        : [];

    try {
      const plan = await generateWeakAreaPlan(
        license,
        weakAreas,
        strongAreas,
        examDate || undefined,
        user?.id,
      );
      setGeneratedPlan(plan);

      const assessmentResult = {
        ratings,
        weakAreas,
        strongAreas,
        suggestedPlan: plan,
      };

      // Save to Supabase if authenticated, otherwise localStorage
      if (user?.id) {
        saveAssessmentAsync(user.id, assessmentResult, license)
          .then(() => loadActivePlan())
          .catch(() => {});
      } else {
        saveAssessment(assessmentResult);
      }

      setStep('results');
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoToGenerator() {
    if (!license || !generatedPlan) return;

    setSelectedLicense(license);

    // Build a generator config from the first week of the study plan
    const firstWeek = generatedPlan.weeklyPlan[0];
    const topic = firstWeek?.topics?.[0] || generatedPlan.weakAreas[0] || 'General Review';
    const format = firstWeek?.materialTypes?.[0] || 'practice_questions';

    // Determine appropriate item count based on format
    const itemCount = format === 'clinical_vignette' ? 1
      : format === 'study_guide' || format === 'quick_reference' ? 1
      : 10;

    setPendingConfig({
      licenseType: license,
      studyFormat: format as StudyFormat,
      topic,
      difficulty: 'exam_level',
      itemCount,
      includeRationales: true,
      californiaEmphasis: true,
      isBeginnerReview: false,
    });

    navigate('/generator');
  }

  return (
    <div className="container-custom py-8 md:py-12 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="heading-2 text-slate-900 mb-2">Weak Area Assessment</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Identify your weak areas and get a personalized study plan tailored to your needs.
        </p>
      </div>

      {step === 'choose' && (
        <div className="space-y-6">
          {/* Diagnostic CTA */}
          <Card
            className="border-2 border-blue-200 bg-blue-50/50 cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
            onClick={() => navigate('/diagnostic')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-800 mb-0.5">Take the Diagnostic Quiz</h3>
                <p className="text-sm text-blue-600">
                  Answer 30 exam-level questions to precisely identify your weak areas.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 shrink-0" />
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Or assess yourself manually
            </p>
          </div>

          {/* License Selection */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-3">First, select your exam:</h3>
              <Select
                value={license || ''}
                onValueChange={(v) => handleLicenseSelect(v as LicenseType)}
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
              {license && (
                <div className="mt-4">
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
                    We'll adjust your study plan intensity based on how much time you have.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {license && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Card
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                  approach === 'know'
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
                onClick={() => setApproach('know')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">I Know My Weak Areas</h3>
                  <p className="text-sm text-slate-500">
                    Select the topics you need to focus on and get targeted study materials.
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                  approach === 'help'
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
                onClick={() => setApproach('help')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Help Me Figure It Out</h3>
                  <p className="text-sm text-slate-500">
                    Rate your confidence across topics and we will identify your weak spots.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {approach === 'know' && license && (
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Select your weak areas:
                </h3>
                <div className="space-y-3">
                  {EXAM_DATA[license].categories.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {cat.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cat.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant={manualWeakAreas.includes(topic) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-colors ${
                              manualWeakAreas.includes(topic)
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'hover:bg-blue-50'
                            }`}
                            onClick={() => toggleManualArea(topic)}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                  onClick={handleGeneratePlan}
                  disabled={manualWeakAreas.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate My Study Plan
                </Button>
              </CardContent>
            </Card>
          )}

          {approach === 'help' && license && (
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-1">
                  Rate your confidence in each area:
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  1 = Very Weak, 5 = Very Strong
                </p>
                <div className="space-y-6">
                  {ratings.map((r) => (
                    <div key={r.categoryId}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{r.categoryName}</span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            r.rating <= 2
                              ? 'bg-red-100 text-red-700'
                              : r.rating === 3
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {ratingLabels[r.rating]}
                        </span>
                      </div>
                      <Slider
                        value={[r.rating]}
                        onValueChange={(v) => updateRating(r.categoryId, v[0])}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                  onClick={handleGeneratePlan}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Analyze & Generate Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === 'results' && generatedPlan && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-emerald-800 mb-3">Assessment Complete</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Areas to Focus On</p>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedPlan.weakAreas.map((area) => (
                      <Badge key={area} className="bg-red-100 text-red-700 border-red-200">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                {approach === 'help' && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Strong Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ratings
                        .filter((r) => r.rating >= 4)
                        .map((r) => (
                          <Badge
                            key={r.categoryId}
                            className="bg-emerald-100 text-emerald-700 border-emerald-200"
                          >
                            {r.categoryName}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Plan */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-montserrat font-semibold text-slate-900 mb-1">
                {generatedPlan.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{generatedPlan.timeHorizon} plan</p>

              <div className="space-y-3">
                {generatedPlan.weeklyPlan.map((week) => (
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
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleGoToGenerator}
            >
              Start Generating Materials
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep('choose');
                setApproach(null);
                setGeneratedPlan(null);
                setManualWeakAreas([]);
              }}
            >
              Retake Assessment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
