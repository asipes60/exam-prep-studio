import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Database, FileText, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ kbEntries: 0, auditEntries: 0, flaggedEntries: 0 });

  useEffect(() => {
    async function loadStats() {
      const [kbResult, auditResult, flaggedResult] = await Promise.all([
        supabase.from('admin_knowledge_base').select('id', { count: 'exact', head: true }),
        supabase.from('audit_log').select('id', { count: 'exact', head: true }),
        supabase.from('audit_log').select('id', { count: 'exact', head: true }).eq('flagged', true),
      ]);
      setStats({
        kbEntries: kbResult.count ?? 0,
        auditEntries: auditResult.count ?? 0,
        flaggedEntries: flaggedResult.count ?? 0,
      });
    }
    loadStats();
  }, []);

  const cards = [
    { label: 'KB Entries', value: stats.kbEntries, icon: Database, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Generations', value: stats.auditEntries, icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Flagged', value: stats.flaggedEntries, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div>
      <h2 className="font-montserrat font-semibold text-xl text-slate-900 mb-6">Admin Dashboard</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>Reminder:</strong> After running the migration, set <code>is_admin = true</code> for your
        account in the Supabase dashboard: SQL Editor &rarr;{' '}
        <code>UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';</code>
      </div>
    </div>
  );
}
