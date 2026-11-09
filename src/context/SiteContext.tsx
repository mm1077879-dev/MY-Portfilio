import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { SiteSettingsData } from '../types/portfolio';
import { buildPageDocumentTitle, detectViewportDevice } from '../utils/portfolioLogic';

interface SiteContextValue {
  settings: SiteSettingsData | null;
  loadingSettings: boolean;
  refreshSettings: () => Promise<void>;
}

const DEFAULT_FALLBACK_SETTINGS: SiteSettingsData = {
  siteTitle: 'Mahim Dev — Full-Stack Developer',
  logoText: 'Mahim Dev',
  logoUrl: '',
  faviconUrl: '/favicon.svg',
  developerName: 'Mahim Dev',
  professionalTitle: 'Full-Stack Developer',
  email: 'hello@mahimdev.com',
  phone: '+1 (555) 234-8910',
  whatsapp: 'https://wa.me/15552348910',
  location: 'Dhaka, Bangladesh · Remote Worldwide',
  mapEmbedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=90.35%2C23.72%2C90.45%2C23.82&layer=mapnik',
  workingHours: 'Mon – Sat · 9:00 AM – 8:00 PM (GMT+6)',
  footerTagline: 'Full-Stack Developer crafting scalable digital products.',
  copyrightText: '© 2025 Mahim Dev. All rights reserved.',
  builtWithText: 'Built with ❤️ for a better web.',
  defaultLanguage: 'en',
  banner: {
    visible: true,
    availabilityText: 'Available for new projects',
    availabilityActive: true,
    headlineLine1: 'Build Something',
    headlineLine2: 'Extraordinary',
    subtitle:
      "I'm Mahim, a Full-Stack Developer specializing in high-performance web apps and eCommerce platforms. Let's turn your ideas into powerful digital products.",
    profileImage: '/src/assets/images/hero_developer_portrait_1793526368603.jpg',
    backgroundStyle: 'cosmic-neon',
    primaryCtaLabel: "Let's Work Together",
    primaryCtaLink: '/contact',
    secondaryCtaLabel: 'Explore My Work',
    secondaryCtaLink: '/projects',
    techStackLine:
      'Full-Stack Development — JavaScript, TypeScript, Next.js, Node, PostgreSQL, MongoDB',
    floatingQuoteTop: 'Dream Big',
    floatingQuoteBottom: 'Build Better',
  },
  stats: {
    happyClients: '50+',
    projectsDelivered: '100+',
    clientRating: '5.0',
    experienceYears: '2+ Years',
  },
  seo: {
    metaTitle: 'Mahim Dev — Full-Stack Developer Portfolio & CMS',
    metaDescription:
      'Full-Stack Developer specializing in high-performance web apps, SaaS applications, and modern eCommerce platforms.',
    keywords: ['Mahim Dev', 'Full-Stack Developer', 'React', 'TypeScript', 'Node.js', 'MongoDB'],
    ogImage: '/src/assets/images/hero_developer_portrait_1793526368603.jpg',
    canonicalUrl: '',
    robots: 'index, follow',
    twitterHandle: '@mahimdev',
  },
  socialLinks: [],
};

const SiteContext = createContext<SiteContextValue>({
  settings: DEFAULT_FALLBACK_SETTINGS,
  loadingSettings: true,
  refreshSettings: async () => undefined,
});

function setMetaContent(selector: string, content: string) {
  const el = document.querySelector(selector);
  if (el && content) {
    el.setAttribute('content', content);
  }
}

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettingsData | null>(DEFAULT_FALLBACK_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const location = useLocation();

  const refreshSettings = useCallback(async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch {
      // Keep graceful defaults if network temporarily unavailable
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Dynamically sync SEO tags whenever route or CMS settings change
  useEffect(() => {
    const activeSettings = settings || DEFAULT_FALLBACK_SETTINGS;
    const baseTitle = activeSettings.seo?.metaTitle || activeSettings.siteTitle;
    const computedTitle = buildPageDocumentTitle(location.pathname, baseTitle);
    document.title = computedTitle;

    const desc = activeSettings.seo?.metaDescription || '';
    setMetaContent('meta[name="description"]', desc);
    setMetaContent('meta[property="og:title"]', computedTitle);
    setMetaContent('meta[property="og:description"]', desc);
    setMetaContent('meta[name="twitter:title"]', computedTitle);
    setMetaContent('meta[name="twitter:description"]', desc);
    setMetaContent('meta[name="robots"]', activeSettings.seo?.robots || 'index, follow');

    if (activeSettings.seo?.keywords?.length) {
      setMetaContent('meta[name="keywords"]', activeSettings.seo.keywords.join(', '));
    }

    if (
      activeSettings.faviconUrl &&
      (activeSettings.faviconUrl.startsWith('/') ||
        /^https?:\/\//i.test(activeSettings.faviconUrl))
    ) {
      const fav = document.querySelector('link[rel="icon"]');
      if (fav) fav.setAttribute('href', activeSettings.faviconUrl);
    }
  }, [location.pathname, settings]);

  // Track public route visits once per navigation in MongoDB Analytics collection
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const projectSlug = location.pathname.startsWith('/projects/')
      ? location.pathname.replace('/projects/', '')
      : undefined;

    let referrerSource = 'Direct';
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        referrerSource = referrerUrl.hostname || 'Direct';
      } catch {
        referrerSource = 'Referral';
      }
    }

    const trackKey = `${location.pathname}::${referrerSource}::${window.innerWidth}`;
    const lastTracked = sessionStorage.getItem('mahim_analytics_last_track');
    if (lastTracked === trackKey) {
      return;
    }

    sessionStorage.setItem('mahim_analytics_last_track', trackKey);

    apiClient
      .post('/analytics/track', {
        path: location.pathname,
        referrer: referrerSource,
        projectSlug,
        deviceType: detectViewportDevice(window.innerWidth),
      })
      .catch(() => undefined);
  }, [location.pathname]);

  return (
    <SiteContext.Provider value={{ settings, loadingSettings, refreshSettings }}>
      {children}
    </SiteContext.Provider>
  );
};

export function useSiteSettings(): SiteContextValue {
  return useContext(SiteContext);
}
