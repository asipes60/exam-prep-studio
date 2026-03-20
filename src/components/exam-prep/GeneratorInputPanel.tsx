import { useState, useMemo } from 'react';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { EXAM_DATA, STUDY_FORMAT_OPTIONS } from '@/data/exam-prep-data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GeneratorConfig, LicenseType, StudyFormat, DifficultyLevel } from '@/types/exam-prep';
import { Sparkles, Loader2 } from 'lucide-react';

export default function GeneratorInputPanel() {
  const { selectedLicense, setSelectedLicense, generateContent, isGenerating } = useExamPrep();

  const [studyFormat, setStudyFormat] = useState<StudyFormat>('practice_questions');
  const [topic, setTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [itemCount, setItemCount] = useState(5);
  const [includeRationales, setIncludeRationales] = useState(true);
  const [californiaEmphasis, setCaliforniaEmphasis] = useState(true);
  const [isBeginnerReview, setIsBeginnerReview] = useState(false);

  const examInfo = selectedLicense ? EXAM_DATA[selectedLicense] : null;

  const allTopics = useMemo(() => {
    if (!examInfo) return [];
    return examInfo.categories.flatMap((c) => c.topics);
  }, [examInfo]);

  function handleGenerate() {
    if (!selectedLicense) return;
    const config: GeneratorConfig = {
      licenseType: selectedLicense,
      studyFormat,
      topic: topic.trim() || selectedTopic || 'General Review',
      difficulty,
      itemCount,
      includeRationales,
      californiaEmphasis,
      isBeginnerReview,
    };
    generateContent(config);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-montserrat font-semibold text-lg text-slate-900 mb-1">
          Generate Study Materials
        </h2>
        <p className="text-sm text-slate-500">
          Configure your study material and hit generate.
        </p>
      </div>

      {/* License Type */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">License Type</Label>
        <Select
          value={selectedLicense || ''}
          onValueChange={(v) => setSelectedLicense(v as LicenseType)}
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

      {/* Study Format */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Study Format</Label>
        <Select value={studyFormat} onValueChange={(v) => setStudyFormat(v as StudyFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STUDY_FORMAT_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic Selection */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
          Topic or Domain
        </Label>
        {allTopics.length > 0 && (
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="mb-2">
              <SelectValue placeholder="Choose a topic..." />
            </SelectTrigger>
            <SelectContent>
              {examInfo?.categories.map((cat) => (
                <div key={cat.id}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {cat.name}
                  </div>
                  {cat.topics.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        )}
        <Textarea
          placeholder="Or type a specific topic, concept, or area you want to study..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          className="text-sm"
        />
      </div>

      {/* Difficulty */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Difficulty Level</Label>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner Review</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="exam_level">Exam-Level Challenge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Number of Items */}
      {studyFormat !== 'study_guide' && studyFormat !== 'study_plan' && studyFormat !== 'quick_reference' && (
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 flex justify-between">
            <span>{studyFormat === 'clinical_vignette' ? 'Number of Vignettes' : 'Number of Items'}</span>
            <span className="text-blue-600 font-semibold">{itemCount}</span>
          </Label>
          <Slider
            value={[itemCount]}
            onValueChange={(v) => setItemCount(v[0])}
            min={1}
            max={studyFormat === 'clinical_vignette' ? 5 : studyFormat === 'mock_exam' ? 50 : 20}
            step={1}
            className="mt-2"
          />
        </div>
      )}

      {/* Toggle Options */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-slate-700">Include Rationales</Label>
          <Switch checked={includeRationales} onCheckedChange={setIncludeRationales} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm text-slate-700">California-Specific Emphasis</Label>
          <Switch checked={californiaEmphasis} onCheckedChange={setCaliforniaEmphasis} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm text-slate-700">Beginner Review Mode</Label>
          <Switch checked={isBeginnerReview} onCheckedChange={setIsBeginnerReview} />
        </div>
      </div>

      {/* Generate Button */}
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
        onClick={handleGenerate}
        disabled={!selectedLicense || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Materials
          </>
        )}
      </Button>

      <p className="text-xs text-slate-400 text-center">
        Content is for educational study support only.
      </p>
    </div>
  );
}
