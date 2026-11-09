import { z } from 'zod';
import { isSafeUrlOrPath, isSafeHttpsEmbedUrl } from '../utils/sanitize';

export const safeUrlOrPathSchema = z
  .string()
  .max(1000)
  .refine(
    isSafeUrlOrPath,
    'URL must be a relative path (/...) or use http://, https://, mailto:, or tel:'
  );

export const safeEmbedUrlSchema = z
  .string()
  .max(800)
  .refine(isSafeHttpsEmbedUrl, 'Map embed URL must be empty or use https://');

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const adminProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Valid email is required'),
  avatar: safeUrlOrPathSchema.optional(),
  bio: z.string().max(500).optional(),
  twoFactorNote: z.string().max(200).optional(),
});

export const projectCategories = [
  'E-Commerce',
  'SaaS',
  'Web Apps',
  'Dashboards',
  'Business',
] as const;

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required').max(120),
  slug: z.string().optional(),
  category: z.enum(projectCategories),
  shortDescription: z.string().min(10, 'Short description is required').max(280),
  overview: z.string().optional().default(''),
  thumbnail: z
    .string()
    .min(1, 'Project thumbnail is required')
    .refine(isSafeUrlOrPath, 'Project thumbnail must be a valid path or http/https URL'),
  screenshots: z.array(safeUrlOrPathSchema).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  challenges: z.string().optional().default(''),
  solutions: z.string().optional().default(''),
  results: z.string().optional().default(''),
  liveUrl: safeUrlOrPathSchema.optional().default(''),
  caseStudyUrl: safeUrlOrPathSchema.optional().default(''),
  githubUrl: safeUrlOrPathSchema.optional().default(''),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const projectUpdateSchema = z.object({
  title: z.string().min(2, 'Project title is required').max(120).optional(),
  slug: z.string().optional(),
  category: z.enum(projectCategories).optional(),
  shortDescription: z.string().min(10, 'Short description is required').max(280).optional(),
  overview: z.string().optional(),
  thumbnail: z
    .string()
    .min(1, 'Project thumbnail is required')
    .refine(isSafeUrlOrPath, 'Project thumbnail must be a valid path or http/https URL')
    .optional(),
  screenshots: z.array(safeUrlOrPathSchema).optional(),
  technologies: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  challenges: z.string().optional(),
  solutions: z.string().optional(),
  results: z.string().optional(),
  liveUrl: safeUrlOrPathSchema.optional(),
  caseStudyUrl: safeUrlOrPathSchema.optional(),
  githubUrl: safeUrlOrPathSchema.optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(2, 'Service title is required').max(120),
  slug: z.string().optional(),
  icon: z.string().min(1, 'Icon name is required'),
  image: safeUrlOrPathSchema.optional().default(''),
  shortDescription: z.string().min(10, 'Short description is required').max(260),
  fullDescription: z.string().optional().default(''),
  features: z.array(z.string()).optional().default([]),
  deliverables: z.array(z.string()).optional().default([]),
  startingPrice: z.string().optional().default(''),
  timelineEstimate: z.string().optional().default(''),
  ctaText: z.string().optional().default('Learn More'),
  ctaLink: safeUrlOrPathSchema.optional().default('/contact'),
  featured: z.boolean().optional().default(true),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const serviceUpdateSchema = z.object({
  title: z.string().min(2, 'Service title is required').max(120).optional(),
  slug: z.string().optional(),
  icon: z.string().min(1, 'Icon name is required').optional(),
  image: safeUrlOrPathSchema.optional(),
  shortDescription: z.string().min(10, 'Short description is required').max(260).optional(),
  fullDescription: z.string().optional(),
  features: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  startingPrice: z.string().optional(),
  timelineEstimate: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: safeUrlOrPathSchema.optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const timelineItemSchema = z.object({
  year: z.string().min(2, 'Year is required').max(30),
  title: z.string().min(2, 'Milestone title is required').max(140),
  subtitle: z.string().optional().default(''),
  description: z.string().min(5, 'Description is required').max(500),
  category: z.enum(['education', 'career', 'milestone']).optional().default('milestone'),
  order: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const timelineItemUpdateSchema = z.object({
  year: z.string().min(2, 'Year is required').max(30).optional(),
  title: z.string().min(2, 'Milestone title is required').max(140).optional(),
  subtitle: z.string().optional(),
  description: z.string().min(5, 'Description is required').max(500).optional(),
  category: z.enum(['education', 'career', 'milestone']).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const aboutUpdateSchema = z.object({
  badgeText: z.string().min(2).max(60).optional(),
  headline: z.string().min(2).max(140).optional(),
  developerName: z.string().min(2).max(80).optional(),
  subtitle: z.string().min(2).max(160).optional(),
  biography: z.string().min(10).max(2500).optional(),
  extendedBio: z.string().max(3000).optional(),
  profileImage: safeUrlOrPathSchema.optional(),
  cvFileUrl: safeUrlOrPathSchema.optional(),
  trustText: z.string().max(240).optional(),
  experienceYears: z.string().max(40).optional(),
  projectsDelivered: z.string().max(40).optional(),
  happyClients: z.string().max(40).optional(),
  clientSatisfaction: z.string().max(40).optional(),
  whyChooseMe: z
    .array(
      z.object({
        title: z.string().min(2),
        description: z.string().min(4),
        icon: z.string().default('Zap'),
      })
    )
    .optional(),
  workflowSteps: z
    .array(
      z.object({
        stepNumber: z.string().min(1),
        title: z.string().min(2),
        description: z.string().min(4),
        icon: z.string().default('Sparkles'),
      })
    )
    .optional(),
});

export const testimonialSchema = z.object({
  clientName: z.string().min(2, 'Client name is required').max(100),
  clientImage: safeUrlOrPathSchema.optional().default(''),
  company: z.string().min(1, 'Company is required').max(100),
  position: z.string().min(1, 'Position is required').max(100),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  rating: z.number().min(1).max(5).default(5),
  featured: z.boolean().optional().default(true),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const testimonialUpdateSchema = z.object({
  clientName: z.string().min(2, 'Client name is required').max(100).optional(),
  clientImage: safeUrlOrPathSchema.optional(),
  company: z.string().min(1, 'Company is required').max(100).optional(),
  position: z.string().min(1, 'Position is required').max(100).optional(),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(80),
  category: z.enum(['Frontend', 'Backend', 'Database', 'DevOps & Tools']),
  icon: z.string().default('Code2'),
  proficiency: z.number().min(1).max(100),
  description: z.string().max(220).optional().default(''),
  order: z.number().int().optional().default(0),
  visible: z.boolean().optional().default(true),
});

export const skillUpdateSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(80).optional(),
  category: z.enum(['Frontend', 'Backend', 'Database', 'DevOps & Tools']).optional(),
  icon: z.string().optional(),
  proficiency: z.number().min(1).max(100).optional(),
  description: z.string().max(220).optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export const contactMessageCreateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  service: z.string().optional().default('General Inquiry'),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(160),
  message: z.string().min(10, 'Message must be at least 10 characters').max(4000),
  honeypot: z.string().max(0, 'Bot submission rejected').optional().default(''),
});

export const messageAdminUpdateSchema = z.object({
  status: z.enum(['New', 'Read', 'Replied', 'Archived']).optional(),
  replyBody: z.string().max(4000).optional(),
  sendEmailReply: z.boolean().optional().default(false),
});

export const faqSchema = z.object({
  question: z.string().min(5, 'Question is required').max(260),
  answer: z.string().min(10, 'Answer is required').max(2000),
  category: z.string().default('General'),
  order: z.number().int().optional().default(0),
  visible: z.boolean().optional().default(true),
});

export const faqUpdateSchema = z.object({
  question: z.string().min(5, 'Question is required').max(260).optional(),
  answer: z.string().min(10, 'Answer is required').max(2000).optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export const pricingSchema = z.object({
  packageName: z.string().min(2, 'Package name is required').max(80),
  audienceLabel: z.string().max(120).optional().default('For growing businesses'),
  price: z.string().min(1, 'Price is required').max(50),
  currency: z.string().default('USD'),
  billingType: z.enum(['One-Time', 'Monthly', 'Custom']).default('One-Time'),
  description: z.string().max(300).optional().default(''),
  features: z.array(z.string()).default([]),
  featured: z.boolean().optional().default(false),
  ctaText: z.string().default('Get Started'),
  ctaLink: safeUrlOrPathSchema.default('/contact'),
  order: z.number().int().optional().default(0),
  visible: z.boolean().optional().default(true),
});

export const pricingUpdateSchema = z.object({
  packageName: z.string().min(2, 'Package name is required').max(80).optional(),
  audienceLabel: z.string().max(120).optional(),
  price: z.string().min(1, 'Price is required').max(50).optional(),
  currency: z.string().optional(),
  billingType: z.enum(['One-Time', 'Monthly', 'Custom']).optional(),
  description: z.string().max(300).optional(),
  features: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  ctaText: z.string().optional(),
  ctaLink: safeUrlOrPathSchema.optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export const socialLinkItemSchema = z.object({
  _id: z.string().optional(),
  platform: z.string().min(1),
  label: z.string().min(1),
  url: z
    .string()
    .min(1)
    .refine(isSafeUrlOrPath, 'Social link URL must be a safe http/https/mailto/tel link'),
  icon: z.string().default('Globe'),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const siteSettingsUpdateSchema = z.object({
  siteTitle: z.string().min(2).max(120).optional(),
  logoText: z.string().min(1).max(60).optional(),
  logoUrl: safeUrlOrPathSchema.optional(),
  faviconUrl: safeUrlOrPathSchema.optional(),
  developerName: z.string().min(2).max(80).optional(),
  professionalTitle: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(60).optional(),
  location: z.string().max(140).optional(),
  mapEmbedUrl: safeEmbedUrlSchema.optional(),
  workingHours: z.string().max(140).optional(),
  footerTagline: z.string().max(260).optional(),
  copyrightText: z.string().max(160).optional(),
  builtWithText: z.string().max(160).optional(),
  defaultLanguage: z.string().max(16).optional(),
  banner: z
    .object({
      visible: z.boolean().optional(),
      availabilityText: z.string().max(80).optional(),
      availabilityActive: z.boolean().optional(),
      headlineLine1: z.string().max(100).optional(),
      headlineLine2: z.string().max(100).optional(),
      subtitle: z.string().max(500).optional(),
      profileImage: safeUrlOrPathSchema.optional(),
      backgroundStyle: z.string().max(60).optional(),
      primaryCtaLabel: z.string().max(60).optional(),
      primaryCtaLink: safeUrlOrPathSchema.optional(),
      secondaryCtaLabel: z.string().max(60).optional(),
      secondaryCtaLink: safeUrlOrPathSchema.optional(),
      techStackLine: z.string().max(240).optional(),
      floatingQuoteTop: z.string().max(60).optional(),
      floatingQuoteBottom: z.string().max(60).optional(),
    })
    .optional(),
  stats: z
    .object({
      happyClients: z.string().max(30).optional(),
      projectsDelivered: z.string().max(30).optional(),
      clientRating: z.string().max(30).optional(),
      experienceYears: z.string().max(30).optional(),
    })
    .optional(),
  seo: z
    .object({
      metaTitle: z.string().max(120).optional(),
      metaDescription: z.string().max(320).optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: safeUrlOrPathSchema.optional(),
      canonicalUrl: safeUrlOrPathSchema.optional(),
      robots: z.string().max(80).optional(),
      twitterHandle: z.string().max(60).optional(),
    })
    .optional(),
  socialLinks: z.array(socialLinkItemSchema).optional(),
  footer: z
    .object({
      tagline: z.string().max(300).optional(),
      description: z.string().max(800).optional(),
      appDownload: z
        .object({
          enabled: z.boolean().optional(),
          title: z.string().max(100).optional(),
          subtitle: z.string().max(200).optional(),
          playStoreUrl: safeUrlOrPathSchema.optional(),
          appStoreUrl: safeUrlOrPathSchema.optional(),
          showBadges: z.boolean().optional(),
        })
        .optional(),
      newsletter: z
        .object({
          badgeText: z.string().max(60).optional(),
          headline: z.string().max(120).optional(),
          description: z.string().max(400).optional(),
          buttonText: z.string().max(40).optional(),
        })
        .optional(),
      trustStrip: z
        .object({
          visible: z.boolean().optional(),
          items: z
            .array(
              z.object({
                icon: z.string().default('ShieldCheck'),
                title: z.string().max(100),
                description: z.string().max(200),
                visible: z.boolean().default(true),
                order: z.number().int().default(1),
              })
            )
            .optional(),
        })
        .optional(),
      showWaves: z.boolean().optional(),
      showSkyline: z.boolean().optional(),
    })
    .optional(),
});

export const newsletterSubscriptionSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(120, 'Email address must not exceed 120 characters')
    .trim()
    .toLowerCase(),
  source: z.string().max(60).optional().default('footer_subscription'),
});

export const analyticsTrackSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1)
    .max(240)
    .refine((value) => value.startsWith('/'), {
      message: 'Analytics path must be a relative URL such as /, /projects, or /about.',
    })
    .refine((value) => !/^(?:\/admin|\/api|\/src|\/assets|\/uploads|\/favicon|\/robots\.txt|\/sitemap\.xml|\/health|\/.well-known)/i.test(value), {
      message: 'This route is not tracked as a public page visit.',
    }),
  referrer: z.string().trim().max(200).optional().default('Direct'),
  projectSlug: z.string().trim().max(120).optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional().default('desktop'),
});
