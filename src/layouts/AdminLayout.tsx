import React, { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  Briefcase,
  UserCheck,
  MessageSquareQuote,
  Cpu,
  CreditCard,
  HelpCircle,
  Mail,
  Inbox,
  Settings,
  SearchCheck,
  Share2,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCog,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient, extractApiErrorMessage } from '../services/api';
import { BrandLogo } from '../components/common/BrandLogo';
import { ResilientImage } from '../components/common/ResilientImage';
import { AdminNotificationCenter } from '../components/common/AdminNotificationCenter';

interface NavGroup {
  heading: string;
  items: Array<{
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    end?: boolean;
    badgeKey?: 'unread' | 'notifications';
  }>;
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Dashboard',
    items: [
      { label: 'Dashboard Overview', to: '/admin', icon: LayoutDashboard, end: true },
    ],
  },
  {
    heading: 'Website Control',
    items: [
      { label: 'Update Banner', to: '/admin/banner', icon: Sparkles },
      { label: 'Manage Projects', to: '/admin/projects', icon: FolderKanban },
      { label: 'Manage Services', to: '/admin/services', icon: Briefcase },
      { label: 'Manage About', to: '/admin/about', icon: UserCheck },
      { label: 'Manage Testimonials', to: '/admin/testimonials', icon: MessageSquareQuote },
      { label: 'Manage Skills', to: '/admin/skills', icon: Cpu },
      { label: 'Manage Pricing', to: '/admin/pricing', icon: CreditCard },
      { label: 'Manage FAQ', to: '/admin/faq', icon: HelpCircle },
    ],
  },
  {
    heading: 'Communication',
    items: [
      { label: 'Messages', to: '/admin/messages', icon: Mail, badgeKey: 'unread' },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Contact Inquiries', to: '/admin/inquiries', icon: Inbox },
      { label: 'Newsletter Subscribers', to: '/admin/newsletter', icon: MessageSquareQuote },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'Site Settings', to: '/admin/settings', icon: Settings },
      { label: 'Footer & Trust Settings', to: '/admin/footer', icon: LayoutDashboard },
      { label: 'SEO Settings', to: '/admin/seo', icon: SearchCheck },
      { label: 'Social Links', to: '/admin/socials', icon: Share2 },
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const { admin, loading, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get('/messages?limit=1')
      .then((res) => {
        setUnreadCount(res.data?.meta?.counts?.unread || 0);
      })
      .catch(() => undefined);
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handleCountsUpdated = (event: Event) => {
      const custom = event as CustomEvent<Record<string, number> | undefined>;
      if (custom.detail && typeof custom.detail.unread === 'number') {
        setUnreadCount(custom.detail.unread);
      }
    };
    window.addEventListener('cms:messages-updated', handleCountsUpdated);
    return () => window.removeEventListener('cms:messages-updated', handleCountsUpdated);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030514] flex items-center justify-center">
        <div className="cosmic-card rounded-2xl px-8 py-6 text-sm text-[#B5BCD9] animate-pulse">
          Verifying administrator session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out of Admin Dashboard.', 'info');
      navigate('/');
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Could not sign out. Please try again.'), 'error');
    }
  };

  const currentSectionLabel =
    ADMIN_NAV_GROUPS.flatMap((g) => g.items).find((i) =>
      i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
    )?.label ||
    (location.pathname.includes('/profile') ? 'Admin Profile & Security' : 'Overview');

  return (
    <div className="min-h-screen bg-[#030514] text-[#F5F5FF] flex overflow-x-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Navigation Sidebar */}
      <aside
        aria-label="Admin Sidebar Navigation"
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[264px] bg-[#070B24] border-r border-[#8B19FF]/20 flex flex-col transition-transform duration-200 lg:translate-x-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.07]">
          <BrandLogo name="Mahim CMS" subtitle="Admin Console" to="/admin" />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden text-[#B5BCD9] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.heading} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#B5BCD9]/60">
                {group.heading}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#8B19FF]/30 to-[#087BFF]/20 text-white border border-[#8B19FF]/50 shadow-[0_0_18px_rgba(139,25,255,0.25)]'
                            : 'text-[#B5BCD9] hover:text-white hover:bg-white/[0.04]'
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 text-[#00D9FF] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badgeKey === 'unread' && unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#8B19FF] text-white tabular-nums">
                          {unreadCount}
                        </span>
                      )}
                      {item.badgeKey === 'notifications' && notificationUnreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500 text-white tabular-nums">
                          {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Profile & Logout Card */}
        <div className="p-3.5 border-t border-white/[0.07] space-y-2">
          <Link
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#090E2C] border border-white/10 hover:border-[#8B19FF]/45 transition-colors"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#8B19FF]/40 shrink-0">
              <ResilientImage src={admin.avatar} alt={admin.name} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{admin.name}</div>
              <div className="text-[11px] text-[#B5BCD9] truncate capitalize">{admin.role}</div>
            </div>
            <UserCog className="w-4 h-4 text-[#00D9FF] shrink-0" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Bar Contract for SaaS Dashboard */}
        <header className="sticky top-0 z-30 h-16 bg-[#030514]/88 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin sidebar"
              className="lg:hidden w-9 h-9 rounded-xl bg-[#090E2C] border border-white/15 flex items-center justify-center text-white shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#B5BCD9] truncate">
              <span>Admin</span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-white truncate">{currentSectionLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AdminNotificationCenter onUnreadCountChange={setNotificationUnreadCount} />
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#E2E8F0] bg-[#090E2C] border border-white/12 hover:border-[#8B19FF] transition-colors whitespace-nowrap shrink-0"
            >
              <Mail className="w-3.5 h-3.5 text-[#00D9FF]" />
              <span>Inbox</span>
              {unreadCount > 0 && (
                <span className="font-mono text-[#00E69A] tabular-nums">({unreadCount})</span>
              )}
            </Link>

            <Link
              to="/"
              className="btn-neon-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap shrink-0"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="px-4 sm:px-8 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#B5BCD9]/75">
          <span>Mahim Dev Portfolio Administration &amp; CMS</span>
          <span>MongoDB + Express REST API v1</span>
        </footer>
      </div>
    </div>
  );
};
