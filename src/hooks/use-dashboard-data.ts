// EduCare Exam Prep Studio — Dashboard Data Hook
// Fetches domain scores, recent quizzes, and computes readiness metrics.

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getDomainScores, getQuizSessionsAsync } from '@/lib/exam-prep-storage';
import { EXAM_DATA } from '@/data/exam-prep-data';
import type { LicenseType, DomainScore, DashboardData } from '@/types/exam-prep';

/** Parse percentage weight from domain name, e.g. "Intake, Assessment & Diagnosis (25%)" → 25 */
function parseDomainWeight(domainName: string): number {
  const match = domainName.match(/\((\d+)%\)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function useDashboardData(licenseType: LicenseType | null) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || !licenseType) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      const [rawScores, quizzes] = await Promise.all([
        getDomainScores(user!.id, licenseType!),
        getQuizSessionsAsync(user!.id, licenseType!, 10),
      ]);

      if (cancelled) return;

      // Build domain scores with percentages
      const exam = EXAM_DATA[licenseType!];
      const domainScores: DomainScore[] = exam.categories.map((cat) => {
        const raw = rawScores.find((s) => s.domainId === cat.id);
        const total = raw?.totalQuestions ?? 0;
        const correct = raw?.correctAnswers ?? 0;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        return {
          domainId: cat.id,
          domainName: cat.name,
          totalQuestions: total,
          correctAnswers: correct,
          percentage,
          isWeak: total > 0 && percentage < 60,
          isStrong: total > 0 && percentage >= 80,
        };
      });

      // Compute readiness score as weighted average
      const scoredDomains = domainScores.filter((d) => d.totalQuestions > 0);
      let readinessScore = 0;
      if (scoredDomains.length > 0) {
        const hasWeights = scoredDomains.some((d) => parseDomainWeight(d.domainName) > 0);
        if (hasWeights) {
          let weightedSum = 0;
          let totalWeight = 0;
          for (const d of scoredDomains) {
            const w = parseDomainWeight(d.domainName) || 1;
            weightedSum += d.percentage * w;
            totalWeight += w;
          }
          readinessScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        } else {
          // Equal weighting (LAW_ETHICS)
          readinessScore = Math.round(
            scoredDomains.reduce((sum, d) => sum + d.percentage, 0) / scoredDomains.length,
          );
        }
      }

      const weakAreas = domainScores.filter((d) => d.isWeak).map((d) => d.domainName);
      const strongAreas = domainScores.filter((d) => d.isStrong).map((d) => d.domainName);

      const totalQuizzes = quizzes.length;
      const totalQuestions = domainScores.reduce((sum, d) => sum + d.totalQuestions, 0);

      const recentQuizzes = quizzes.map((q) => ({
        id: q.id,
        score: q.score ?? 0,
        total: q.results.length,
        date: q.completedAt ?? q.startedAt,
        licenseType: q.licenseType,
      }));

      setData({
        domainScores,
        readinessScore,
        totalQuizzes,
        totalQuestions,
        weakAreas,
        strongAreas,
        recentQuizzes,
      });
      setLoading(false);
    }

    fetchData().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [user?.id, licenseType]);

  return { data, loading };
}
