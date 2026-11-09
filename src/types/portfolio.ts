export type ProjectCategory =
  | 'E-Commerce'
  | 'SaaS'
  | 'Web Apps'
  | 'Dashboards'
  | 'Business';

export interface ProjectItem {
  _id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  shortDescription: string;
  overview: string;
  thumbnail: string;
  screenshots: string[];
  technologies: string[];
  features: string[];
  challenges: string;
  solutions: string;
  results: string;
  liveUrl: string;
  caseStudyUrl: string;
  githubUrl: string;
  featured: boolean;
  published: boolean;
  order: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  deliverables: string[];
  startingPrice: string;
  timelineEstimate: string;
  ctaText: string;
  ctaLink: string;
  featured: boolean;
  published: boolean;
  order: number;
}

export interface WhyChooseItem {
  title: string;
  description: string;
  icon: string;
}

export interface WorkflowStep {
  stepNumber: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutData {
  _id?: string;
  badgeText: string;
  headline: string;
  developerName: string;
  subtitle: string;
  biography: string;
  extendedBio: string;
  profileImage: string;
  cvFileUrl: string;
  trustText: string;
  experienceYears: string;
  projectsDelivered: string;
  happyClients: string;
  clientSatisfaction: string;
  whyChooseMe: WhyChooseItem[];
  workflowSteps: WorkflowStep[];
}

export interface TimelineMilestone {
  _id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'education' | 'career' | 'milestone';
  order: number;
  published: boolean;
}

export interface TestimonialItem {
  _id: string;
  clientName: string;
  clientImage: string;
  company: string;
  position: string;
  review: string;
  rating: number;
  featured: boolean;
  published: boolean;
  order: number;
}

export interface SkillItem {
  _id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Tools';
  icon: string;
  proficiency: number;
  description: string;
  order: number;
  visible: boolean;
}

export type MessageStatus = 'New' | 'Read' | 'Replied' | 'Archived';

export interface ContactMessageItem {
  _id: string;
  fullName: string;
  email: string;
  service: string;
  subject: string;
  message: string;
  status: MessageStatus;
  replyBody?: string;
  repliedAt?: string;
  emailDelivered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
}

export interface PricingPackageItem {
  _id: string;
  packageName: string;
  audienceLabel: string;
  price: string;
  currency: string;
  billingType: 'One-Time' | 'Monthly' | 'Custom';
  description: string;
  features: string[];
  featured: boolean;
  ctaText: string;
  ctaLink: string;
  order: number;
  visible: boolean;
}

export interface SocialLinkItem {
  _id?: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  order: number;
  visible: boolean;
}

export interface SiteSettingsData {
  _id?: string;
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
  socialLinks: SocialLinkItem[];
  footer?: {
    tagline?: string;
    description?: string;
    appDownload?: {
      enabled?: boolean;
      title?: string;
      subtitle?: string;
      playStoreUrl?: string;
      appStoreUrl?: string;
      showBadges?: boolean;
    };
    newsletter?: {
      badgeText?: string;
      headline?: string;
      description?: string;
      buttonText?: string;
    };
    trustStrip?: {
      visible?: boolean;
      items?: Array<{
        icon: string;
        title: string;
        description: string;
        visible: boolean;
        order: number;
      }>;
    };
    showWaves?: boolean;
    showSkyline?: boolean;
  };
}

export interface NewsletterSubscriberItem {
  _id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  source?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor';
  avatar: string;
  bio: string;
  twoFactorNote: string;
  lastLoginAt?: string;
}

export interface AnalyticsOverviewData {
  cards: {
    totalProjects: number;
    publishedProjects: number;
    totalServices: number;
    totalMessages: number;
    unreadMessages: number;
    totalVisitors: number;
    totalPageViews: number;
    clientRating: number;
  };
  days: number;
  chartSeries: Array<{
    date: string;
    label: string;
    pageViews: number;
    visitors: number;
    inquiries: number;
  }>;
  recentMessages: ContactMessageItem[];
  topProjects: ProjectItem[];
  systemStatus: {
    environment: string;
    apiVersion: string;
    uptimeSeconds: number;
    database: {
      connected: boolean;
      state: string;
      mode: string;
      configuredExternalUri: boolean;
      databaseName: string;
      lastError: string | null;
    };
    storage: {
      provider: string;
      cloudinaryConfigured: boolean;
      storedAssetsCount: number;
    };
    email: {
      smtpConfigured: boolean;
      statusLabel: string;
    };
    security: {
      jwtAuth: boolean;
      rateLimiting: boolean;
      helmetHeaders: boolean;
    };
  };
}

export interface MediaAssetItem {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  provider: 'local' | 'cloudinary';
  createdAt: string;
}
