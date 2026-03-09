import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Video } from 'lucide-react';

export function RecordingsPage() {
  const { data: recordings, isLoading } = useQuery({
    queryKey: ['admin-recordings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, user:profiles!user_id(full_name), advisor:profiles!advisor_id(full_name)')
        .eq('recording_available', true)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Recordings</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">{recordings?.length ?? 0} cloud recordings</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </div>
      ) : !recordings?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Video className="h-12 w-12 text-dark-muted mb-4" />
          <p className="font-body text-sm text-dark-muted">No recordings available yet.</p>
          <p className="font-body text-xs text-dark-muted-2 mt-1">Recordings appear here after completed video sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((rec: any) => (
            <div key={rec.id} className="rounded-[12px] border border-dark-border bg-dark-surface p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                  <Video className="h-4 w-4 text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-white truncate">
                    {rec.user?.full_name} — {rec.advisor?.full_name}
                  </p>
                  <p className="font-mono text-xs text-dark-muted">
                    {new Date(rec.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                  rec.booking_type === 'discovery' ? 'bg-blue-500/10 text-blue-400' : 'bg-teal/10 text-teal'
                }`}>
                  {rec.booking_type}
                </span>
                <span className="font-mono text-xs text-dark-muted">
                  {rec.duration_minutes ? `${rec.duration_minutes} min` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
