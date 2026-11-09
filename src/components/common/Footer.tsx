import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Grid,
  Sparkles,
  Mail,
  Send,
  Phone,
  MapPin,
  Smartphone,
  ChevronRight,
  ArrowUp,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DynamicIcon } from './DynamicIcon';
import { useSiteSettings } from '../../context/SiteContext';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const isPlayStoreAppListing = (url?: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === '#' ||
    trimmed === 'https://play.google.com/store' ||
    trimmed === 'https://play.google.com/store/'
  ) {
    return false;
  }
  return trimmed.includes('play.google.com') && (trimmed.includes('id=') || trimmed.includes('/details'));
};

const isAppStoreListing = (url?: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === '#' ||
    trimmed === 'https://www.apple.com/app-store/' ||
    trimmed === 'https://www.apple.com/app-store' ||
    trimmed === 'https://apps.apple.com/'
  ) {
    return false;
  }
  return (trimmed.includes('apps.apple.com') || trimmed.includes('apple.com')) && trimmed.includes('/app/');
};

interface TrustItem {
  icon: string;
  title: string;
  description: string;
  visible?: boolean;
}

const DEFAULT_SERVICES = [
  { label: 'E-Commerce Development', to: '/services' },
  { label: 'SaaS Web Applications', to: '/services' },
  { label: 'Custom Admin Dashboards', to: '/services' },
  { label: 'Full-Stack Architecture', to: '/services' },
  { label: 'UI/UX Design Systems', to: '/services' },
  { label: 'Performance & SEO Tuning', to: '/services' },
];

const DEFAULT_QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Projects & Case Studies', to: '/projects' },
  { label: 'Services & Solutions', to: '/services' },
  { label: 'About & Career Journey', to: '/about' },
  { label: 'Contact & Hire', to: '/contact' },
];

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Newsletter form state
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const currentYear = new Date().getFullYear();
  const devName = settings?.developerName || 'Mahim Dev';
  const profTitle = settings?.professionalTitle || 'Full-Stack Software Architect';
  const email = settings?.email || 'hello@mahimdev.com';
  const phone = settings?.phone || '+1 (555) 234-8910';
  const location = settings?.location || 'Dhaka, Bangladesh · Remote Worldwide';
  const socialLinks = (settings?.socialLinks || []).filter(
    (s) => s.visible !== false && s.url && s.url.trim() !== '' && s.url !== '#'
  );

  const footerConfig = settings?.footer;
  const brandTagline =
    footerConfig?.tagline ||
    settings?.footerTagline ||
    'Building high-performance digital products for ambitious teams.';
  const brandDescription =
    footerConfig?.description ||
    "Full-Stack Developer crafting scalable web applications, SaaS platforms, eCommerce ecosystems, and custom administrative solutions with modern architectures.";

  const appDownload = footerConfig?.appDownload || {
    enabled: true,
    title: 'Experience on Mobile',
    subtitle: 'Web app optimized for iOS & Android devices',
    playStoreUrl: 'https://play.google.com/store',
    appStoreUrl: 'https://www.apple.com/app-store/',
    showBadges: true,
  };

  const newsletterConfig = footerConfig?.newsletter || {
    badgeText: 'Newsletter',
    headline: 'Get the latest updates!',
    description:
      'Subscribe to receive monthly tech insights, project launches, and web architecture tutorials.',
    buttonText: 'Subscribe',
  };

  const trustItems: TrustItem[] =
    footerConfig?.trustStrip?.items?.filter((it) => it.visible !== false) || [
      {
        icon: 'ShieldCheck',
        title: 'Security-Minded Architecture',
        description: 'Audited code safety & modern security standards',
      },
      {
        icon: 'Zap',
        title: 'High Performance',
        description: 'Optimized speed & sub-second page loads',
      },
      {
        icon: 'Sparkles',
        title: 'Premium Craft',
        description: 'Pixel-perfect UI & maintainable codebases',
      },
      {
        icon: 'Award',
        title: 'Verified Delivery',
        description: 'Direct partnership & reliable execution',
      },
    ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setSubscriptionStatus('error');
      setFeedbackMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setSubscriptionStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setSubscriptionStatus('idle');
    setFeedbackMessage('');

    try {
      const res = await apiClient.post('/newsletter/subscribe', {
        email: cleanEmail,
        source: 'footer_subscription',
      });

      if (res.data?.success) {
        setSubscriptionStatus('success');
        setFeedbackMessage(
          res.data.message ||
            "Subscription confirmed! Thank you for staying connected with Mahim Dev."
        );
        setEmailInput('');
        showToast('Subscribed to newsletter successfully!', 'success');
      } else {
        throw new Error(res.data?.error?.message || 'Failed to subscribe.');
      }
    } catch (err) {
      setSubscriptionStatus('error');
      const msg = extractApiErrorMessage(err, 'Subscription failed. Please try again.');
      setFeedbackMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderTrustIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#00E69A]" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-[#00D9FF]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#8B19FF]" />;
      case 'Award':
      default:
        return <Award className="w-6 h-6 text-[#087BFF]" />;
    }
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className="relative z-10 bg-[#020518] text-[#F5F7FF] border-t border-white/[0.08] overflow-hidden select-none"
    >
      {/* =====================================================================
          SECTION A: TOP DECORATIVE NEON WAVES (Reference-Matched Flowing Lines)
          ===================================================================== */}
      <div
        aria-hidden="true"
        className="relative w-full h-16 sm:h-24 pointer-events-none overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-75"
        >
          <defs>
            <linearGradient id="waveGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B19FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#087BFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveGradSecondary" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#8B19FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#087BFF" stopOpacity="0.1" />
            </linearGradient>
            <filter id="neonWaveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Secondary ambient wave */}
          <path
            d="M0,45 C280,10 520,85 820,35 C1100,-15 1300,75 1440,30 L1440,120 L0,120 Z"
            fill="url(#waveGradSecondary)"
            opacity="0.25"
          />

          {/* Primary glowing wave line */}
          <path
            d="M0,60 C320,15 580,95 860,40 C1140,-15 1320,85 1440,45"
            stroke="url(#waveGradPrimary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#neonWaveGlow)"
          />

          {/* Accent thin neon hairline */}
          <path
            d="M0,75 C290,30 550,105 840,55 C1120,5 1310,95 1440,60"
            stroke="#00D9FF"
            strokeWidth="1.2"
            strokeOpacity="0.6"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Top ambient cosmic glow aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-b from-[#8B19FF]/15 via-[#087BFF]/10 to-transparent blur-2xl" />
      </div>

      {/* =====================================================================
          SECTION B: MAIN FOOTER CONTENT (3 Major Responsive Content Columns)
          ===================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* -----------------------------------------------------------------
              COLUMN 1 (LEFT, 4 Cols): BRAND PROFILE, SOCIALS, APP DOWNLOAD
              ----------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Brand Logo & Professional Designation */}
            <div className="space-y-3">
              <BrandLogo
                name={devName}
                subtitle={profTitle}
                logoUrl={settings?.logoUrl}
              />
              <p className="text-xs font-semibold text-[#00D9FF] tracking-wide uppercase font-mono">
                {brandTagline}
              </p>
            </div>

            {/* Brand Description */}
            <p className="text-sm text-[#B8C4E5] leading-relaxed max-w-sm">
              {brandDescription}
            </p>

            {/* Social Media Circular Outlined Icon Buttons */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#B8C4E5]/80 font-mono">
                Connect Across Channels
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {socialLinks.map((social, idx) => (
                  <a
                    key={social._id || idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Mahim Dev on ${social.label || social.platform}`}
                    className="group relative w-10 h-10 rounded-full bg-[#050B24] border border-[#8B19FF]/40 hover:border-[#00D9FF] flex items-center justify-center text-[#B8C4E5] hover:text-white transition-all duration-300 shadow-[0_0_12px_rgba(139,25,255,0.15)] hover:shadow-[0_0_18px_rgba(0,217,255,0.45)] hover:scale-105"
                  >
                    <DynamicIcon
                      name={social.icon || social.platform}
                      className="w-4 h-4 transition-transform group-hover:scale-110"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* App Download Card (Matching Visual Reference) */}
            {appDownload.enabled && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#050B24] via-[#070E30] to-[#0E1640] border border-[#8B19FF]/40 p-4 shadow-[0_10px_30px_-10px_rgba(139,25,255,0.3)] group hover:border-[#00D9FF]/60 transition-all duration-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B19FF]/30 to-[#00D9FF]/30 border border-[#8B19FF]/50 flex items-center justify-center text-[#00D9FF] shrink-0 shadow-[0_0_15px_rgba(0,217,255,0.3)]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{appDownload.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#00D9FF] opacity-75" />
                    </h4>
                    <p className="text-xs text-[#B8C4E5] leading-snug">
                      {appDownload.subtitle}
                    </p>

                    {/* App Store / Web App Badges */}
                    {appDownload.showBadges && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {isPlayStoreAppListing(appDownload.playStoreUrl) && (
                          <a
                            href={appDownload.playStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Google Play Store App"
                            className="px-2.5 py-1 rounded-md bg-[#020518] border border-white/15 text-[11px] font-mono text-[#F5F7FF] hover:border-[#00D9FF] hover:text-[#00D9FF] transition-colors"
                          >
                            Google Play
                          </a>
                        )}
                        {isAppStoreListing(appDownload.appStoreUrl) && (
                          <a
                            href={appDownload.appStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Apple App Store App"
                            className="px-2.5 py-1 rounded-md bg-[#020518] border border-white/15 text-[11px] font-mono text-[#F5F7FF] hover:border-[#8B19FF] hover:text-[#8B19FF] transition-colors"
                          >
                            App Store
                          </a>
                        )}
                        {!isPlayStoreAppListing(appDownload.playStoreUrl) &&
                          !isAppStoreListing(appDownload.appStoreUrl) && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#020518] border border-white/10 text-[11px] font-mono text-[#00D9FF]">
                              <Smartphone className="w-3.5 h-3.5 text-[#00D9FF]" />
                              <span>PWA & Mobile Ready</span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* -----------------------------------------------------------------
              COLUMN 2 (CENTER, 4 Cols): QUICK LINKS + OUR SERVICES
              ----------------------------------------------------------------- */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {/* Desktop Vertical Separator */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute -left-4 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
            />

            {/* Quick Links Group */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050B24] border border-[#8B19FF]/40 text-[#F5F7FF] text-xs font-semibold shadow-[0_0_15px_rgba(139,25,255,0.25)]">
                <Grid className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span>Quick Links</span>
              </div>

              <ul className="space-y-2.5">
                {DEFAULT_QUICK_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-2 text-sm text-[#B8C4E5] hover:text-white transition-colors duration-200"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#8B19FF] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#00D9FF]" />
                      <span className="group-hover:underline underline-offset-4 decoration-[#8B19FF]/50">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Services Group */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050B24] border border-[#087BFF]/40 text-[#F5F7FF] text-xs font-semibold shadow-[0_0_15px_rgba(8,123,255,0.25)]">
                <Sparkles className="w-3.5 h-3.5 text-[#8B19FF]" />
                <span>Our Services</span>
              </div>

              <ul className="space-y-2.5">
                {DEFAULT_SERVICES.map((srv, idx) => (
                  <li key={idx}>
                    <Link
                      to={srv.to}
                      className="group flex items-center gap-2 text-sm text-[#B8C4E5] hover:text-white transition-colors duration-200"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#00D9FF] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#8B19FF]" />
                      <span className="group-hover:underline underline-offset-4 decoration-[#00D9FF]/50">
                        {srv.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              COLUMN 3 (RIGHT, 4 Cols): NEWSLETTER + CONTACT INFO + SKYLINE
              ----------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6 relative">
            {/* Desktop Vertical Separator */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute -left-4 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
            />

            {/* Newsletter Pill Heading */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050B24] border border-[#8B19FF]/40 text-[#F5F7FF] text-xs font-semibold shadow-[0_0_15px_rgba(139,25,255,0.25)]">
                <Mail className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span>{newsletterConfig.badgeText}</span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-gradient-purple">
                {newsletterConfig.headline}
              </h3>
              <p className="text-xs text-[#B8C4E5] leading-relaxed">
                {newsletterConfig.description}
              </p>
            </div>

            {/* Newsletter Subscription Form with Real Backend Persistence */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#B8C4E5] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your work email..."
                  required
                  disabled={submitting}
                  aria-label="Email Address for Newsletter Subscription"
                  className="w-full rounded-full bg-[#050B24] border border-white/20 pl-10 pr-28 py-3 text-sm text-white placeholder:text-[#B8C4E5]/50 focus:outline-none focus:border-[#00D9FF] focus:shadow-[0_0_15px_rgba(0,217,255,0.35)] transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="absolute right-1.5 btn-neon-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white cursor-pointer shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{newsletterConfig.buttonText}</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Verified Feedback Message */}
              {subscriptionStatus === 'success' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-[#00E69A]/10 border border-[#00E69A]/40 text-[#00E69A] text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{feedbackMessage}</p>
                </div>
              )}
              {subscriptionStatus === 'error' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{feedbackMessage}</p>
                </div>
              )}
            </form>

            {/* Contact Information Area */}
            <div className="pt-2 space-y-2.5 text-xs text-[#B8C4E5]">
              <span className="block font-semibold uppercase tracking-wider text-[#B8C4E5]/80 font-mono">
                Direct Contact Channels
              </span>
              <div className="space-y-2">
                {Boolean(phone && phone.trim()) && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2.5 text-[#F5F7FF] hover:text-[#00D9FF] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#087BFF]/15 border border-[#087BFF]/30 flex items-center justify-center text-[#00D9FF] shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-mono">{phone}</span>
                  </a>
                )}

                {Boolean(email && email.trim()) && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 text-[#F5F7FF] hover:text-[#00D9FF] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#8B19FF]/15 border border-[#8B19FF]/30 flex items-center justify-center text-[#9B1CFF] shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-mono">{email}</span>
                  </a>
                )}

                {Boolean(location && location.trim()) && (
                  <div className="flex items-center gap-2.5 text-[#F5F7FF]">
                    <div className="w-6 h-6 rounded-md bg-[#00E69A]/15 border border-[#00E69A]/30 flex items-center justify-center text-[#00E69A] shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Futuristic City Skyline (Reference Matching, Non-obstructive) */}
            <div
              aria-hidden="true"
              className="relative w-full h-16 pointer-events-none overflow-hidden opacity-60 mt-2"
            >
              <svg
                viewBox="0 0 400 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="skylineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B19FF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
                {/* Silhouette buildings */}
                <rect x="10" y="25" width="22" height="45" rx="2" fill="#070E30" stroke="#8B19FF" strokeWidth="0.8" />
                <rect x="36" y="12" width="28" height="58" rx="2" fill="#09123D" stroke="#00D9FF" strokeWidth="0.8" />
                <rect x="68" y="30" width="20" height="40" rx="2" fill="#070E30" stroke="#087BFF" strokeWidth="0.8" />
                <rect x="92" y="8" width="32" height="62" rx="2" fill="#0B174F" stroke="#8B19FF" strokeWidth="0.8" />
                <rect x="128" y="22" width="26" height="48" rx="2" fill="#070E30" stroke="#00D9FF" strokeWidth="0.8" />
                <rect x="158" y="35" width="30" height="35" rx="2" fill="#09123D" stroke="#087BFF" strokeWidth="0.8" />
                <rect x="192" y="15" width="36" height="55" rx="2" fill="#0B174F" stroke="#8B19FF" strokeWidth="0.8" />
                <rect x="232" y="28" width="24" height="42" rx="2" fill="#070E30" stroke="#00D9FF" strokeWidth="0.8" />
                <rect x="260" y="5" width="34" height="65" rx="2" fill="#0B174F" stroke="#8B19FF" strokeWidth="0.8" />
                <rect x="298" y="20" width="28" height="50" rx="2" fill="#09123D" stroke="#087BFF" strokeWidth="0.8" />
                <rect x="330" y="32" width="22" height="38" rx="2" fill="#070E30" stroke="#00D9FF" strokeWidth="0.8" />
                <rect x="356" y="16" width="34" height="54" rx="2" fill="#09123D" stroke="#087BFF" strokeWidth="0.8" />

                {/* Glowing windows */}
                <circle cx="48" cy="22" r="1.5" fill="#00D9FF" opacity="0.9" />
                <circle cx="56" cy="32" r="1.5" fill="#8B19FF" opacity="0.9" />
                <circle cx="106" cy="18" r="1.5" fill="#00D9FF" opacity="0.9" />
                <circle cx="114" cy="28" r="1.5" fill="#00E69A" opacity="0.9" />
                <circle cx="206" cy="25" r="1.5" fill="#00D9FF" opacity="0.9" />
                <circle cx="214" cy="35" r="1.5" fill="#8B19FF" opacity="0.9" />
                <circle cx="274" cy="15" r="1.5" fill="#00D9FF" opacity="0.9" />
                <circle cx="282" cy="25" r="1.5" fill="#00E69A" opacity="0.9" />
              </svg>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SECTION C: TRUST & FEATURES STRIP (4-Item Balanced Bar)
            ===================================================================== */}
        {footerConfig?.trustStrip?.visible !== false && (
          <div className="mt-12 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#050B24] via-[#070E33] to-[#050B24] border border-[#8B19FF]/35 p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(139,25,255,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-white/[0.08]">
              {trustItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3.5 ${
                    idx === 0
                      ? 'lg:pr-6'
                      : idx === trustItems.length - 1
                        ? 'lg:pl-6 pt-4 sm:pt-0'
                        : 'lg:px-6 pt-4 sm:pt-0'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#030518] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                    {renderTrustIcon(item.icon)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-display font-bold text-sm text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#B8C4E5] leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            SECTION D: BOTTOM COPYRIGHT & NAVIGATION BAR (With Back-To-Top)
            ===================================================================== */}
        <div className="mt-10 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright notice with dynamic current year */}
          <div className="text-xs text-[#B8C4E5] text-center md:text-left">
            <p>
              © {currentYear} {devName}. All rights reserved.
            </p>
          </div>

          {/* Bottom Primary Route Navigation Links */}
          <nav
            aria-label="Footer Bottom Navigation"
            className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-medium text-[#B8C4E5]"
          >
            <Link to="/" className="hover:text-white hover:underline transition-colors">
              Home
            </Link>
            <Link to="/projects" className="hover:text-white hover:underline transition-colors">
              Projects
            </Link>
            <Link to="/services" className="hover:text-white hover:underline transition-colors">
              Services
            </Link>
            <Link to="/about" className="hover:text-white hover:underline transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-white hover:underline transition-colors">
              Contact
            </Link>
          </nav>

          {/* Social Links Follow Us + Back To Top Button */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline text-xs font-mono text-[#B8C4E5]/80">
              Follow Us:
            </span>
            <div className="flex items-center gap-2">
              {socialLinks.slice(0, 4).map((social, idx) => (
                <a
                  key={social._id || idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label || social.platform}
                  className="w-7 h-7 rounded-full bg-[#050B24] border border-white/10 flex items-center justify-center text-[#B8C4E5] hover:text-white hover:border-[#00D9FF] transition-colors"
                >
                  <DynamicIcon name={social.icon || social.platform} className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Circular Back To Top Floating Action Button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top of page"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B19FF] to-[#087BFF] p-0.5 shadow-[0_0_20px_rgba(139,25,255,0.45)] hover:shadow-[0_0_25px_rgba(0,217,255,0.65)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
            >
              <div className="w-full h-full rounded-full bg-[#030518] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <ArrowUp className="w-4 h-4 text-white group-hover:animate-bounce" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
