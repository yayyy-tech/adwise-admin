import { useState } from 'react';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function LoginPage() {
  const { signIn } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-base px-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <span className="font-body text-2xl font-bold text-teal tracking-tight">adwise</span>
          <div className="mt-1">
            <span className="inline-flex rounded-full bg-dark-surface px-2.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-wider text-dark-muted">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="rounded-[16px] border border-dark-border bg-dark-surface p-8 space-y-5">
          <div>
            <h2 className="font-body text-xl font-semibold text-white">Sign in</h2>
            <p className="mt-1 font-body text-sm text-dark-muted">Admin access only</p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 w-full rounded-[12px] border border-dark-border bg-dark-surface-2 px-4 font-body text-sm text-white placeholder:text-dark-muted focus:border-teal focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="h-12 w-full rounded-[12px] border border-dark-border bg-dark-surface-2 px-4 font-body text-sm text-white placeholder:text-dark-muted focus:border-teal focus:outline-none"
            />
            {error && <p className="font-body text-xs text-red-400">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="h-12 w-full rounded-[12px] bg-teal font-body text-sm font-semibold text-dark-base hover:bg-teal-dim transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
