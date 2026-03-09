import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function EngagementsPage() {
  const { data: engagements, isLoading } = useQuery({
    queryKey: ['admin-engagements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagements')
        .select('*, user:profiles!user_id(full_name, email), advisor:profiles!advisor_id(full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Engagements</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">{engagements?.length ?? 0} total engagements</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-[12px] border border-dark-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border bg-dark-surface">
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Advisor</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Sessions</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Started</th>
              </tr>
            </thead>
            <tbody>
              {engagements?.map((eng: any) => (
                <tr key={eng.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-4 py-3 font-body text-sm text-white">{eng.user?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{eng.advisor?.full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      eng.status === 'active' ? 'bg-teal/10 text-teal'
                      : eng.status === 'completed' ? 'bg-blue-500/10 text-blue-400'
                      : eng.status === 'paused' ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                    }`}>
                      {eng.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-white">
                    {eng.sessions_completed ?? 0}/{eng.sessions_included ?? 0}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{eng.plan_snapshot?.name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">
                    {new Date(eng.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
