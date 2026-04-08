import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { supabase } from '@/integrations/supabase/client';
import { EXAM_DATA } from '@/data/exam-prep-data';
import type { LicenseType } from '@/types/exam-prep';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Heart,
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Calendar,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// License types users pick from (not LAW_ETHICS — that's auto-mapped)
type PrimaryLicense = 'LMFT' | 'LPCC' | 'LCSW';

// Map license → which exam tracks are available
const LICENSE_EXAM_MAP: Record<PrimaryLicense, { id: LicenseType; name: string; description: string }[]> = {
  LMFT: [
    { id: 'LAW_ETHICS', name: 'California Law & Ethics Exam', description: 'Required for all BBS license types — 75 questions on CA law, ethics codes, and mandated reporting' },
    { id: 'LMFT', name: 'California MFT Clinical Exam', description: '150 questions on systemic therapy, assessment, treatment planning, and family systems theories' },
  ],
  LPCC: [
    { id: 'LAW_ETHICS', name: 'California Law & Ethics Exam', description: 'Required for all BBS license types — 75 questions on CA law, ethics codes, and mandated reporting' },
    { id: 'LPCC', name: 'NCMHCE (National Clinical Mental Health Counseling Exam)', description: '11 clinical simulations testing assessment, diagnosis, treatment planning, and counseling skills' },
  ],
  LCSW: [
    { id: 'LAW_ETHICS', name: 'California Law & Ethics Exam', description: 'Required for all BBS license types — 75 questions on CA law, ethics codes, and mandated reporting' },
    { id: 'LCSW', name: 'ASWB Clinical Exam', description: '170 questions on human development, assessment, interventions, and professional ethics' },
  ],
};

const LICENSE_OPTIONS: { id: PrimaryLicense; label: string; subtitle: string; icon: typeof BookOpen; color: string; bgColor: string; borderColor: string }[] = [
  { id: 'LMFT', label: 'LMFT', subtitle: 'Licensed Marriage & Family Therapist', icon: Users, color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300' },
  { id: 'LPCC', label: 'LPCC', subtitle: 'Licensed Professional Clinical Counselor', icon: BookOpen, color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: 'LCSW', label: 'LCSW', subtitle: 'Licensed Clinical Social Worker', icon: Heart, color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
];

const STEPS = ['License', 'Exams', 'Pathway'] as const;

export default function ExamPrepOnboarding() {
  const { user } = useAuth();
  const { setSelectedLicense } = useExamPrep();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedLicense, setLicense] = useState<PrimaryLicense | null>(null);
  const [selectedExams, setSelectedExams] = useState<LicenseType[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleExam = useCallback((examId: LicenseType) => {
    setSelectedExams((prev) =>
      prev.includes(examId) ? prev.filter((e) => e !== examId) : [...prev, examId]
    );
  }, []);

  const handleComplete = useCallback(async (pathway: 'assessment' | 'explore') => {
    if (!user || !selectedLicense) return;
    setSaving(true);
    try {
      // Save to profile
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_license: selectedLicense,
          onboarding_completed_at: new Date().toISOString(),
          selected_exams: selectedExams,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Set context for immediate use
      setSelectedLicense(selectedExams[0] ?? selectedLicense);

      if (pathway === 'assessment') {
        navigate('/assessment');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [user, selectedLicense, selectedExams, setSelectedLicense, navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step
                    ? 'bg-blue-600 text-white'
                    : i === step
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i === step ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: License Selection */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-montserrat font-bold text-2xl text-slate-900">
                What license are you pursuing?
              </h1>
              <p className="text-slate-500 mt-2">
                This determines which exam tracks we'll set up for you.
              </p>
            </div>

            <div className="grid gap-4">
              {LICENSE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedLicense === opt.id;
                return (
                  <Card
                    key={opt.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? `${opt.borderColor} ${opt.bgColor} ring-2 ring-offset-1`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => {
                      setLicense(opt.id);
                      // Pre-select both exams by default
                      setSelectedExams(LICENSE_EXAM_MAP[opt.id].map((e) => e.id));
                    }}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className={`w-12 h-12 rounded-xl ${opt.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${opt.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-slate-900">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-sm text-slate-500">{opt.subtitle}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!selectedLicense}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Exam Track Selection */}
        {step === 1 && selectedLicense && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-montserrat font-bold text-2xl text-slate-900">
                Your exam tracks
              </h1>
              <p className="text-slate-500 mt-2">
                As a California {selectedLicense} candidate, you need to pass these exams.
                <br />
                Select the one(s) you want to prep for now.
              </p>
            </div>

            <div className="grid gap-4">
              {LICENSE_EXAM_MAP[selectedLicense].map((exam) => {
                const isSelected = selectedExams.includes(exam.id);
                const examData = EXAM_DATA[exam.id];
                return (
                  <Card
                    key={exam.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? `${examData.borderColor} ${examData.bgColor} ring-2 ring-offset-1`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleExam(exam.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg ${examData.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          {exam.id === 'LAW_ETHICS' ? (
                            <Scale className={`w-5 h-5 ${examData.color}`} />
                          ) : exam.id === 'LMFT' ? (
                            <Users className={`w-5 h-5 ${examData.color}`} />
                          ) : exam.id === 'LPCC' ? (
                            <BookOpen className={`w-5 h-5 ${examData.color}`} />
                          ) : (
                            <Heart className={`w-5 h-5 ${examData.color}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{exam.name}</span>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{exam.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedExams.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pathway Choice */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-montserrat font-bold text-2xl text-slate-900">
                How would you like to start?
              </h1>
              <p className="text-slate-500 mt-2">
                You can always switch later. Pick what feels right for now.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card
                className="cursor-pointer transition-all hover:shadow-md border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                onClick={() => !saving && handleComplete('assessment')}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
                    <ClipboardList className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Diagnostic Assessment</h3>
                    <p className="text-sm text-slate-500 mt-2">
                      Rate your confidence across exam domains. We'll build a personalized study plan targeting your weak areas.
                    </p>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Recommended for most students</div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all hover:shadow-md border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                onClick={() => !saving && handleComplete('explore')}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                    <Calendar className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Jump In & Explore</h3>
                    <p className="text-sm text-slate-500 mt-2">
                      Go straight to the dashboard and start generating practice questions, flashcards, and study guides.
                    </p>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">Best if you already know your weak spots</div>
                </CardContent>
              </Card>
            </div>

            {saving && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up your account...
              </div>
            )}

            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={saving}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
