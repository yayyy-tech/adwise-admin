import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Users, GraduationCap, Handshake, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    refetchInterval: 60000,
    queryFn: async () => {
      const [users, advisors, activeEngagements, overdocuments, pendingKyc, todaySessions] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
        supabase.from('advisor_profiles').select('id, status', { count: 'exact' }),
        supabase.from('engagements').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('documents').select('id', { count: 'exact' }).eq('status', 'overdue'),
        supabase.from('user_profiles').select('id', { count: 'exact' }).eq('kyc_status', 'not_started'),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'scheduled'),
      ]);

      return {
        totalUsers: users.count ?? 0,
        totalAdvisors: advisors.count ?? 0,
        activeAdvisors: advisors.data?.filter((a: any) => a.status === 'active').length ?? 0,
        activeEngagements: activeEngagements.count ?? 0,
        overdueDocuments: overdocuments.count ?? 0,
        pendingKyc: pendingKyc.count ?? 0,
        scheduledSessions: todaySessions.count ?? 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400' },
    { label: 'Active Advisors', value: `${stats?.activeAdvisors ?? 0} / ${stats?.totalAdvisors ?? 0}`, icon: GraduationCap, color: 'text-teal' },
    { label: 'Active Engagements', value: stats?.activeEngagements ?? 0, icon: Handshake, color: 'text-emerald-400' },
    { label: 'Overdue Documents', value: stats?.overdueDocuments ?? 0, icon: AlertTriangle, color: stats?.overdueDocuments ? 'text-amber-400' : 'text-dark-muted' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Platform Overview</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[12px] border border-dark-border bg-dark-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-xs text-dark-muted uppercase tracking-wider">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="font-mono text-3xl font-semibold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[12px] border border-dark-border bg-dark-surface p-6">
          <h3 className="font-body text-sm font-medium text-white mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-dark-muted">Scheduled Sessions</span>
              <span className="font-mono text-sm text-white">{stats?.scheduledSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-dark-muted">Pending KYC</span>
              <span className="font-mono text-sm text-white">{stats?.pendingKyc}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-dark-muted">Overdue Documents</span>
              <span className={`font-mono text-sm ${stats?.overdueDocuments ? 'text-amber-400' : 'text-white'}`}>{stats?.overdueDocuments}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-dark-border bg-dark-surface p-6">
          <h3 className="font-body text-sm font-medium text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => window.location.href = '/advisors'} className="flex w-full items-center gap-3 rounded-[8px] bg-dark-surface-2 px-4 py-3 font-body text-sm text-white hover:bg-dark-border transition-colors">
              <GraduationCap className="h-4 w-4 text-teal" />
              Create New Advisor Account
            </button>
            <button onClick={() => window.location.href = '/users'} className="flex w-full items-center gap-3 rounded-[8px] bg-dark-surface-2 px-4 py-3 font-body text-sm text-white hover:bg-dark-border transition-colors">
              <Users className="h-4 w-4 text-blue-400" />
              View All Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
