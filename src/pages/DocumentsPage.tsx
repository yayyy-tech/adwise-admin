import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function DocumentsPage() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, engagement:engagements!engagement_id(user_id, advisor_id, user:profiles!user_id(full_name), advisor:profiles!advisor_id(full_name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const overdue = documents?.filter((d: any) => d.status === 'overdue').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-body text-2xl font-semibold text-white">Documents</h1>
          <p className="mt-1 font-body text-sm text-dark-muted">
            {documents?.length ?? 0} documents{overdue > 0 && <span className="text-amber-400"> · {overdue} overdue</span>}
          </p>
        </div>
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
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Advisor</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Sent</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {documents?.map((doc: any) => (
                <tr key={doc.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-4 py-3 font-body text-sm text-white">{doc.name}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{doc.engagement?.user?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{doc.engagement?.advisor?.full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      doc.status === 'signed' ? 'bg-teal/10 text-teal'
                      : doc.status === 'overdue' ? 'bg-red-500/10 text-red-400'
                      : doc.status === 'sent_pending' ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-dark-surface-2 text-dark-muted'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">
                    {doc.sent_at ? new Date(doc.sent_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">
                    {new Date(doc.created_at).toLocaleDateString('en-IN')}
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
