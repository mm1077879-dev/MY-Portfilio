import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Menu,
  X,
  Home,
  LockKeyhole,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { useSiteSettings } from '../context/SiteContext';

import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { AdminAccessModal } from '../components/common/AdminAccessModal';
import { useToast } from '../context/ToastContext';
import { extractApiErrorMessage } from '../services/api';

const PUBLIC_NAV_ITEMS = [
  { label: 'Home', to: '/', showHomeIcon: true },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const PublicLayout: React.FC = () => {
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshAdmin } = useAuth();
  const { showToast } = useToast();

  const devName = settings?.developerName || 'Mahim Dev';
  const profTitle = settings?.professionalTitle || 'Full-Stack Developer';

  const handleAdminAccess = async () => {
    setCheckingSession(true);
    try {
      const sessionAdmin = await refreshAdmin();
      if (sessionAdmin) {
        navigate('/admin');
      } else {
        setAdminModalOpen(true);
      }
    } catch (err) {
      showToast(
        extractApiErrorMessage(err, 'Could not verify the administrator session.'),
        'error'
      );
    } finally {
      setCheckingSession(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030514] text-[#F5F5FF] relative overflow-x-clip">
      {/* Subtle ambient cosmic radial lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#8B19FF]/12 blur-[130px]" />
        <div className="absolute top-1/4 -right-40 w-[560px] h-[560px] rounded-full bg-[#087BFF]/12 blur-[140px]" />
      </div>

      {/* Top Navigation Bar matching Homepage Reference Image */}
      <header className="sticky top-0 z-40 bg-[#030514]/82 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8 py-3.5">
          {/* Zone 1: Developer Brand */}
          <BrandLogo
            name={devName}
            subtitle={profTitle}
            logoUrl={settings?.logoUrl}
          />

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-2 lg:gap-3"
          >
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#5B21B6] to-[#3B0764] text-white border border-[#8B19FF]/60 shadow-[0_0_20px_rgba(139,25,255,0.38)]'
                      : 'text-[#B5BCD9] hover:text-white'
                  }`}
                >
                  {item.showHomeIcon && isActive && (
                    <Home className="w-3.5 h-3.5 text-[#00D9FF]" />
                  )}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Zone 3: Hidden Admin Access + Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleAdminAccess}
              disabled={checkingSession}
              aria-label="Open private access"
              title="Private access"
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-[#B5BCD9]/70 hover:text-[#00D9FF] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/70 transition-colors disabled:opacity-50"
            >
              <LockKeyhole className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden w-10 h-10 rounded-xl bg-[#090E2C] border border-white/15 flex items-center justify-center text-[#F5F5FF]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#070B24]/98 border-b border-[#8B19FF]/25 px-4 pt-3 pb-5 space-y-2">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-[#8B19FF]/25 text-white border border-[#8B19FF]/45'
                      : 'text-[#B5BCD9] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {adminModalOpen && (
        <AdminAccessModal onClose={() => setAdminModalOpen(false)} />
      )}

      {/* Main Route Viewport */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Reusable Master Footer across all public pages */}
      <Footer />
    </div>
  );
};
