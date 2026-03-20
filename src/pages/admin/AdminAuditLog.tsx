import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronUp,
  Flag,
  FlagOff,
  MessageSquare,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  user_id: string;
  prompt_text: string | null;
  output_text: string | null;
  system_prompt: string | null;
  license_type: string | null;
  study_format: string | null;
  topic: string | null;
  difficulty: string | null;
  model_used: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  generation_time_ms: number | null;
  flagged: boolean;
  flag_reason: string | null;
  admin_notes: string | null;
  kb_entries_used: string[];
  created_at: string;
}

export default function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterLicense, setFilterLicense] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<AuditEntry | null>(null);
  const [notesText, setNotesText] = useState('');

  const loadEntries = useCallback(async () => {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filterLicense !== 'all') query = query.eq('license_type', filterLicense);
    if (filterFormat !== 'all') query = query.eq('study_format', filterFormat);
    if (flaggedOnly) query = query.eq('flagged', true);

    const { data, error } = await query;
    if (error) { toast.error('Failed to load audit log'); return; }
    setEntries((data as AuditEntry[]) || []);
  }, [filterLicense, filterFormat, flaggedOnly]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function toggleFlag(entry: AuditEntry) {
    const newFlagged = !entry.flagged;
    const { error } = await supabase
      .from('audit_log')
      .update({ flagged: newFlagged, flag_reason: newFlagged ? entry.flag_reason : null })
      .eq('id', entry.id);
    if (error) { toast.error('Failed to update flag'); return; }
    toast.success(newFlagged ? 'Entry flagged' : 'Flag removed');
    loadEntries();
  }

  function openNotes(entry: AuditEntry) {
    setActiveEntry(entry);
    setNotesText(entry.admin_notes || '');
    setNotesDialogOpen(true);
  }

  async function saveNotes() {
    if (!activeEntry) return;
    const { error } = await supabase
      .from('audit_log')
      .update({ admin_notes: notesText.trim() || null })
      .eq('id', activeEntry.id);
    if (error) { toast.error('Failed to save notes'); return; }
    toast.success('Notes saved');
    setNotesDialogOpen(false);
    loadEntries();
  }

  async function convertToKBCorrection(entry: AuditEntry) {
    if (!entry.flagged || !entry.flag_reason) {
      toast.error('Flag the entry with a reason before converting');
      return;
    }
    const { error } = await supabase.from('admin_knowledge_base').insert({
      title: `Correction: ${entry.topic || entry.study_format || 'General'}`,
      category: 'corrections',
      content: `FLAGGED OUTPUT:\n${entry.output_text?.slice(0, 2000) || '(no output)'}\n\nFLAG REASON:\n${entry.flag_reason}\n\nADMIN NOTES:\n${entry.admin_notes || '(none)'}`,
      license_types: entry.license_type ? [entry.license_type] : [],
      topics: entry.topic ? [entry.topic] : [],
      tags: ['auto-from-audit'],
    });
    if (error) { toast.error('Failed to create KB entry'); return; }
    toast.success('KB correction entry created');
  }

  return (
    <div>
      <h2 className="font-montserrat font-semibold text-xl text-slate-900 mb-6">Audit Log</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select value={filterLicense} onValueChange={setFilterLicense}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="License" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Licenses</SelectItem>
            <SelectItem value="LPCC">LPCC</SelectItem>
            <SelectItem value="LMFT">LMFT</SelectItem>
            <SelectItem value="LCSW">LCSW</SelectItem>
            <SelectItem value="LAW_ETHICS">Law & Ethics</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterFormat} onValueChange={setFilterFormat}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="practice_questions">Practice Questions</SelectItem>
            <SelectItem value="clinical_vignette">Clinical Vignettes</SelectItem>
            <SelectItem value="flashcards">Flashcards</SelectItem>
            <SelectItem value="study_guide">Study Guide</SelectItem>
            <SelectItem value="scenario_questions">Scenarios</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={flaggedOnly} onCheckedChange={setFlaggedOnly} />
          <Label className="text-sm text-slate-600">Flagged only</Label>
        </div>
      </div>

      {/* Entry List */}
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No audit entries found.</p>
        )}
        {entries.map((entry) => {
          const isExpanded = expanded[entry.id];
          return (
            <Card key={entry.id} className={`border-slate-200 ${entry.flagged ? 'border-l-4 border-l-amber-400' : ''}`}>
              <CardContent className="p-4">
                {/* Summary Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button onClick={() => setExpanded((p) => ({ ...p, [entry.id]: !p[entry.id] }))}>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                    {entry.license_type && <Badge variant="outline" className="text-xs">{entry.license_type}</Badge>}
                    {entry.study_format && <Badge variant="secondary" className="text-xs">{entry.study_format.replace(/_/g, ' ')}</Badge>}
                    {entry.topic && <span className="text-xs text-slate-500 truncate">{entry.topic}</span>}
                    {entry.flagged && <Badge className="bg-amber-100 text-amber-700 text-xs">Flagged</Badge>}
                    {entry.admin_notes && <MessageSquare className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => toggleFlag(entry)} title={entry.flagged ? 'Remove flag' : 'Flag'}>
                      {entry.flagged ? <FlagOff className="w-3.5 h-3.5 text-amber-500" /> : <Flag className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openNotes(entry)} title="Admin notes">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                    {entry.flagged && (
                      <Button variant="ghost" size="sm" onClick={() => convertToKBCorrection(entry)} title="Convert to KB correction">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    {entry.generation_time_ms && (
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Time: {entry.generation_time_ms}ms</span>
                        {entry.model_used && <span>Model: {entry.model_used}</span>}
                        {entry.tokens_in != null && <span>Tokens in: {entry.tokens_in}</span>}
                        {entry.tokens_out != null && <span>Tokens out: {entry.tokens_out}</span>}
                      </div>
                    )}
                    {entry.system_prompt && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">System Prompt</p>
                        <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {entry.system_prompt}
                        </pre>
                      </div>
                    )}
                    {entry.prompt_text && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">User Prompt</p>
                        <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {entry.prompt_text}
                        </pre>
                      </div>
                    )}
                    {entry.output_text && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Output</p>
                        <pre className="text-xs text-slate-600 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {entry.output_text}
                        </pre>
                      </div>
                    )}
                    {entry.flag_reason && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Flag Reason</p>
                        <p className="text-xs text-amber-600">{entry.flag_reason}</p>
                      </div>
                    )}
                    {entry.admin_notes && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Admin Notes</p>
                        <p className="text-xs text-blue-600">{entry.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={4}
            placeholder="Add notes about this generation..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveNotes}>Save Notes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
