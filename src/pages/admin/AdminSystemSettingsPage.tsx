import React, { useEffect, useState } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useSiteSettings } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { SocialLinkItem } from '../../types/portfolio';
import { parseDelimitedList, formatDelimitedList } from '../../utils/portfolioLogic';
import {
  passwordChangeFormSchema,
  type PasswordChangeFormValues,
} from '../../validations/clientSchemas';
import { ImageUploaderField } from '../../components/common/ImageUploaderField';

// ============================================================================
// 1. SITE SETTINGS PAGE
// ============================================================================
export const AdminSiteSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    siteTitle: '',
    logoText: '',
    logoUrl: '',
    faviconUrl: '/favicon.svg',
    developerName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    mapEmbedUrl: '',
    workingHours: '',
    footerTagline: '',
    copyrightText: '',
    builtWithText: '',
    defaultLanguage: 'en',
    happyClients: '50+',
    projectsDelivered: '100+',
    clientRating: '5.0',
    experienceYears: '2+ Years',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteTitle: settings.siteTitle || '',
        logoText: settings.logoText || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '/favicon.svg',
        developerName: settings.developerName || '',
        professionalTitle: settings.professionalTitle || '',
        email: settings.email || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        location: settings.location || '',
        mapEmbedUrl: settings.mapEmbedUrl || '',
        workingHours: settings.workingHours || '',
        footerTagline: settings.footerTagline || '',
        copyrightText: settings.copyrightText || '',
        builtWithText: settings.builtWithText || '',
        defaultLanguage: settings.defaultLanguage || 'en',
        happyClients: settings.stats?.happyClients || '50+',
        projectsDelivered: settings.stats?.projectsDelivered || '100+',
        clientRating: settings.stats?.clientRating || '5.0',
        experienceYears: settings.stats?.experienceYears || '2+ Years',
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/settings', {
        siteTitle: form.siteTitle,
        logoText: form.logoText,
        logoUrl: form.logoUrl,
        faviconUrl: form.faviconUrl,
        developerName: form.developerName,
        professionalTitle: form.professionalTitle,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        location: form.location,
        mapEmbedUrl: form.mapEmbedUrl,
        workingHours: form.workingHours,
        footerTagline: form.footerTagline,
        copyrightText: form.copyrightText,
        builtWithText: form.builtWithText,
        defaultLanguage: form.defaultLanguage,
        stats: {
          happyClients: form.happyClients,
          projectsDelivered: form.projectsDelivered,
          clientRating: form.clientRating,
          experienceYears: form.experienceYears,
        },
      });
      await refreshSettings();
      showToast('Site settings & public contact details updated!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Site Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Configure global branding, public contact cards, homepage statistics, map embed, and footer copy.
        </p>
      </div>

      <form onSubmit={handleSave} className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Website Title</label>
            <input
              type="text"
              value={form.siteTitle}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Developer Name</label>
            <input
              type="text"
              value={form.developerName}
              onChange={(e) => setForm({ ...form, developerName: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Professional Title</label>
            <input
              type="text"
              value={form.professionalTitle}
              onChange={(e) => setForm({ ...form, professionalTitle: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Public Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">WhatsApp Link or Number</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Working Hours</label>
            <input
              type="text"
              value={form.workingHours}
              onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <ImageUploaderField
            label="Custom Brand Logo Image (Leave empty for Neon M Monogram)"
            value={form.logoUrl}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
          />
          <ImageUploaderField
            label="Favicon Image URL"
            value={form.faviconUrl}
            onChange={(url) => setForm({ ...form, faviconUrl: url })}
          />
        </div>

        <div className="pt-2 border-t border-white/10">
          <h2 className="font-display font-bold text-base text-white mb-3">
            Homepage Statistics Strip
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[#B5BCD9] mb-1">Happy Clients</label>
              <input
                type="text"
                value={form.happyClients}
                onChange={(e) => setForm({ ...form, happyClients: e.target.value })}
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B5BCD9] mb-1">Projects Delivered</label>
              <input
                type="text"
                value={form.projectsDelivered}
                onChange={(e) => setForm({ ...form, projectsDelivered: e.target.value })}
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B5BCD9] mb-1">Client Rating</label>
              <input
                type="text"
                value={form.clientRating}
                onChange={(e) => setForm({ ...form, clientRating: e.target.value })}
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B5BCD9] mb-1">Experience</label>
              <input
                type="text"
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
            Contact Page Map Embed URL
          </label>
          <input
            type="text"
            value={form.mapEmbedUrl}
            onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Copyright Notice</label>
            <input
              type="text"
              value={form.copyrightText}
              onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Footer Right Message</label>
            <input
              type="text"
              value={form.builtWithText}
              onChange={(e) => setForm({ ...form, builtWithText: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// 2. SEO SETTINGS PAGE
// ============================================================================
export const AdminSeoSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [seoForm, setSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    keywordsRaw: '',
    ogImage: '',
    canonicalUrl: '',
    robots: 'index, follow',
    twitterHandle: '@mahimdev',
  });

  useEffect(() => {
    if (settings?.seo) {
      setSeoForm({
        metaTitle: settings.seo.metaTitle || '',
        metaDescription: settings.seo.metaDescription || '',
        keywordsRaw: formatDelimitedList(settings.seo.keywords),
        ogImage: settings.seo.ogImage || '',
        canonicalUrl: settings.seo.canonicalUrl || '',
        robots: settings.seo.robots || 'index, follow',
        twitterHandle: settings.seo.twitterHandle || '@mahimdev',
      });
    }
  }, [settings]);

  const saveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/settings', {
        seo: {
          metaTitle: seoForm.metaTitle,
          metaDescription: seoForm.metaDescription,
          keywords: parseDelimitedList(seoForm.keywordsRaw),
          ogImage: seoForm.ogImage,
          canonicalUrl: seoForm.canonicalUrl,
          robots: seoForm.robots,
          twitterHandle: seoForm.twitterHandle,
        },
      });
      await refreshSettings();
      showToast('SEO & OpenGraph metadata updated!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          SEO &amp; Social Sharing Metadata
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Manage dynamic document titles, OpenGraph cards, robots.txt directives, and sitemap canonical URLs.
        </p>
      </div>

      <form onSubmit={saveSeo} className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
            Default Meta Title (30–60 characters recommended)
          </label>
          <input
            type="text"
            value={seoForm.metaTitle}
            onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
            Meta Description (120–160 characters recommended)
          </label>
          <textarea
            rows={3}
            value={seoForm.metaDescription}
            onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
            SEO Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={seoForm.keywordsRaw}
            onChange={(e) => setSeoForm({ ...seoForm, keywordsRaw: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <ImageUploaderField
          label="OpenGraph Social Share Image"
          value={seoForm.ogImage}
          onChange={(url) => setSeoForm({ ...seoForm, ogImage: url })}
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Canonical Base URL</label>
            <input
              type="text"
              placeholder="https://mahimdev.com"
              value={seoForm.canonicalUrl}
              onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Robots Directive</label>
            <select
              value={seoForm.robots}
              onChange={(e) => setSeoForm({ ...seoForm, robots: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            >
              <option value="index, follow">index, follow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">X / Twitter Handle</label>
            <input
              type="text"
              value={seoForm.twitterHandle}
              onChange={(e) => setSeoForm({ ...seoForm, twitterHandle: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save SEO Metadata'}</span>
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// 3. SOCIAL LINKS PAGE
// ============================================================================
export const AdminSocialLinksPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { showToast } = useToast();
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.socialLinks) {
      setLinks(settings.socialLinks);
    }
  }, [settings]);

  const addLink = () => {
    setLinks([
      ...links,
      {
        platform: 'GitHub',
        label: 'GitHub Profile',
        url: 'https://github.com',
        icon: 'Github',
        order: links.length + 1,
        visible: true,
      },
    ]);
  };

  const updateItem = (idx: number, patch: Partial<SocialLinkItem>) => {
    setLinks((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    const copy = [...links];
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    setLinks(copy.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const removeItem = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await apiClient.put('/settings', { socialLinks: links });
      await refreshSettings();
      showToast('Social media links saved!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Social Links
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Add, edit, reorder, or hide social profile links across the Footer and Contact page.
          </p>
        </div>
        <button
          type="button"
          onClick={addLink}
          className="btn-neon-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      <div className="space-y-3">
        {links.map((item, idx) => (
          <div
            key={idx}
            className="cosmic-card rounded-2xl p-4 grid sm:grid-cols-12 gap-3 items-center"
          >
            <div className="sm:col-span-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                aria-label="Move social link up"
                className="p-1.5 rounded bg-white/5 disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(idx, 1)}
                disabled={idx === links.length - 1}
                aria-label="Move social link down"
                className="p-1.5 rounded bg-white/5 disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="sm:col-span-3">
              <select
                value={item.platform}
                onChange={(e) =>
                  updateItem(idx, {
                    platform: e.target.value,
                    icon:
                      e.target.value === 'GitHub'
                        ? 'Github'
                        : e.target.value === 'LinkedIn'
                          ? 'Linkedin'
                          : e.target.value === 'YouTube'
                            ? 'Youtube'
                            : e.target.value === 'X'
                              ? 'Twitter'
                              : 'MessageSquare',
                  })
                }
                aria-label="Social platform"
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
              >
                <option value="GitHub">GitHub</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="X">X / Twitter</option>
                <option value="Discord">Discord</option>
              </select>
            </div>

            <div className="sm:col-span-5">
              <input
                type="url"
                value={item.url}
                onChange={(e) => updateItem(idx, { url: e.target.value })}
                placeholder="https://..."
                aria-label="Profile URL"
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3">
              <input
                type="checkbox"
                checked={item.visible}
                onChange={(e) => updateItem(idx, { visible: e.target.checked })}
                aria-label="Toggle link visibility"
                className="w-4 h-4 accent-[#00E69A]"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                aria-label="Remove social link"
                className="p-2 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={saveAll}
        className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : 'Save Social Links'}</span>
      </button>
    </div>
  );
};

// ============================================================================
// 4. ANALYTICS DEEP DIVE PAGE
// ============================================================================
export const AdminAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [pagesData, setPagesData] = useState<{
    popularPages: Array<{ path: string; views: number }>;
    referrers: Array<{ source: string; visits: number }>;
    projectViews: Array<{ _id: string; title: string; category: string; views: number }>;
  } | null>(null);
  const [deviceData, setDeviceData] = useState<Array<{ device: string; count: number }>>([]);

  useEffect(() => {
    Promise.all([
      apiClient.get('/analytics/pages?days=30'),
      apiClient.get('/analytics/visitors?days=30'),
    ])
      .then(([pRes, vRes]) => {
        setPagesData(pRes.data.data);
        setDeviceData(vRes.data.data?.byDevice || []);
      })
      .catch((err) => showToast(extractApiErrorMessage(err), 'error'));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Traffic &amp; Content Analytics (30 Days)
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Privacy-conscious visitor telemetry aggregated from the MongoDB Analytics collection (180-day TTL retention).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cosmic-card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-white">Popular Public Pages</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pagesData?.popularPages || []} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: '#B5BCD9', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="path"
                  width={130}
                  tick={{ fill: '#F5F5FF', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090E2C',
                    borderColor: '#8B19FF',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="views"
                  fill="#8B19FF"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cosmic-card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-white">Referrer Sources &amp; Devices</h2>
          <div className="space-y-2.5">
            {(pagesData?.referrers || []).map((ref, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#05081D] border border-white/10 text-xs"
              >
                <span className="text-white font-medium">{ref.source}</span>
                <span className="font-mono text-[#00D9FF] tabular-nums">{ref.visits} visits</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-3">
            {deviceData.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#05081D] text-center">
                <div className="font-mono font-bold text-lg text-white tabular-nums">
                  {d.count}
                </div>
                <div className="text-[11px] text-[#B5BCD9] capitalize">{d.device}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cosmic-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-white">Project Case Study Views</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(pagesData?.projectViews || []).map((p) => (
            <div
              key={p._id}
              className="p-4 rounded-xl bg-[#05081D] border border-white/10 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">{p.title}</div>
                <div className="text-[11px] text-[#B5BCD9]">{p.category}</div>
              </div>
              <span className="font-mono text-sm font-bold text-[#00E69A] tabular-nums">
                {p.views}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. ADMIN PROFILE & PASSWORD SECURITY PAGE
// ============================================================================
export const AdminProfilePage: React.FC = () => {
  const { admin, refreshAdmin } = useAuth();
  const { showToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    avatar: admin?.avatar || '',
    bio: admin?.bio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeFormSchema),
  });

  useEffect(() => {
    if (admin) {
      setProfileForm({
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        bio: admin.bio,
      });
    }
  }, [admin]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiClient.put('/auth/me', profileForm);
      await refreshAdmin();
      showToast('Administrator profile updated!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (values: PasswordChangeFormValues) => {
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      showToast('Password updated securely!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Admin Profile &amp; Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Update administrator account details and rotate your bcrypt-hashed password.
        </p>
      </div>

      <form onSubmit={handleProfileSave} className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-5">
        <h2 className="font-display font-bold text-lg text-white">Account Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Login Email</label>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <ImageUploaderField
          label="Admin Avatar"
          value={profileForm.avatar}
          onChange={(url) => setProfileForm({ ...profileForm, avatar: url })}
        />

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Role Bio</label>
          <input
            type="text"
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{savingProfile ? 'Saving...' : 'Update Profile'}</span>
        </button>
      </form>

      <form
        onSubmit={handleSubmit(handlePasswordChange)}
        className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-4"
        noValidate
      >
        <div className="flex items-center gap-2 text-white font-display font-bold text-lg">
          <Lock className="w-5 h-5 text-[#00D9FF]" />
          <h2>Change Administrator Password</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Current Password
            </label>
            <input
              type="password"
              {...register('currentPassword')}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-xs text-white"
            />
            {errors.currentPassword && (
              <p className="text-[11px] text-rose-400 mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register('newPassword')}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-xs text-white"
            />
            {errors.newPassword && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-xs text-white"
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-neon-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
        >
          {isSubmitting ? 'Updating Password...' : 'Rotate Password'}
        </button>
      </form>
    </div>
  );
};
