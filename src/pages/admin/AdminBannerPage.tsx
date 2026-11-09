import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useSiteSettings } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { ImageUploaderField } from '../../components/common/ImageUploaderField';

export const AdminBannerPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    visible: true,
    availabilityText: 'Available for new projects',
    availabilityActive: true,
    headlineLine1: 'Build Something',
    headlineLine2: 'Extraordinary',
    subtitle: '',
    profileImage: '',
    backgroundStyle: 'cosmic-neon',
    primaryCtaLabel: "Let's Work Together",
    primaryCtaLink: '/contact',
    secondaryCtaLabel: 'Explore My Work',
    secondaryCtaLink: '/projects',
    techStackLine: '',
    floatingQuoteTop: 'Dream Big',
    floatingQuoteBottom: 'Build Better',
  });

  useEffect(() => {
    if (settings?.banner) {
      setForm({
        visible: settings.banner.visible ?? true,
        availabilityText: settings.banner.availabilityText || '',
        availabilityActive: settings.banner.availabilityActive ?? true,
        headlineLine1: settings.banner.headlineLine1 || '',
        headlineLine2: settings.banner.headlineLine2 || '',
        subtitle: settings.banner.subtitle || '',
        profileImage: settings.banner.profileImage || '',
        backgroundStyle: settings.banner.backgroundStyle || 'cosmic-neon',
        primaryCtaLabel: settings.banner.primaryCtaLabel || '',
        primaryCtaLink: settings.banner.primaryCtaLink || '',
        secondaryCtaLabel: settings.banner.secondaryCtaLabel || '',
        secondaryCtaLink: settings.banner.secondaryCtaLink || '',
        techStackLine: settings.banner.techStackLine || '',
        floatingQuoteTop: settings.banner.floatingQuoteTop || '',
        floatingQuoteBottom: settings.banner.floatingQuoteBottom || '',
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/settings', { banner: form });
      await refreshSettings();
      showToast('Homepage Hero Banner updated live!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to save banner.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Update Homepage Hero Banner
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Customize headline lines, developer portrait, availability indicator, and CTA buttons. Changes reflect immediately on the public homepage.
        </p>
      </div>

      <form onSubmit={handleSave} className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-white/10">
          <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="w-4 h-4 accent-[#8B19FF]"
            />
            <span>Display Hero Banner on Homepage</span>
          </label>

          <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.availabilityActive}
              onChange={(e) =>
                setForm({ ...form, availabilityActive: e.target.checked })
              }
              className="w-4 h-4 accent-[#00E69A]"
            />
            <span>Available for New Projects Status</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="banner-h1" className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Headline Line 1 (Primary White)
            </label>
            <input
              id="banner-h1"
              type="text"
              value={form.headlineLine1}
              onChange={(e) => setForm({ ...form, headlineLine1: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label htmlFor="banner-h2" className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Headline Line 2 (Neon Gradient)
            </label>
            <input
              id="banner-h2"
              type="text"
              value={form.headlineLine2}
              onChange={(e) => setForm({ ...form, headlineLine2: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="banner-avail" className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Availability Text
            </label>
            <input
              id="banner-avail"
              type="text"
              value={form.availabilityText}
              onChange={(e) => setForm({ ...form, availabilityText: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label htmlFor="banner-bg" className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Background Lighting Theme
            </label>
            <select
              id="banner-bg"
              value={form.backgroundStyle}
              onChange={(e) => setForm({ ...form, backgroundStyle: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            >
              <option value="cosmic-neon">Cosmic Purple &amp; Electric Blue</option>
              <option value="deep-cyber">Deep Cyber Navy</option>
              <option value="minimal-glow">Minimal Studio Glow</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="banner-sub" className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
            Hero Introduction Subtitle
          </label>
          <textarea
            id="banner-sub"
            rows={3}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <ImageUploaderField
          label="Hero Developer Portrait Image"
          value={form.profileImage}
          onChange={(url) => setForm({ ...form, profileImage: url })}
          helperText="Upload JPG, PNG, or WEBP up to 8 MB, or paste an asset URL."
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Primary CTA Label
            </label>
            <input
              type="text"
              value={form.primaryCtaLabel}
              onChange={(e) => setForm({ ...form, primaryCtaLabel: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Primary CTA Link
            </label>
            <input
              type="text"
              value={form.primaryCtaLink}
              onChange={(e) => setForm({ ...form, primaryCtaLink: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Secondary CTA Label
            </label>
            <input
              type="text"
              value={form.secondaryCtaLabel}
              onChange={(e) => setForm({ ...form, secondaryCtaLabel: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Secondary CTA Link
            </label>
            <input
              type="text"
              value={form.secondaryCtaLink}
              onChange={(e) => setForm({ ...form, secondaryCtaLink: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
            Tech Stack Summary Strip
          </label>
          <input
            type="text"
            value={form.techStackLine}
            onChange={(e) => setForm({ ...form, techStackLine: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Portrait Quote Line 1
            </label>
            <input
              type="text"
              value={form.floatingQuoteTop}
              onChange={(e) => setForm({ ...form, floatingQuoteTop: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
              Portrait Quote Line 2
            </label>
            <input
              type="text"
              value={form.floatingQuoteBottom}
              onChange={(e) =>
                setForm({ ...form, floatingQuoteBottom: e.target.value })
              }
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Banner...' : 'Save Banner Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
