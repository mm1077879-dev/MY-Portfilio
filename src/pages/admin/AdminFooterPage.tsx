import React, { useEffect, useState } from 'react';
import {
  Save,
  Smartphone,
  Mail,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Layers,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { apiClient, extractApiErrorMessage } from '../../services/api';

interface TrustItemState {
  icon: string;
  title: string;
  description: string;
  visible: boolean;
  order: number;
}

export const AdminFooterPage: React.FC = () => {
  const { settings, refreshSettings } = useSiteSettings();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form State
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  // App Download Settings
  const [appEnabled, setAppEnabled] = useState(true);
  const [appTitle, setAppTitle] = useState('Experience on Mobile');
  const [appSubtitle, setAppSubtitle] = useState('Web app optimized for iOS & Android devices');
  const [playStoreUrl, setPlayStoreUrl] = useState('https://play.google.com/store');
  const [appStoreUrl, setAppStoreUrl] = useState('https://www.apple.com/app-store/');
  const [appShowBadges, setAppShowBadges] = useState(true);

  // Newsletter Settings
  const [newsBadge, setNewsBadge] = useState('Newsletter');
  const [newsHeadline, setNewsHeadline] = useState('Get the latest updates!');
  const [newsDescription, setNewsDescription] = useState(
    'Subscribe to receive monthly tech insights, project launches, and web architecture tutorials.'
  );
  const [newsButtonText, setNewsButtonText] = useState('Subscribe');

  // Decorative Visuals
  const [showWaves, setShowWaves] = useState(true);
  const [showSkyline, setShowSkyline] = useState(true);

  // Trust Strip Items
  const [trustVisible, setTrustVisible] = useState(true);
  const [trustItems, setTrustItems] = useState<TrustItemState[]>([
    {
      icon: 'ShieldCheck',
      title: 'Security-Minded Architecture',
      description: 'Audited code safety & modern security standards',
      visible: true,
      order: 1,
    },
    {
      icon: 'Zap',
      title: 'High Performance',
      description: 'Optimized speed & sub-second page loads',
      visible: true,
      order: 2,
    },
    {
      icon: 'Sparkles',
      title: 'Premium Craft',
      description: 'Pixel-perfect UI & maintainable codebases',
      visible: true,
      order: 3,
    },
    {
      icon: 'Award',
      title: 'Verified Delivery',
      description: 'Direct partnership & reliable execution',
      visible: true,
      order: 4,
    },
  ]);

  useEffect(() => {
    if (settings?.footer) {
      const f = settings.footer;
      setTagline(f.tagline || settings.footerTagline || '');
      setDescription(
        f.description ||
          'Full-Stack Developer crafting scalable web applications, SaaS platforms, eCommerce ecosystems, and custom administrative solutions with modern architectures.'
      );

      if (f.appDownload) {
        setAppEnabled(f.appDownload.enabled ?? true);
        setAppTitle(f.appDownload.title || 'Experience on Mobile');
        setAppSubtitle(f.appDownload.subtitle || 'Web app optimized for iOS & Android devices');
        setPlayStoreUrl(f.appDownload.playStoreUrl || 'https://play.google.com/store');
        setAppStoreUrl(f.appDownload.appStoreUrl || 'https://www.apple.com/app-store/');
        setAppShowBadges(f.appDownload.showBadges ?? true);
      }

      if (f.newsletter) {
        setNewsBadge(f.newsletter.badgeText || 'Newsletter');
        setNewsHeadline(f.newsletter.headline || 'Get the latest updates!');
        setNewsDescription(
          f.newsletter.description ||
            'Subscribe to receive monthly tech insights, project launches, and web architecture tutorials.'
        );
        setNewsButtonText(f.newsletter.buttonText || 'Subscribe');
      }

      if (f.trustStrip) {
        setTrustVisible(f.trustStrip.visible ?? true);
        if (f.trustStrip.items && f.trustStrip.items.length > 0) {
          setTrustItems(
            f.trustStrip.items.map((it, idx) => ({
              icon: it.icon || 'ShieldCheck',
              title: it.title,
              description: it.description,
              visible: it.visible ?? true,
              order: it.order ?? idx + 1,
            }))
          );
        }
      }

      setShowWaves(f.showWaves ?? true);
      setShowSkyline(f.showSkyline ?? true);
    }
  }, [settings]);

  const handleTrustItemChange = (
    index: number,
    field: keyof TrustItemState,
    value: string | boolean | number
  ) => {
    setTrustItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/settings', {
        footerTagline: tagline,
        footer: {
          tagline,
          description,
          appDownload: {
            enabled: appEnabled,
            title: appTitle,
            subtitle: appSubtitle,
            playStoreUrl,
            appStoreUrl,
            showBadges: appShowBadges,
          },
          newsletter: {
            badgeText: newsBadge,
            headline: newsHeadline,
            description: newsDescription,
            buttonText: newsButtonText,
          },
          trustStrip: {
            visible: trustVisible,
            items: trustItems,
          },
          showWaves,
          showSkyline,
        },
      });

      await refreshSettings();
      showToast('Footer & Trust Strip settings saved to database successfully!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to save footer settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Footer & Trust Strip Management
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Customize brand description, app download panel, newsletter copy, 4-item trust strip, and decorative visual effects saved directly to MongoDB.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Brand Profile in Footer */}
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <Layers className="w-5 h-5 text-[#8B19FF]" />
            <h2 className="font-display font-bold text-lg text-white">
              1. Brand Profile & Tagline
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                Footer Tagline / Architectural Focus
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Building high-performance digital products for ambitious teams."
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B19FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                Brand Description Paragraph
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full-Stack Developer crafting scalable web applications, SaaS platforms, eCommerce ecosystems..."
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B19FF]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: App Download Card */}
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#00D9FF]" />
              <h2 className="font-display font-bold text-lg text-white">
                2. App Download Card Settings
              </h2>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input
                type="checkbox"
                checked={appEnabled}
                onChange={(e) => setAppEnabled(e.target.checked)}
                className="rounded border-white/20 text-[#8B19FF] focus:ring-0"
              />
              <span>Enable Card</span>
            </label>
          </div>

          {appEnabled && (
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Card Title</label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Card Subtitle</label>
                <input
                  type="text"
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Google Play Store URL
                </label>
                <input
                  type="text"
                  value={playStoreUrl}
                  onChange={(e) => setPlayStoreUrl(e.target.value)}
                  placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white font-mono text-xs"
                />
                <span className="block text-[11px] text-[#B5BCD9] mt-1">
                  Provide a specific app package URL. Generic store homepages will display as &quot;PWA &amp; Mobile Ready&quot;.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Apple App Store URL
                </label>
                <input
                  type="text"
                  value={appStoreUrl}
                  onChange={(e) => setAppStoreUrl(e.target.value)}
                  placeholder="e.g. https://apps.apple.com/app/.../id..."
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white font-mono text-xs"
                />
                <span className="block text-[11px] text-[#B5BCD9] mt-1">
                  Provide a direct App Store listing URL. Generic homepages are omitted to prevent misleading visitors.
                </span>
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#B5BCD9]">
                  <input
                    type="checkbox"
                    checked={appShowBadges}
                    onChange={(e) => setAppShowBadges(e.target.checked)}
                    className="rounded border-white/20 text-[#8B19FF]"
                  />
                  <span>Display Google Play & App Store Action Badges</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Newsletter Settings */}
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <Mail className="w-5 h-5 text-[#087BFF]" />
            <h2 className="font-display font-bold text-lg text-white">
              3. Newsletter Copy & Call to Action
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                Pill Badge Text
              </label>
              <input
                type="text"
                value={newsBadge}
                onChange={(e) => setNewsBadge(e.target.value)}
                placeholder="Newsletter"
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                Headline Text
              </label>
              <input
                type="text"
                value={newsHeadline}
                onChange={(e) => setNewsHeadline(e.target.value)}
                placeholder="Get the latest updates!"
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                Description / Value Proposition
              </label>
              <textarea
                rows={2}
                value={newsDescription}
                onChange={(e) => setNewsDescription(e.target.value)}
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                Subscribe Button Label
              </label>
              <input
                type="text"
                value={newsButtonText}
                onChange={(e) => setNewsButtonText(e.target.value)}
                placeholder="Subscribe"
                className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Trust & Features Strip */}
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#00E69A]" />
              <h2 className="font-display font-bold text-lg text-white">
                4. Trust & Features Strip (4-Item Banner)
              </h2>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input
                type="checkbox"
                checked={trustVisible}
                onChange={(e) => setTrustVisible(e.target.checked)}
                className="rounded border-white/20 text-[#8B19FF]"
              />
              <span>Show Strip on Footer</span>
            </label>
          </div>

          {trustVisible && (
            <div className="space-y-4">
              {trustItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#05081D] border border-white/10 p-4 grid sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#B5BCD9] mb-1">
                      Icon ({idx + 1})
                    </label>
                    <select
                      value={item.icon}
                      onChange={(e) => handleTrustItemChange(idx, 'icon', e.target.value)}
                      className="w-full rounded-xl bg-[#070B24] border border-white/15 px-3 py-1.5 text-xs text-white"
                    >
                      <option value="ShieldCheck">ShieldCheck (Security)</option>
                      <option value="Zap">Zap (Performance)</option>
                      <option value="Sparkles">Sparkles (Quality/Craft)</option>
                      <option value="Award">Award (Delivery/Trust)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-[#B5BCD9] mb-1">
                      Heading Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleTrustItemChange(idx, 'title', e.target.value)}
                      className="w-full rounded-xl bg-[#070B24] border border-white/15 px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-[#B5BCD9] mb-1">
                      Supporting Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleTrustItemChange(idx, 'description', e.target.value)}
                      className="w-full rounded-xl bg-[#070B24] border border-white/15 px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleTrustItemChange(idx, 'visible', !item.visible)}
                      aria-label="Toggle Item Visibility"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.visible
                          ? 'border-[#00E69A]/40 text-[#00E69A] bg-[#00E69A]/10'
                          : 'border-white/15 text-[#B5BCD9] bg-white/5'
                      }`}
                    >
                      {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Decorative Visual Toggles */}
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <Sparkles className="w-5 h-5 text-[#D000FF]" />
            <h2 className="font-display font-bold text-lg text-white">
              5. Decorative Visual Atmosphere Toggles
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#05081D] border border-white/10 cursor-pointer hover:border-[#8B19FF]/40 transition-colors">
              <input
                type="checkbox"
                checked={showWaves}
                onChange={(e) => setShowWaves(e.target.checked)}
                className="mt-1 rounded border-white/20 text-[#8B19FF]"
              />
              <div className="space-y-0.5">
                <span className="block text-sm font-semibold text-white">
                  Top Decorative Neon Waves
                </span>
                <span className="block text-xs text-[#B5BCD9]">
                  Flowing purple-to-blue gradient waves at the top boundary of the footer.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#05081D] border border-white/10 cursor-pointer hover:border-[#8B19FF]/40 transition-colors">
              <input
                type="checkbox"
                checked={showSkyline}
                onChange={(e) => setShowSkyline(e.target.checked)}
                className="mt-1 rounded border-white/20 text-[#8B19FF]"
              />
              <div className="space-y-0.5">
                <span className="block text-sm font-semibold text-white">
                  Futuristic City Skyline Silhouette
                </span>
                <span className="block text-xs text-[#B5BCD9]">
                  Illuminated neon skyscrapers positioned non-obstructively in the right section.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-neon-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to Database...' : 'Save Footer Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
