import { supabase } from '@/integrations/supabase/client';

export interface AuditLogInput {
  userId: string;
  promptText?: string;
  outputText?: string;
  systemPrompt?: string;
  licenseType?: string;
  studyFormat?: string;
  topic?: string;
  difficulty?: string;
  modelUsed?: string;
  tokensIn?: number;
  tokensOut?: number;
  generationTimeMs?: number;
  kbEntriesUsed?: string[];
}

export async function logGeneration(input: AuditLogInput): Promise<string | null> {
  const { data, error } = await supabase
    .from('audit_log')
    .insert({
      user_id: input.userId,
      prompt_text: input.promptText || null,
      output_text: input.outputText || null,
      system_prompt: input.systemPrompt || null,
      license_type: input.licenseType || null,
      study_format: input.studyFormat || null,
      topic: input.topic || null,
      difficulty: input.difficulty || null,
      model_used: input.modelUsed || null,
      tokens_in: input.tokensIn || null,
      tokens_out: input.tokensOut || null,
      generation_time_ms: input.generationTimeMs || null,
      kb_entries_used: input.kbEntriesUsed || [],
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to log generation:', error);
    return null;
  }
  return data?.id ?? null;
}

export async function flagAuditEntry(entryId: string, reason: string): Promise<boolean> {
  const { error } = await supabase
    .from('audit_log')
    .update({ flagged: true, flag_reason: reason })
    .eq('id', entryId);

  if (error) {
    console.error('Failed to flag audit entry:', error);
    return false;
  }
  return true;
}

export async function addAdminNotes(entryId: string, notes: string): Promise<boolean> {
  const { error } = await supabase
    .from('audit_log')
    .update({ admin_notes: notes })
    .eq('id', entryId);

  if (error) {
    console.error('Failed to add admin notes:', error);
    return false;
  }
  return true;
}
