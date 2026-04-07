// EduCare Exam Prep Studio — Topic-to-Domain Mapping
// Maps Gemini-generated question topics/competency areas back to exam domains.

import { EXAM_DATA } from '@/data/exam-prep-data';
import type { LicenseType, PracticeQuestion, ClinicalVignette, DMDecisionPoint, QuizSession } from '@/types/exam-prep';

export interface DomainMatch {
  domainId: string;
  domainName: string;
}

/**
 * Maps a question topic or competency area string to an exam domain.
 * Uses case-insensitive substring matching against EXAM_DATA categories.
 */
export function mapTopicToDomain(
  licenseType: LicenseType,
  topicOrCompetencyArea: string,
): DomainMatch | null {
  const exam = EXAM_DATA[licenseType];
  if (!exam) return null;

  const needle = topicOrCompetencyArea.toLowerCase();

  // First pass: check if the topic exactly matches one of the predefined topics
  for (const cat of exam.categories) {
    for (const t of cat.topics) {
      if (t.toLowerCase() === needle) {
        return { domainId: cat.id, domainName: cat.name };
      }
    }
  }

  // Second pass: check if the topic is a substring of a predefined topic or vice versa
  for (const cat of exam.categories) {
    for (const t of cat.topics) {
      const tLower = t.toLowerCase();
      if (tLower.includes(needle) || needle.includes(tLower)) {
        return { domainId: cat.id, domainName: cat.name };
      }
    }
  }

  // Third pass: check if any keyword from the topic matches a category name
  const words = needle.split(/\s+/).filter((w) => w.length > 3);
  for (const cat of exam.categories) {
    const catLower = cat.name.toLowerCase();
    for (const word of words) {
      if (catLower.includes(word)) {
        return { domainId: cat.id, domainName: cat.name };
      }
    }
  }

  // Fourth pass: keyword matching against individual topics
  for (const cat of exam.categories) {
    for (const t of cat.topics) {
      const tLower = t.toLowerCase();
      for (const word of words) {
        if (tLower.includes(word)) {
          return { domainId: cat.id, domainName: cat.name };
        }
      }
    }
  }

  // Fallback: assign to the first domain (better than losing the data)
  return { domainId: exam.categories[0].id, domainName: exam.categories[0].name };
}

export interface DomainScoreEntry {
  domainId: string;
  domainName: string;
  correct: number;
  total: number;
}

/**
 * Computes per-domain scores from a completed quiz session.
 */
export function computeDomainScoresFromQuiz(session: QuizSession): DomainScoreEntry[] {
  const scoreMap = new Map<string, DomainScoreEntry>();

  if (session.format === 'clinical_vignette' && session.vignettes) {
    // Check for two-phase NCMHCE format
    const hasTwoPhaseData = session.vignettes.some(
      (v) => v.igPhase && v.dmPhase && v.dmPhase.decisionPoints.length > 0
    );

    if (hasTwoPhaseData) {
      // Two-phase: map DM decision points to domains (IG actions don't have competency areas)
      // DM results come after IG results — find them by matching IDs
      for (const vignette of session.vignettes) {
        if (!vignette.dmPhase) continue;
        for (const dp of vignette.dmPhase.decisionPoints) {
          const match = mapTopicToDomain(session.licenseType, dp.competencyArea);
          if (!match) continue;
          const result = session.results.find((r) => r.questionId === dp.id);
          if (!result) continue;
          const existing = scoreMap.get(match.domainId);
          if (existing) {
            existing.total++;
            if (result.isCorrect) existing.correct++;
          } else {
            scoreMap.set(match.domainId, {
              domainId: match.domainId,
              domainName: match.domainName,
              correct: result.isCorrect ? 1 : 0,
              total: 1,
            });
          }
        }
      }
    } else {
      // Legacy vignette format: iterate through flat questions
      let resultIdx = 0;
      for (const vignette of session.vignettes) {
        for (const q of vignette.questions) {
          const match = mapTopicToDomain(session.licenseType, q.competencyArea);
          if (match) {
            const existing = scoreMap.get(match.domainId);
            const result = session.results[resultIdx];
            if (existing) {
              existing.total++;
              if (result?.isCorrect) existing.correct++;
            } else {
              scoreMap.set(match.domainId, {
                domainId: match.domainId,
                domainName: match.domainName,
                correct: result?.isCorrect ? 1 : 0,
                total: 1,
              });
            }
          }
          resultIdx++;
        }
      }
    }
  } else {
    // MCQ quiz
    for (let i = 0; i < session.questions.length; i++) {
      const q = session.questions[i];
      const result = session.results[i];
      const match = mapTopicToDomain(session.licenseType, q.topic);
      if (match) {
        const existing = scoreMap.get(match.domainId);
        if (existing) {
          existing.total++;
          if (result?.isCorrect) existing.correct++;
        } else {
          scoreMap.set(match.domainId, {
            domainId: match.domainId,
            domainName: match.domainName,
            correct: result?.isCorrect ? 1 : 0,
            total: 1,
          });
        }
      }
    }
  }

  return Array.from(scoreMap.values());
}
