import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_profiles(*)')
        .eq('role', 'user')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Users</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">{users?.length ?? 0} registered users</p>
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
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Questionnaire</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">KYC</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-4 py-3 font-body text-sm text-white">{user.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{user.email}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{user.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      user.user_profiles?.questionnaire_completed
                        ? 'bg-teal/10 text-teal'
                        : 'bg-dark-surface-2 text-dark-muted'
                    }`}>
                      {user.user_profiles?.questionnaire_completed ? 'Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      user.user_profiles?.kyc_status === 'verified'
                        ? 'bg-teal/10 text-teal'
                        : 'bg-dark-surface-2 text-dark-muted'
                    }`}>
                      {user.user_profiles?.kyc_status || 'not_started'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">
                    {new Date(user.created_at).toLocaleDateString('en-IN')}
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
