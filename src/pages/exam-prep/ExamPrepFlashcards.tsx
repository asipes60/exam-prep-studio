import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamPrep } from '@/contexts/ExamPrepContext';
import { useAuth } from '@/hooks/use-auth';
import { EXAM_DATA } from '@/data/exam-prep-data';
import { generateStudyMaterial } from '@/lib/exam-prep-ai';
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
  Flashcard,
  GeneratorConfig,
  SavedMaterial,
} from '@/types/exam-prep';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

type FlashcardStep = 'source' | 'generate' | 'loading' | 'study' | 'results';
type Confidence = 'got_it' | 'almost' | 'missed';

interface CardResult {
  cardId: string;
  confidence: Confidence;
  flipped: boolean;
}

export default function ExamPrepFlashcards() {
  const { savedMaterials, generatedContent, isGenerating } = useExamPrep();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<FlashcardStep>('source');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);
  const [hasRated, setHasRated] = useState(false);

  // Generate options
  const [license, setLicense] = useState<LicenseType | null>(null);
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState('20');

  // Check if we have flashcard content in context
  useEffect(() => {
    if (generatedContent?.type === 'flashcards' && generatedContent.data.length > 0) {
      setCards(generatedContent.data);
      setStep('study');
    }
  }, [generatedContent]);

  // Saved flashcard sets
  const savedFlashcardSets = useMemo(() =>
    savedMaterials.filter((m) => m.studyFormat === 'flashcards' && m.content.type === 'flashcards'),
    [savedMaterials]
  );

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((results.length) / cards.length) * 100 : 0;

  // Confidence counts
  const gotItCount = results.filter((r) => r.confidence === 'got_it').length;
  const almostCount = results.filter((r) => r.confidence === 'almost').length;
  const missedCount = results.filter((r) => r.confidence === 'missed').length;

  // Load saved flashcard set
  function loadSavedSet(material: SavedMaterial) {
    if (material.content.type === 'flashcards') {
      setCards(material.content.data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setResults([]);
      setHasRated(false);
      setStep('study');
    }
  }

  // Generate new flashcards
  const generateFlashcards = useCallback(async () => {
    if (!license || !topic) return;
    setStep('loading');

    const config: GeneratorConfig = {
      licenseType: license,
      studyFormat: 'flashcards',
      topic,
      difficulty: 'exam_level',
      itemCount: parseInt(cardCount, 10),
      includeRationales: false,
      californiaEmphasis: license === 'LAW_ETHICS',
      isBeginnerReview: false,
    };

    try {
      const result = await generateStudyMaterial(config, user?.id);
      if (result.content.type === 'flashcards' && result.content.data.length > 0) {
        setCards(result.content.data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setResults([]);
        setHasRated(false);
        setStep('study');
      } else {
        throw new Error('No flashcards generated');
      }
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
      toast.error('Failed to generate flashcards. Please try again.');
      setStep('generate');
    }
  }, [license, topic, cardCount, user?.id]);

  // Card interactions
  function flipCard() {
    setIsFlipped((prev) => !prev);
  }

  function rateCard(confidence: Confidence) {
    if (hasRated) return;
    setHasRated(true);

    const result: CardResult = {
      cardId: currentCard.id,
      confidence,
      flipped: true,
    };
    setResults((prev) => [...prev, result]);
  }

  function nextCard() {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setHasRated(false);
    } else {
      setStep('results');
    }
  }

  function prevCard() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setHasRated(false);
    }
  }

  // Review missed cards
  function reviewMissed() {
    const missedIds = new Set(
      results.filter((r) => r.confidence === 'missed' || r.confidence === 'almost').map((r) => r.cardId)
    );
    const missedCards = cards.filter((c) => missedIds.has(c.id));
    if (missedCards.length > 0) {
      setCards(missedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setResults([]);
      setHasRated(false);
      setStep('study');
    }
  }

  // Shuffle and restart
  function shuffleRestart() {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
    setHasRated(false);
    setStep('study');
  }

  // Keyboard navigation
  useEffect(() => {
    if (step !== 'study') return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          flipCard();
        } else if (hasRated) {
          nextCard();
        }
      }
      if (e.key === 'ArrowRight' && hasRated) nextCard();
      if (e.key === 'ArrowLeft') prevCard();
      if (isFlipped && !hasRated) {
        if (e.key === '1') rateCard('got_it');
        if (e.key === '2') rateCard('almost');
        if (e.key === '3') rateCard('missed');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ─── Source Selection ────────────────────────────────────────────────
  if (step === 'source') {
    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="heading-2 text-slate-900 mb-2">Flashcard Study</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Study with interactive flashcards. Flip, rate your confidence, and focus on what you need to learn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card
            className="border-2 border-slate-200 hover:border-amber-300 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setStep('generate')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Generate New</h3>
              <p className="text-sm text-slate-500">
                Create AI-generated flashcards on any topic
              </p>
            </CardContent>
          </Card>

          <Card
            className={`border-2 transition-all ${
              savedFlashcardSets.length > 0
                ? 'border-slate-200 hover:border-amber-300 cursor-pointer hover:shadow-md'
                : 'border-slate-100 opacity-60 cursor-not-allowed'
            }`}
            onClick={() => {
              if (savedFlashcardSets.length > 0) {
                // Show the first saved set or could add a picker
                loadSavedSet(savedFlashcardSets[0]);
              }
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Saved Sets</h3>
              <p className="text-sm text-slate-500">
                {savedFlashcardSets.length > 0
                  ? `${savedFlashcardSets.length} set${savedFlashcardSets.length > 1 ? 's' : ''} available`
                  : 'No saved flashcard sets yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {savedFlashcardSets.length > 1 && (
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Your Flashcard Sets</h3>
              <div className="space-y-2">
                {savedFlashcardSets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => loadSavedSet(set)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{set.name}</p>
                      <p className="text-xs text-slate-400">{set.topic} · {set.content.type === 'flashcards' ? set.content.data.length : 0} cards</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-slate-500" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ─── Generate Options ────────────────────────────────────────────────
  if (step === 'generate') {
    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="heading-3 text-slate-900 mb-2">Generate Flashcards</h2>
          <p className="text-slate-500">Choose your exam and topic to create a flashcard set.</p>
        </div>

        <Card className="border-slate-200 mb-6">
          <CardContent className="p-6 space-y-5">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Exam Type</Label>
              <Select value={license || ''} onValueChange={(v) => setLicense(v as LicenseType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your exam" />
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
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Topic</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_DATA[license].categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Number of Cards</Label>
              <Select value={cardCount} onValueChange={setCardCount}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 cards</SelectItem>
                  <SelectItem value="20">20 cards</SelectItem>
                  <SelectItem value="30">30 cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            disabled={!license || !topic}
            onClick={generateFlashcards}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Flashcards
          </Button>
          <Button variant="outline" onClick={() => setStep('source')}>
            Back
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
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Layers className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="heading-3 text-slate-900 mb-2">Creating Flashcards</h2>
          <p className="text-slate-500 mb-6">
            Generating {cardCount} flashcards on {topic}...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
        </div>
      </div>
    );
  }

  // ─── Study Mode ──────────────────────────────────────────────────────
  if (step === 'study' && currentCard) {
    return (
      <div className="container-custom py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-600 font-medium">{gotItCount} ✓</span>
              <span className="text-amber-600 font-medium">{almostCount} ~</span>
              <span className="text-red-600 font-medium">{missedCount} ✗</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">{currentCard.category}</Badge>
          <Badge variant="outline" className="text-xs text-slate-400">{currentCard.topic}</Badge>
        </div>

        {/* Flashcard */}
        <div
          className="mb-6 cursor-pointer"
          onClick={() => !isFlipped && flipCard()}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '250px',
            }}
          >
            {/* Front */}
            <Card
              className="absolute inset-0 border-2 border-amber-200 bg-white"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[250px]">
                <p className="text-lg md:text-xl font-medium text-slate-900 text-center leading-relaxed">
                  {currentCard.front}
                </p>
                {!isFlipped && (
                  <p className="text-xs text-slate-400 mt-6">
                    Tap to reveal answer · Space to flip
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Back */}
            <Card
              className="absolute inset-0 border-2 border-emerald-200 bg-emerald-50/30"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[250px]">
                <p className="text-lg md:text-xl font-medium text-slate-800 text-center leading-relaxed">
                  {currentCard.back}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confidence rating */}
        {isFlipped && !hasRated && (
          <div className="mb-6">
            <p className="text-sm text-slate-500 text-center mb-3">How well did you know this?</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => rateCard('got_it')}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Got it
              </Button>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => rateCard('almost')}
              >
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Almost
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => rateCard('missed')}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Missed
              </Button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              Press 1, 2, or 3
            </p>
          </div>
        )}

        {/* Navigation */}
        {hasRated && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={prevCard} disabled={currentIndex === 0}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={nextCard}
            >
              {currentIndex < cards.length - 1 ? (
                <>Next Card <ArrowRight className="w-4 h-4 ml-2" /></>
              ) : (
                'View Results'
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsFlipped(false);
                setHasRated(false);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Flip button when not flipped */}
        {!isFlipped && (
          <div className="text-center">
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={flipCard}
            >
              Flip Card
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ─── Results ─────────────────────────────────────────────────────────
  if (step === 'results') {
    const gotItPercent = cards.length > 0 ? Math.round((gotItCount / cards.length) * 100) : 0;
    const reviewCards = results.filter((r) => r.confidence === 'missed' || r.confidence === 'almost').length;

    return (
      <div className="container-custom py-8 md:py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center mx-auto mb-4">
            <span className={`text-3xl font-bold ${
              gotItPercent >= 80 ? 'text-emerald-600' : gotItPercent >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {gotItPercent}%
            </span>
          </div>
          <h1 className="heading-2 text-slate-900 mb-1">Study Complete</h1>
          <p className="text-slate-500">{cards.length} flashcards reviewed</p>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-emerald-200">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-700">{gotItCount}</p>
              <p className="text-xs text-slate-500">Got it</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-700">{almostCount}</p>
              <p className="text-xs text-slate-500">Almost</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-4 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-700">{missedCount}</p>
              <p className="text-xs text-slate-500">Missed</p>
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown */}
        {(() => {
          const catMap = new Map<string, { total: number; gotIt: number }>();
          results.forEach((r) => {
            const card = cards.find((c) => c.id === r.cardId);
            if (!card) return;
            const cat = card.category || 'General';
            const existing = catMap.get(cat) || { total: 0, gotIt: 0 };
            existing.total += 1;
            if (r.confidence === 'got_it') existing.gotIt += 1;
            catMap.set(cat, existing);
          });

          if (catMap.size > 1) {
            return (
              <Card className="border-slate-200 mb-6">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">By Category</h3>
                  <div className="space-y-3">
                    {Array.from(catMap.entries()).map(([cat, data]) => {
                      const pct = Math.round((data.gotIt / data.total) * 100);
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700 truncate mr-2">{cat}</span>
                            <span className="text-xs text-slate-500">{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reviewCards > 0 && (
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={reviewMissed}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Review {reviewCards} Missed Cards
            </Button>
          )}
          <Button variant="outline" onClick={shuffleRestart}>
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle & Restart
          </Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// Label component (simple inline to avoid extra import)
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
