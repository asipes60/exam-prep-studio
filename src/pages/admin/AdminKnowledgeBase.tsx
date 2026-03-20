import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface KBEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  source_url: string | null;
  tags: string[];
  license_types: string[];
  topics: string[];
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['regulatory', 'course_content', 'notes', 'corrections'] as const;

const EMPTY_FORM = {
  title: '',
  category: 'notes' as string,
  content: '',
  source_url: '',
  tags: '',
  license_types: '',
  topics: '',
};

export default function AdminKnowledgeBase() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadEntries = useCallback(async () => {
    let query = supabase
      .from('admin_knowledge_base')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filterCategory !== 'all') {
      query = query.eq('category', filterCategory);
    }
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Failed to load KB entries');
      return;
    }
    setEntries((data as KBEntry[]) || []);
  }, [search, filterCategory]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(entry: KBEntry) {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      category: entry.category,
      content: entry.content,
      source_url: entry.source_url || '',
      tags: entry.tags.join(', '),
      license_types: entry.license_types.join(', '),
      topics: entry.topics.join(', '),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      source_url: form.source_url.trim() || null,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      license_types: form.license_types.split(',').map((s) => s.trim()).filter(Boolean),
      topics: form.topics.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editingId) {
      const { error } = await supabase
        .from('admin_knowledge_base')
        .update(payload)
        .eq('id', editingId);
      if (error) { toast.error('Failed to update entry'); return; }
      toast.success('Entry updated');
    } else {
      const { error } = await supabase
        .from('admin_knowledge_base')
        .insert(payload);
      if (error) { toast.error('Failed to create entry'); return; }
      toast.success('Entry created');
    }

    setDialogOpen(false);
    loadEntries();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this KB entry?')) return;
    const { error } = await supabase.from('admin_knowledge_base').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Entry deleted');
    loadEntries();
  }

  const categoryColors: Record<string, string> = {
    regulatory: 'bg-red-100 text-red-700',
    course_content: 'bg-blue-100 text-blue-700',
    notes: 'bg-slate-100 text-slate-700',
    corrections: 'bg-amber-100 text-amber-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-slate-900">Knowledge Base</h2>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No KB entries found. Add your first one above.</p>
        )}
        {entries.map((entry) => (
          <Card key={entry.id} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">{entry.title}</h4>
                    <Badge className={`text-xs ${categoryColors[entry.category] || ''}`}>
                      {entry.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{entry.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.license_types.map((lt) => (
                      <Badge key={lt} variant="outline" className="text-xs">{lt}</Badge>
                    ))}
                    {entry.topics.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-slate-50">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} KB Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Source URL (optional)</Label>
              <Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm font-medium">License Types (comma-separated)</Label>
              <Input
                placeholder="LPCC, LMFT, LCSW"
                value={form.license_types}
                onChange={(e) => setForm({ ...form, license_types: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Topics (comma-separated)</Label>
              <Input
                placeholder="Confidentiality, Tarasoff"
                value={form.topics}
                onChange={(e) => setForm({ ...form, topics: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Tags (comma-separated)</Label>
              <Input
                placeholder="exam-critical, updated-2026"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
