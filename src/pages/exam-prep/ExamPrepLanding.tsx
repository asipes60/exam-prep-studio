import { Link, useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { useAuth } from '@/hooks/use-auth';
import DashboardSummaryWidget from '@/components/exam-prep/DashboardSummaryWidget';
import { EXAM_DATA, STUDY_FORMAT_OPTIONS } from '@/data/exam-prep-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { LicenseType } from '@/types/exam-prep';
import {
  BookOpen,
  Users,
  Heart,
  Scale,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  CheckCircle,
  Brain,
  FileText,
  Layers,
  Award,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  Heart,
  Scale,
};

const featureIcons = [Sparkles, Brain, FileText, Layers, Clock, Award];

export default function ExamPrepLanding() {
  const { setSelectedLicense, selectedLicense } = useExamPrep();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  function handleExamSelect(license: LicenseType) {
    setSelectedLicense(license);
    navigate('/generator');
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Study Materials for California Licensure
            </div>
            <h1 className="heading-1 text-slate-900 mb-5">
              Prepare for Your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}California Licensing Exam{' '}
              </span>
              with Confidence
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Generate customized practice questions, flashcards, study guides, and personalized
              study plans — tailored to your exam, your weak areas, and California-specific content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-base px-8 h-12"
                onClick={() => {
                  document.getElementById('exam-select')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Studying <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link to="/assessment">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-12 w-full sm:w-auto border-slate-300"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Find My Weak Areas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Summary (logged-in users with quiz data) */}
      {isAuthenticated && (
        <section className="py-6">
          <div className="container-custom max-w-3xl">
            <DashboardSummaryWidget licenseType={selectedLicense ?? (user?.preferredLicense as LicenseType | null) ?? null} />
          </div>
        </section>
      )}

      {/* Exam Selection */}
      <section id="exam-select" className="py-16 md:py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-slate-900 mb-3">Choose Your Exam</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Select the licensure exam you are preparing for. Each path is structured with
              California-specific content and relevant topic categories.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {Object.values(EXAM_DATA).map((exam) => {
              const Icon = iconMap[exam.icon] || BookOpen;
              return (
                <Card
                  key={exam.id}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 ${exam.borderColor} hover:border-opacity-100 border-opacity-60`}
                  onClick={() => handleExamSelect(exam.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-14 h-14 rounded-xl ${exam.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-7 h-7 ${exam.color}`} />
                    </div>
                    <h3 className="font-montserrat font-semibold text-slate-900 mb-2">
                      {exam.shortTitle}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      {exam.description}
                    </p>
                    <div className="text-xs text-slate-400">
                      {exam.categories.reduce((sum, c) => sum + c.topics.length, 0)}+ topics
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mt-3 ${exam.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      Start Prep <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What You Can Generate */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-slate-900 mb-3">What You Can Generate</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Choose from 10 different study material formats, all customized to your exam,
              topic, and difficulty level.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {STUDY_FORMAT_OPTIONS.map((fmt, i) => {
              const Icon = featureIcons[i % featureIcons.length];
              return (
                <div
                  key={fmt.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <Icon className="w-5 h-5 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">{fmt.label}</h4>
                  <p className="text-xs text-slate-500">{fmt.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-slate-900 mb-3">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Select Your Exam',
                desc: 'Choose LPCC, LMFT, LCSW, or Law & Ethics to load exam-specific content and topic categories.',
              },
              {
                step: '2',
                title: 'Customize Your Materials',
                desc: 'Pick a study format, topic, difficulty, and preferences. Tell us what you need help with.',
              },
              {
                step: '3',
                title: 'Study & Practice',
                desc: 'Get instant, structured study materials. Save, organize, and revisit them anytime.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-montserrat font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="font-montserrat font-semibold text-xl text-slate-900">
                  Important Information
                </h2>
              </div>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p>
                    This tool is for <strong>educational and study support purposes only</strong>. It does
                    not replace official exam preparation materials, legal consultation, clinical
                    supervision, or professional judgment.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p>
                    Generated content does not guarantee licensure exam outcomes. Use it as a supplement
                    to your comprehensive study plan.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p>
                    Always verify legal and regulatory information with the{' '}
                    <strong>California Board of Behavioral Sciences (BBS)</strong> and other
                    authoritative sources.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p>
                    When the system is uncertain about specific statutes or regulations, it will indicate
                    this and encourage verification rather than presenting uncertain information as fact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-slate-900 mb-4">Ready to Start Studying?</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            Choose your exam above or let us help you identify your weak areas and build a
            personalized study plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8"
              onClick={() => {
                document.getElementById('exam-select')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Choose Your Exam
            </Button>
            {!isAuthenticated && (
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-slate-300 w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
