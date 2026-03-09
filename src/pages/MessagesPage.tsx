import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { MessageSquare } from 'lucide-react';

export function MessagesPage() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, user:profiles!user_id(full_name, email), advisor:profiles!advisor_id(full_name, email), messages(id, content, created_at, sender_id)')
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      return data?.map((c: any) => ({
        ...c,
        lastMessage: c.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0],
        messageCount: c.messages?.length ?? 0,
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-2xl font-semibold text-white">Messages</h1>
        <p className="mt-1 font-body text-sm text-dark-muted">{conversations?.length ?? 0} conversations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        </div>
      ) : !conversations?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-12 w-12 text-dark-muted mb-4" />
          <p className="font-body text-sm text-dark-muted">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => (
            <div key={conv.id} className="rounded-[12px] border border-dark-border bg-dark-surface p-4 hover:bg-dark-surface/80 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                    <MessageSquare className="h-4 w-4 text-teal" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm font-medium text-white">{conv.user?.full_name || 'Unknown User'}</span>
                      <span className="font-body text-xs text-dark-muted">↔</span>
                      <span className="font-body text-sm font-medium text-white">{conv.advisor?.full_name || 'Unknown Advisor'}</span>
                    </div>
                    {conv.lastMessage && (
                      <p className="mt-0.5 font-body text-xs text-dark-muted truncate max-w-[500px]">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-dark-muted">{conv.messageCount} messages</span>
                  {conv.lastMessage && (
                    <p className="font-mono text-[11px] text-dark-muted-2 mt-0.5">
                      {new Date(conv.lastMessage.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
