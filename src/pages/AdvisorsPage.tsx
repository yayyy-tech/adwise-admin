import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, callEdgeFunction } from '../lib/supabase';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Plus, X } from 'lucide-react';

const SPECIALISATIONS = [
  'Investment Planning', 'Tax Optimisation', 'Retirement Planning',
  'Insurance Planning', 'Goal-Based Planning', 'NRI Financial Planning',
  'Debt Management', 'Portfolio Review', 'Estate Planning',
];

function generateTempPassword(): string {
  const adj = ['Swift', 'Clear', 'Bright', 'Calm', 'Bold'];
  const noun = ['Lotus', 'River', 'Peak', 'Dawn', 'Stone'];
  const num = Math.floor(100 + Math.random() * 900);
  return `Adwise@${adj[Math.floor(Math.random() * adj.length)]}${num}!`;
}

export function AdvisorsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: advisors, isLoading } = useQuery({
    queryKey: ['admin-advisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisor_profiles')
        .select('*, profiles!id(full_name, email, city)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-body text-2xl font-semibold text-white">Advisors</h1>
          <p className="mt-1 font-body text-sm text-dark-muted">{advisors?.length ?? 0} advisor accounts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-[8px] bg-teal px-4 py-2.5 font-body text-sm font-semibold text-dark-base hover:bg-teal-dim transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Advisor
        </button>
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
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">SEBI</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Clients</th>
                <th className="px-4 py-3 text-left font-body text-xs font-medium text-dark-muted uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody>
              {advisors?.map((advisor: any) => (
                <tr key={advisor.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-4 py-3 font-body text-sm text-white">{advisor.profiles?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-muted">{advisor.profiles?.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">{advisor.sebi_registration_number || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-[11px] ${
                      advisor.status === 'active' ? 'bg-teal/10 text-teal'
                      : advisor.status === 'suspended' ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {advisor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-white">{advisor.client_count}</td>
                  <td className="px-4 py-3 font-mono text-sm text-white">{advisor.rating > 0 ? advisor.rating : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateAdvisorModal
          onClose={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ['admin-advisors'] });
          }}
        />
      )}
    </div>
  );
}

function CreateAdvisorModal({ onClose }: { onClose: () => void }) {
  const { session } = useAdminAuthStore();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    sebi_number: '',
    years_experience: '',
    specialisations: [] as string[],
    temp_password: generateTempPassword(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setIsLoading(true);
    setError('');
    try {
      await callEdgeFunction('create-advisor-account', formData, session);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-[560px] rounded-[16px] border border-dark-border bg-dark-surface p-8 max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
              <span className="text-3xl text-teal">&#10003;</span>
            </div>
            <h3 className="font-body text-xl font-semibold text-white">Advisor account created</h3>
            <p className="font-body text-sm text-dark-muted">
              {formData.full_name} has been sent a welcome email with their login credentials.
            </p>
            <button onClick={onClose} className="rounded-[8px] bg-teal px-6 py-2.5 font-body text-sm font-semibold text-dark-base">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-body text-xl font-semibold text-white">Create Advisor Account</h2>
                <p className="mt-1 font-body text-sm text-dark-muted">Welcome email with credentials will be sent automatically.</p>
              </div>
              <button onClick={onClose} className="text-dark-muted hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs text-dark-muted mb-1.5">Full Name *</label>
                  <input
                    value={formData.full_name}
                    onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Priya Krishnamurthy"
                    className="h-11 w-full rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-body text-sm text-white placeholder:text-dark-muted-2 focus:border-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs text-dark-muted mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="priya@example.com"
                    className="h-11 w-full rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-body text-sm text-white placeholder:text-dark-muted-2 focus:border-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs text-dark-muted mb-1.5">SEBI Registration *</label>
                  <input
                    value={formData.sebi_number}
                    onChange={(e) => setFormData((p) => ({ ...p, sebi_number: e.target.value }))}
                    placeholder="INA000012847"
                    className="h-11 w-full rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-mono text-sm text-white placeholder:text-dark-muted-2 focus:border-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs text-dark-muted mb-1.5">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData((p) => ({ ...p, years_experience: e.target.value }))}
                    placeholder="9"
                    className="h-11 w-full rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-body text-sm text-white placeholder:text-dark-muted-2 focus:border-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs text-dark-muted mb-2">Specialisations</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALISATIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          specialisations: p.specialisations.includes(s)
                            ? p.specialisations.filter((x) => x !== s)
                            : [...p.specialisations, s],
                        }))
                      }
                      className={`rounded-full px-3 py-1.5 font-body text-xs transition-colors ${
                        formData.specialisations.includes(s)
                          ? 'bg-teal text-dark-base'
                          : 'border border-dark-border text-dark-muted hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-body text-xs text-dark-muted mb-1.5">Temporary Password</label>
                <div className="flex gap-2">
                  <input
                    value={formData.temp_password}
                    onChange={(e) => setFormData((p) => ({ ...p, temp_password: e.target.value }))}
                    className="h-11 flex-1 rounded-[8px] border border-dark-border bg-dark-surface-2 px-3 font-mono text-sm text-white focus:border-teal focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, temp_password: generateTempPassword() }))}
                    className="h-11 rounded-[8px] border border-dark-border px-3 font-body text-xs text-dark-muted hover:text-white"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="mt-1 font-body text-[11px] text-dark-muted-2">Advisor must change this on first login.</p>
              </div>

              {error && <p className="font-body text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 h-11 rounded-[8px] border border-dark-border font-body text-sm text-dark-muted hover:text-white">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isLoading || !formData.full_name || !formData.email || !formData.sebi_number}
                  className="flex-1 h-11 rounded-[8px] bg-teal font-body text-sm font-semibold text-dark-base hover:bg-teal-dim disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Account + Send Email'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
