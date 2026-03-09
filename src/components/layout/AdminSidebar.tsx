import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Handshake, CalendarDays, Video, FileText, ShieldCheck, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Advisors', icon: GraduationCap, path: '/advisors' },
  { label: 'Engagements', icon: Handshake, path: '/engagements' },
  { label: 'Bookings', icon: CalendarDays, path: '/bookings' },
  { label: 'Recordings', icon: Video, path: '/recordings' },
  { label: 'Documents', icon: FileText, path: '/documents' },
  { label: 'KYC', icon: ShieldCheck, path: '/kyc' },
  { label: 'Messages', icon: MessageSquare, path: '/messages' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAdminAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[240px] flex flex-col bg-sidebar border-r border-dark-border p-5">
      <div className="mb-1">
        <span className="font-body text-xl font-bold text-teal tracking-tight">adwise</span>
      </div>
      <span className="inline-flex w-fit rounded-full bg-dark-surface px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-wider text-dark-muted mb-6">
        Admin Portal
      </span>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2 font-body text-[13px] transition-colors ${
                active
                  ? 'bg-dark-surface text-white border-l-[3px] border-l-teal'
                  : 'text-dark-muted hover:text-white hover:bg-dark-surface/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 py-2 font-body text-[13px] text-dark-muted hover:text-red-400 mt-4"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </aside>
  );
}
