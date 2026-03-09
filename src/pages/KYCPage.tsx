import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function KYCPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, profile:profiles!id(full_name, email, city)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const pending = users?.filter((u: any) => u.kyc_status === 'not_started' || u.kyc_status === 'pending').length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">KYC Status</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">
          {users?.length ?? 0} users{pending > 0 && <span className="text-amber-400"> · {pending} pending</span>}
        </p>
      </div>

      <div className="rounded-[12px] border border-dark-border bg-dark-surface p-5 mb-2">
        <p className="font-body text-sm text-dark-muted">
          <span className="text-amber-400 font-medium">DigiLocker integration pending.</span>{' '}
          KYC verification is currently in stub mode. Users see a "coming soon" message. Once DigiLocker partner approval is received, this page will show verification status and allow manual overrides.
        </p>
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
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">KYC Status</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Questionnaire</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u: any) => (
                <tr key={u.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-4 py-3 font-body text-sm text-white">{u.profile?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{u.profile?.email || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{u.profile?.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      u.kyc_status === 'verified' ? 'bg-teal/10 text-teal'
                      : u.kyc_status === 'pending' ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-dark-surface-2 text-dark-muted'
                    }`}>
                      {u.kyc_status || 'not_started'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      u.questionnaire_completed ? 'bg-teal/10 text-teal' : 'bg-dark-surface-2 text-dark-muted'
                    }`}>
                      {u.questionnaire_completed ? 'Done' : 'Pending'}
                    </span>
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
