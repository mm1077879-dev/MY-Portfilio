import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  _id?: mongoose.Types.ObjectId;
  platform: string;
  label: string;
  url: string;
  icon: string;
  order: number;
  visible: boolean;
}

export interface ISiteSettings extends Document {
  siteTitle: string;
  logoText: string;
  logoUrl: string;
  faviconUrl: string;
  developerName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  mapEmbedUrl: string;
  workingHours: string;
  footerTagline: string;
  copyrightText: string;
  builtWithText: string;
  defaultLanguage: string;
  banner: {
    visible: boolean;
    availabilityText: string;
    availabilityActive: boolean;
    headlineLine1: string;
    headlineLine2: string;
    subtitle: string;
    profileImage: string;
    backgroundStyle: string;
    primaryCtaLabel: string;
    primaryCtaLink: string;
    secondaryCtaLabel: string;
    secondaryCtaLink: string;
    techStackLine: string;
    floatingQuoteTop: string;
    floatingQuoteBottom: string;
  };
  stats: {
    happyClients: string;
    projectsDelivered: string;
    clientRating: string;
    experienceYears: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: string;
    canonicalUrl: string;
    robots: string;
    twitterHandle: string;
  };
  socialLinks: ISocialLink[];
  footer: {
    tagline: string;
    description: string;
    appDownload: {
      enabled: boolean;
      title: string;
      subtitle: string;
      playStoreUrl: string;
      appStoreUrl: string;
      showBadges: boolean;
    };
    newsletter: {
      badgeText: string;
      headline: string;
      description: string;
      buttonText: string;
    };
    trustStrip: {
      visible: boolean;
      items: Array<{
        icon: string;
        title: string;
        description: string;
        visible: boolean;
        order: number;
      }>;
    };
    showWaves: boolean;
    showSkyline: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSubSchema = new Schema<ISocialLink>({
  platform: { type: String, required: true },
  label: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, default: 'Globe' },
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
});

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteTitle: { type: String, default: 'Mahim Dev — Full-Stack Developer Portfolio' },
    logoText: { type: String, default: 'Mahim Dev' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '/favicon.svg' },
    developerName: { type: String, default: 'Mahim Dev' },
    professionalTitle: { type: String, default: 'Full-Stack Developer' },
    email: { type: String, default: 'hello@mahimdev.com' },
    phone: { type: String, default: '+1 (555) 234-8910' },
    whatsapp: { type: String, default: 'https://wa.me/15552348910' },
    location: { type: String, default: 'Dhaka, Bangladesh · Remote Worldwide' },
    mapEmbedUrl: {
      type: String,
      default:
        'https://www.openstreetmap.org/export/embed.html?bbox=90.34%2C23.72%2C90.46%2C23.84&layer=mapnik',
    },
    workingHours: { type: String, default: 'Mon – Sat · 9:00 AM – 8:00 PM (GMT+6)' },
    footerTagline: {
      type: String,
      default: 'Building high-performance digital products for ambitious teams.',
    },
    copyrightText: { type: String, default: '© 2025 Mahim Dev. All rights reserved.' },
    builtWithText: { type: String, default: 'Built with love for a better web.' },
    defaultLanguage: { type: String, default: 'en' },
    banner: {
      visible: { type: Boolean, default: true },
      availabilityText: { type: String, default: 'Available for new projects' },
      availabilityActive: { type: Boolean, default: true },
      headlineLine1: { type: String, default: 'Build Something' },
      headlineLine2: { type: String, default: 'Extraordinary' },
      subtitle: {
        type: String,
        default:
          "I'm Mahim, a Full-Stack Developer specializing in high-performance web apps and eCommerce platforms. Let's turn your ideas into powerful digital products.",
      },
      profileImage: {
        type: String,
        default: '/src/assets/images/hero_developer_portrait_1793526368603.jpg',
      },
      backgroundStyle: { type: String, default: 'cosmic-neon' },
      primaryCtaLabel: { type: String, default: "Let's Work Together" },
      primaryCtaLink: { type: String, default: '/contact' },
      secondaryCtaLabel: { type: String, default: 'Explore My Work' },
      secondaryCtaLink: { type: String, default: '/projects' },
      techStackLine: {
        type: String,
        default:
          'Full-Stack Development — JavaScript, TypeScript, Next.js, Node, PostgreSQL, MongoDB',
      },
      floatingQuoteTop: { type: String, default: 'Dream Big' },
      floatingQuoteBottom: { type: String, default: 'Build Better' },
    },
    stats: {
      happyClients: { type: String, default: '50+' },
      projectsDelivered: { type: String, default: '100+' },
      clientRating: { type: String, default: '5.0' },
      experienceYears: { type: String, default: '2+ Years' },
    },
    seo: {
      metaTitle: {
        type: String,
        default: 'Mahim Dev — Full-Stack Developer Portfolio & CMS',
      },
      metaDescription: {
        type: String,
        default:
          'Full-Stack Developer specializing in high-performance web apps, SaaS applications, custom admin dashboards, and modern eCommerce platforms.',
      },
      keywords: {
        type: [String],
        default: [
          'Mahim Dev',
          'Full-Stack Developer',
          'React',
          'TypeScript',
          'Next.js',
          'Node.js',
          'MongoDB',
          'SaaS Development',
        ],
      },
      ogImage: {
        type: String,
        default: '/src/assets/images/hero_developer_portrait_1793526368603.jpg',
      },
      canonicalUrl: { type: String, default: '' },
      robots: { type: String, default: 'index, follow' },
      twitterHandle: { type: String, default: '@mahimdev' },
    },
    socialLinks: { type: [SocialLinkSubSchema], default: [] },
    footer: {
      tagline: {
        type: String,
        default: 'Building high-performance digital products for ambitious teams.',
      },
      description: {
        type: String,
        default:
          'Full-Stack Developer crafting scalable web applications, SaaS platforms, eCommerce ecosystems, and custom administrative solutions with modern architectures.',
      },
      appDownload: {
        enabled: { type: Boolean, default: true },
        title: { type: String, default: 'Experience on Mobile' },
        subtitle: { type: String, default: 'Web app optimized for iOS & Android devices' },
        playStoreUrl: { type: String, default: 'https://play.google.com/store' },
        appStoreUrl: { type: String, default: 'https://www.apple.com/app-store/' },
        showBadges: { type: Boolean, default: true },
      },
      newsletter: {
        badgeText: { type: String, default: 'Newsletter' },
        headline: { type: String, default: 'Get the latest updates!' },
        description: {
          type: String,
          default:
            'Subscribe to receive monthly tech insights, project launches, and web architecture tutorials.',
        },
        buttonText: { type: String, default: 'Subscribe' },
      },
      trustStrip: {
        visible: { type: Boolean, default: true },
        items: {
          type: [
            {
              icon: { type: String, default: 'ShieldCheck' },
              title: { type: String, default: 'Security-Minded Architecture' },
              description: { type: String, default: 'Audited code safety & modern security standards' },
              visible: { type: Boolean, default: true },
              order: { type: Number, default: 1 },
            },
          ],
          default: [
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
          ],
        },
      },
      showWaves: { type: Boolean, default: true },
      showSkyline: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const SiteSettings =
  (mongoose.models.SiteSettings as mongoose.Model<ISiteSettings>) ||
  mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
