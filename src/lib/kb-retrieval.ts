import { supabase } from '@/integrations/supabase/client';
import type { LicenseType } from '@/types/exam-prep';

export interface KBEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  topics: string[];
  license_types: string[];
}

const MAX_KB_CHARS = 8000;

export async function getRelevantKBEntries(config: {
  licenseType: LicenseType;
  topic: string;
}): Promise<KBEntry[]> {
  // Fetch entries that match the license type (or are universal — empty array)
  // Race against a 5-second timeout to prevent infinite spinner
  const queryPromise = supabase
    .from('admin_knowledge_base')
    .select('id, title, category, content, topics, license_types')
    .order('updated_at', { ascending: false });

  const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
    setTimeout(() => resolve({ data: null, error: { message: 'KB query timed out' } }), 5000)
  );

  const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

  if (error || !data || data.length === 0) return [];

  const entries = data as KBEntry[];

  // Filter: license_types contains selected license OR is empty (universal)
  const licenseFiltered = entries.filter(
    (e) => e.license_types.length === 0 || e.license_types.includes(config.licenseType)
  );

  // Score by topic overlap
  const topicWords = config.topic.toLowerCase().split(/\s+/);
  const scored = licenseFiltered.map((entry) => {
    const entryTopicStr = entry.topics.join(' ').toLowerCase();
    const entryContentStr = entry.content.toLowerCase();
    let score = 0;
    for (const word of topicWords) {
      if (word.length < 3) continue;
      if (entryTopicStr.includes(word)) score += 3;
      if (entryContentStr.includes(word)) score += 1;
    }
    // Boost corrections and regulatory content
    if (entry.category === 'corrections') score += 5;
    if (entry.category === 'regulatory') score += 2;
    return { entry, score };
  });

  // Sort by score descending, take top entries within char budget
  scored.sort((a, b) => b.score - a.score);

  const selected: KBEntry[] = [];
  let totalChars = 0;
  for (const { entry, score } of scored) {
    if (score === 0 && selected.length > 0) break; // stop if no topic relevance
    if (totalChars + entry.content.length > MAX_KB_CHARS && selected.length > 0) break;
    selected.push(entry);
    totalChars += entry.content.length;
    if (selected.length >= 5) break;
  }

  return selected;
}

export function formatKBForPrompt(entries: KBEntry[]): string {
  if (entries.length === 0) return '';

  const sections = entries.map((e) =>
    `[${e.category.toUpperCase()}] ${e.title}\n${e.content}`
  );

  return `\n\nREFERENCE MATERIAL (verified by admin):\n---\n${sections.join('\n---\n')}\n---\nUse the reference material above to ground your response. Prioritize corrections entries when they conflict with your training data.`;
}
