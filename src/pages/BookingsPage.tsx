import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function BookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, user:profiles!user_id(full_name, email), advisor:profiles!advisor_id(full_name)')
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Bookings</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">{bookings?.length ?? 0} total bookings</p>
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
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Scheduled</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Recording</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.map((booking: any) => (
                <tr key={booking.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-4 py-3 font-body text-sm text-white">{booking.user?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{booking.advisor?.full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      booking.booking_type === 'discovery' ? 'bg-blue-500/10 text-blue-400' : 'bg-teal/10 text-teal'
                    }`}>
                      {booking.booking_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      booking.status === 'scheduled' ? 'bg-teal/10 text-teal'
                      : booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400'
                      : booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">
                    {new Date(booking.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-dark-muted">
                    {booking.recording_available ? (
                      <span className="text-teal">Available</span>
                    ) : '—'}
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
