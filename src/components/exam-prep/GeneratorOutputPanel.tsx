import { useState } from 'react';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { EXAM_DATA, STUDY_FORMAT_OPTIONS } from '@/data/exam-prep-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  GeneratedContent,
  PracticeQuestion,
  Flashcard,
  StudyGuide,
  QuickReference,
  StudyPlan,
  ClinicalVignette,
  SavedMaterial,
  StudyFormat,
} from '@/types/exam-prep';
import {
  Save,
  Copy,
  RotateCcw,
  Printer,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Loader2,
  FileText,
  Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { flagAuditEntry } from '@/lib/audit-log';

function QuestionsView({ questions, showRationales }: { questions: PracticeQuestion[]; showRationales?: boolean }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectAnswer(qId: string, label: string) {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: label }));
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const isExpanded = expanded[q.id];
        const selected = selectedAnswers[q.id];
        const isCorrect = selected === q.correctAnswer;
        const hasAnswered = !!selected;

        return (
          <Card key={q.id} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {q.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {q.topic}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed mb-4">{q.stem}</p>

              <div className="space-y-2">
                {q.choices.map((choice) => {
                  const isSelected = selected === choice.label;
                  const isCorrectChoice = choice.label === q.correctAnswer;
                  let choiceStyle = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
                  if (hasAnswered) {
                    if (isCorrectChoice) choiceStyle = 'border-emerald-300 bg-emerald-50';
                    else if (isSelected && !isCorrect) choiceStyle = 'border-red-300 bg-red-50';
                    else choiceStyle = 'border-slate-200 opacity-60';
                  }

                  return (
                    <button
                      key={choice.label}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${choiceStyle}`}
                      onClick={() => !hasAnswered && selectAnswer(q.id, choice.label)}
                      disabled={hasAnswered}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-slate-500 shrink-0">{choice.label}.</span>
                        <span className="text-slate-700">{choice.text}</span>
                        {hasAnswered && isCorrectChoice && (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="mt-4">
                  <button
                    className="flex items-center gap-1 text-sm text-blue-600 font-medium"
                    onClick={() => toggleExpand(q.id)}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Hide' : 'Show'} Rationale
                  </button>
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm space-y-3">
                      <div>
                        <p className="font-semibold text-emerald-700 mb-1">Correct Answer: {q.correctAnswer}</p>
                        <p className="text-slate-700">{q.rationale}</p>
                      </div>
                      {q.incorrectRationales.map((ir) => (
                        <div key={ir.label}>
                          <p className="font-medium text-slate-500">Why not {ir.label}:</p>
                          <p className="text-slate-600">{ir.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FlashcardsView({ cards }: { cards: Flashcard[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFlipped((prev) => ({ ...prev, [card.id]: !prev[card.id] }))}
        >
          <CardContent className="p-5 min-h-[160px] flex flex-col justify-between">
            <Badge variant="secondary" className="w-fit text-xs mb-3">
              {card.category}
            </Badge>
            {flipped[card.id] ? (
              <div>
                <p className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wider">Answer</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{card.back}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">Question</p>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">{card.front}</p>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3 text-center">
              {flipped[card.id] ? 'Click to see question' : 'Click to reveal answer'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StudyGuideView({ guide }: { guide: StudyGuide }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-montserrat font-semibold text-lg text-slate-900">{guide.title}</h3>
        <Badge variant="secondary" className="mt-1">{guide.topic}</Badge>
      </div>
      {guide.sections.map((section) => (
        <Card key={section.id} className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-semibold text-slate-800">{section.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{section.overview}</p>

            {section.keyTerms.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-2">Key Terms</h5>
                <div className="space-y-2">
                  {section.keyTerms.map((kt) => (
                    <div key={kt.term} className="bg-slate-50 rounded-lg p-3">
                      <span className="font-semibold text-sm text-slate-800">{kt.term}:</span>{' '}
                      <span className="text-sm text-slate-600">{kt.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.practicalTakeaways.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-2">Practical Takeaways</h5>
                <ul className="space-y-1">
                  {section.practicalTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.commonExamTraps.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-amber-700 mb-2">Common Exam Traps</h5>
                <ul className="space-y-1">
                  {section.commonExamTraps.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <XCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.memoryAids.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-blue-700 mb-2">Memory Aids</h5>
                <ul className="space-y-1">
                  {section.memoryAids.map((m, i) => (
                    <li key={i} className="text-sm text-slate-600 bg-blue-50 rounded-lg p-2">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickReferenceView({ data: qr }: { data: QuickReference }) {
  return (
    <div className="space-y-4">
      <h3 className="font-montserrat font-semibold text-lg text-slate-900">{qr.title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {qr.items.map((item, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-4">
              <h5 className="font-semibold text-sm text-slate-800 mb-1">{item.heading}</h5>
              <p className="text-sm text-slate-600">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudyPlanView({ plan }: { plan: StudyPlan }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-montserrat font-semibold text-lg text-slate-900">{plan.title}</h3>
        <p className="text-sm text-slate-500 mt-1">
          {plan.timeHorizon} plan targeting: {plan.weakAreas.join(', ')}
        </p>
      </div>
      <div className="space-y-3">
        {plan.weeklyPlan.map((week) => (
          <Card key={week.week} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  W{week.week}
                </span>
                <h4 className="font-semibold text-slate-800 text-sm">{week.focus}</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Materials</p>
                  <div className="flex flex-wrap gap-1">
                    {week.materialTypes.map((mt) => (
                      <Badge key={mt} variant="secondary" className="text-xs">
                        {STUDY_FORMAT_OPTIONS.find((o) => o.id === mt)?.label || mt}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Topics</p>
                  <p className="text-slate-600 text-xs">{week.topics.join(', ')}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Review Cadence</p>
                  <p className="text-slate-600 text-xs">{week.reviewCadence}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Practice</p>
                  <p className="text-slate-600 text-xs">{week.practiceFrequency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClinicalVignetteView({ vignettes }: { vignettes: ClinicalVignette[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [expandedRationales, setExpandedRationales] = useState<Record<string, boolean>>({});

  function selectAnswer(key: string, label: string) {
    setSelectedAnswers((prev) => ({ ...prev, [key]: label }));
  }

  function toggleRationale(key: string) {
    setExpandedRationales((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-8">
      {vignettes.map((vignette, vi) => (
        <div key={vignette.id} className="space-y-4">
          {/* Client Presentation Card */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {vi + 1}
                </span>
                <h3 className="font-montserrat font-semibold text-slate-900">Clinical Vignette</h3>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed mb-4">{vignette.clientPresentation}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Demographics</p>
                  <p className="text-sm text-slate-700">{vignette.demographics}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Presenting Problem</p>
                  <p className="text-sm text-slate-700">{vignette.presentingProblem}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Relevant History</p>
                  <p className="text-sm text-slate-700">{vignette.relevantHistory}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          {vignette.questions.map((q, qi) => {
            const key = `${vignette.id}-q${qi}`;
            const selected = selectedAnswers[key];
            const hasAnswered = !!selected;
            const isCorrect = selected === q.correctAnswer;
            const isRationaleExpanded = expandedRationales[key];

            return (
              <Card key={key} className="border-slate-200 ml-4">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center">
                      {qi + 1}
                    </span>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">{q.competencyArea}</Badge>
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed mb-4">{q.questionText}</p>

                  <div className="space-y-2">
                    {q.choices.map((choice) => {
                      const isSelected = selected === choice.label;
                      const isCorrectChoice = choice.label === q.correctAnswer;
                      let choiceStyle = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
                      if (hasAnswered) {
                        if (isCorrectChoice) choiceStyle = 'border-emerald-300 bg-emerald-50';
                        else if (isSelected && !isCorrect) choiceStyle = 'border-red-300 bg-red-50';
                        else choiceStyle = 'border-slate-200 opacity-60';
                      }

                      return (
                        <button
                          key={choice.label}
                          className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${choiceStyle}`}
                          onClick={() => !hasAnswered && selectAnswer(key, choice.label)}
                          disabled={hasAnswered}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-slate-500 shrink-0">{choice.label}.</span>
                            <span className="text-slate-700">{choice.text}</span>
                            {hasAnswered && isCorrectChoice && (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" />
                            )}
                            {hasAnswered && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-auto" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {hasAnswered && (
                    <div className="mt-4">
                      <button
                        className="flex items-center gap-1 text-sm text-blue-600 font-medium"
                        onClick={() => toggleRationale(key)}
                      >
                        {isRationaleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isRationaleExpanded ? 'Hide' : 'Show'} Rationale
                      </button>
                      {isRationaleExpanded && (
                        <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm space-y-3">
                          <div>
                            <p className="font-semibold text-emerald-700 mb-1">Correct Answer: {q.correctAnswer}</p>
                            <p className="text-slate-700">{q.rationale}</p>
                          </div>
                          {q.incorrectRationales.map((ir) => (
                            <div key={ir.label}>
                              <p className="font-medium text-slate-500">Why not {ir.label}:</p>
                              <p className="text-slate-600">{ir.explanation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function GeneratorOutputPanel() {
  const { generatedContent, isGenerating, selectedLicense, saveMaterial, latestAuditEntryId } = useExamPrep();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  function handleSave() {
    if (!generatedContent || !selectedLicense) return;
    const material: SavedMaterial = {
      id: `saved-${Date.now()}`,
      name: getContentTitle(generatedContent),
      licenseType: selectedLicense,
      studyFormat: generatedContent.type as StudyFormat,
      topic: getContentTopic(generatedContent),
      content: generatedContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      tags: [selectedLicense, generatedContent.type],
    };
    saveMaterial(material);
    toast.success('Material saved to your library');
  }

  function handleCopy() {
    const text = getPlainTextContent(generatedContent);
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard');
  }

  function handlePrint() {
    window.print();
  }

  async function handleReportInaccuracy() {
    if (!latestAuditEntryId || !reportReason.trim()) {
      toast.error('Please provide a reason for the report');
      return;
    }
    const success = await flagAuditEntry(latestAuditEntryId, reportReason.trim());
    if (success) {
      toast.success('Inaccuracy reported — thank you for helping improve content quality');
      setReportDialogOpen(false);
      setReportReason('');
    } else {
      toast.error('Failed to submit report. You may need to be signed in.');
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h3 className="font-montserrat font-semibold text-slate-800 mb-1">
          Generating Your Study Materials
        </h3>
        <p className="text-sm text-slate-500">
          Creating personalized content for your exam prep...
        </p>
      </div>
    );
  }

  if (!generatedContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-montserrat font-semibold text-slate-600 mb-1">
          Your Materials Will Appear Here
        </h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Configure your study options on the left and click Generate to create custom materials.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <h3 className="font-montserrat font-semibold text-slate-900">
          Generated Materials
        </h3>
        <div className="flex items-center gap-2">
          {latestAuditEntryId && (
            <Button variant="outline" size="sm" onClick={() => setReportDialogOpen(true)} className="text-amber-600 border-amber-200 hover:bg-amber-50">
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Report Inaccuracy
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Content Display */}
      <div className="print:p-4">
        {renderContent(generatedContent)}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <strong>Disclaimer:</strong> This content is AI-generated for educational study support only.
        It does not replace official exam prep materials, legal consultation, or clinical supervision.
        Always verify legal and regulatory information with authoritative California sources.
      </div>

      {/* Report Inaccuracy Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Inaccuracy</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Help improve content quality by flagging inaccurate information. Describe what's wrong:
          </p>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            placeholder="e.g., The statute cited doesn't exist, the correct answer rationale is wrong because..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleReportInaccuracy}>
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderContent(content: GeneratedContent) {
  switch (content.type) {
    case 'practice_questions':
      return <QuestionsView questions={content.data} />;
    case 'clinical_vignette':
      return <ClinicalVignetteView vignettes={content.data} />;
    case 'flashcards':
      return <FlashcardsView cards={content.data} />;
    case 'study_guide':
      return <StudyGuideView guide={content.data} />;
    case 'quick_reference':
      return <QuickReferenceView data={content.data} />;
    case 'study_plan':
      return <StudyPlanView plan={content.data} />;
    default: {
      // Backward compat: old saved materials with removed formats
      // (scenario_questions, mini_quiz, mock_exam, law_ethics_spotter, rationale_review)
      // all stored PracticeQuestion[] arrays — render them as questions
      const data = (content as unknown as { data: unknown }).data;
      if (Array.isArray(data) && data.length > 0 && 'stem' in data[0]) {
        return <QuestionsView questions={data} />;
      }
      return <p className="text-slate-500">Unknown content type.</p>;
    }
  }
}

function getContentTitle(content: GeneratedContent): string {
  switch (content.type) {
    case 'study_guide':
      return content.data.title;
    case 'quick_reference':
      return content.data.title;
    case 'study_plan':
      return content.data.title;
    case 'clinical_vignette':
      return `Clinical Vignettes — ${content.data[0]?.presentingProblem || 'General'}`;
    default:
      if (Array.isArray(content.data) && content.data.length > 0) {
        return `${content.type.replace(/_/g, ' ')} — ${content.data[0]?.topic || 'General'}`;
      }
      return content.type.replace(/_/g, ' ');
  }
}

function getContentTopic(content: GeneratedContent): string {
  switch (content.type) {
    case 'study_guide':
      return content.data.topic;
    case 'quick_reference':
      return content.data.topic;
    case 'study_plan':
      return content.data.weakAreas.join(', ');
    case 'clinical_vignette':
      return content.data[0]?.presentingProblem || 'General';
    default:
      if (Array.isArray(content.data) && content.data.length > 0) {
        return content.data[0]?.topic || 'General';
      }
      return 'General';
  }
}

function getPlainTextContent(content: GeneratedContent | null): string {
  if (!content) return '';
  return JSON.stringify(content.data, null, 2);
}
