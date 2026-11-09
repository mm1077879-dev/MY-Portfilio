import bcrypt from 'bcryptjs';
import {
  Admin,
  Project,
  Service,
  About,
  Timeline,
  Testimonial,
  Skill,
  Message,
  FAQ,
  Pricing,
  SiteSettings,
  Analytics,
} from '../models';
import { env } from '../config/env';

const HERO_PORTRAIT = '/src/assets/images/hero_developer_portrait_1793526368603.jpg';
const IMG_NEXTGEN = '/src/assets/images/project_nextgen_mart_1793526369277.jpg';
const IMG_TASKFLOW = '/src/assets/images/project_taskflow_pro_1793526372048.jpg';
const IMG_BIZGROW = '/src/assets/images/project_bizgrow_corp_1793526371481.jpg';

export async function ensureSeededDatabase(forceReset = false): Promise<void> {
  if (forceReset) {
    await Promise.all([
      Project.deleteMany({}),
      Service.deleteMany({}),
      About.deleteMany({}),
      Timeline.deleteMany({}),
      Testimonial.deleteMany({}),
      Skill.deleteMany({}),
      FAQ.deleteMany({}),
      Pricing.deleteMany({}),
      SiteSettings.deleteMany({}),
      Message.deleteMany({}),
      Analytics.deleteMany({}),
    ]);
  }

  // 1. Initial Admin Account
  if (Boolean(env.INITIAL_ADMIN_EMAIL) !== Boolean(env.INITIAL_ADMIN_PASSWORD)) {
    throw new Error(
      'Set both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD (legacy ADMIN_EMAIL and ADMIN_PASSWORD are also supported).'
    );
  }
  let admin = await Admin.findOne({ isInitialAdmin: true }).select(
    '+passwordHash +isInitialAdmin'
  );
  if (env.INITIAL_ADMIN_EMAIL && env.INITIAL_ADMIN_PASSWORD) {
    if (!admin) {
      admin = await Admin.findOne({ email: env.INITIAL_ADMIN_EMAIL }).select(
        '+passwordHash +isInitialAdmin'
      );
    }

    if (admin) {
      const emailOwner = await Admin.findOne({
        email: env.INITIAL_ADMIN_EMAIL,
        _id: { $ne: admin._id },
      }).select('_id');
      if (emailOwner) {
        throw new Error(
          'INITIAL_ADMIN_EMAIL is already assigned to another administrator; resolve the email conflict before startup.'
        );
      }

      let changed = false;
      if (admin.email !== env.INITIAL_ADMIN_EMAIL) {
        admin.email = env.INITIAL_ADMIN_EMAIL;
        changed = true;
      }
      if (!admin.isInitialAdmin) {
        admin.isInitialAdmin = true;
        changed = true;
      }
      if (!(await admin.comparePassword(env.INITIAL_ADMIN_PASSWORD))) {
        admin.passwordHash = await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12);
        admin.passwordChangedAt = new Date();
        changed = true;
      }
      if (changed) {
        admin.authVersion = (admin.authVersion ?? 0) + 1;
        await admin.save();
        console.log('[Seed] Synchronized the configured initial admin account.');
      }
    } else {
      const passwordHash = await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, 12);
      admin = await Admin.create({
        name: env.INITIAL_ADMIN_NAME,
        email: env.INITIAL_ADMIN_EMAIL,
        passwordHash,
        role: 'superadmin',
        isInitialAdmin: true,
        avatar: HERO_PORTRAIT,
        bio: 'Full-Stack Software Architect specializing in React, Next.js, TypeScript, Node.js, and MongoDB.',
      });
      console.log('[Seed] Created the configured initial admin account.');
    }
  }
  if (!admin) {
    admin = await Admin.findOne().sort({ createdAt: 1 });
  }

  // 2. Site Settings (Banner, Stats, Contact, SEO, Socials)
  const settingsCount = await SiteSettings.countDocuments();
  if (settingsCount === 0) {
    await SiteSettings.create({
      siteTitle: 'Mahim Dev — Full-Stack Developer',
      logoText: 'Mahim Dev',
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
      footerTagline: 'Full-Stack Developer crafting scalable digital products and eCommerce systems.',
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
        profileImage: HERO_PORTRAIT,
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
          'Full-Stack Developer specializing in high-performance web apps, SaaS platforms, custom admin dashboards, and modern eCommerce stores.',
        keywords: [
          'Mahim Dev',
          'Full-Stack Developer',
          'React Developer',
          'Next.js',
          'Node.js',
          'MongoDB',
          'E-Commerce Development',
          'SaaS Applications',
        ],
        ogImage: HERO_PORTRAIT,
        canonicalUrl: '',
        robots: 'index, follow',
        twitterHandle: '@mahimdev',
      },
      socialLinks: [
        {
          platform: 'GitHub',
          label: 'GitHub (@mahimdev)',
          url: 'https://github.com',
          icon: 'Github',
          order: 1,
          visible: true,
        },
        {
          platform: 'LinkedIn',
          label: 'LinkedIn Profile',
          url: 'https://linkedin.com',
          icon: 'Linkedin',
          order: 2,
          visible: true,
        },
        {
          platform: 'YouTube',
          label: 'YouTube Channel',
          url: 'https://youtube.com',
          icon: 'Youtube',
          order: 3,
          visible: true,
        },
        {
          platform: 'X',
          label: 'X / Twitter',
          url: 'https://x.com',
          icon: 'Twitter',
          order: 4,
          visible: true,
        },
        {
          platform: 'Discord',
          label: 'Discord Community',
          url: 'https://discord.com',
          icon: 'MessageSquare',
          order: 5,
          visible: true,
        },
      ],
    });
  } else {
    // Sanitize any existing settings in database containing unsupported absolute claims
    await SiteSettings.updateMany(
      { 'footer.trustStrip.items.title': '100% Secure Architecture' },
      {
        $set: {
          'footer.trustStrip.items.$[elem].title': 'Security-Minded Architecture',
          'footer.trustStrip.items.$[elem].description':
            'Audited code safety & modern security standards',
        },
      },
      {
        arrayFilters: [{ 'elem.title': '100% Secure Architecture' }],
      }
    );
  }

  // 3. Projects (Sample Demonstration Portfolio Data)
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        title: 'NextGen Mart',
        slug: 'nextgen-mart',
        category: 'E-Commerce',
        shortDescription: 'A modern eCommerce platform with advanced features.',
        overview:
          'NextGen Mart is a full-featured multi-category eCommerce storefront engineered for sub-second product discovery, real-time inventory tracking, Stripe checkout orchestration, and role-based merchant analytics.',
        thumbnail: IMG_NEXTGEN,
        screenshots: [IMG_NEXTGEN, IMG_TASKFLOW],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Stripe'],
        features: ['Secure Payment', 'Admin Dashboard', 'Fast Performance', 'Real-Time Inventory'],
        challenges:
          'Legacy catalog queries caused slow filter transitions across 25,000+ SKU variants and high cart abandonment on mobile networks.',
        solutions:
          'Implemented compound MongoDB indexes, server-cached facet aggregations, optimistic cart state updates, and streamlined 2-step checkout validation.',
        results:
          'Reduced catalog filter response times below 120ms and simplified merchant order fulfillment operations inside a unified admin console.',
        liveUrl: '/projects/nextgen-mart',
        caseStudyUrl: '/projects/nextgen-mart',
        githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd',
        featured: true,
        published: true,
        order: 1,
        views: 342,
        createdBy: admin?._id,
      },
      {
        title: 'TaskFlow Pro',
        slug: 'taskflow-pro',
        category: 'SaaS',
        shortDescription: 'A powerful SaaS application for team collaboration.',
        overview:
          'TaskFlow Pro unifies agile sprint boards, asynchronous team updates, workload forecasting, and executive productivity telemetry into one responsive SaaS workspace.',
        thumbnail: IMG_TASKFLOW,
        screenshots: [IMG_TASKFLOW, IMG_BIZGROW],
        technologies: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Socket.IO', 'Recharts'],
        features: ['Real-time Sync', 'Team Management', 'Analytics Dashboard', 'Role Permissions'],
        challenges:
          'Distributed product teams struggled with stale board states and fragmented sprint reporting across multiple disconnected tools.',
        solutions:
          'Architected event-driven synchronization with granular workspace RBAC and interactive velocity analytics powered by tabular Recharts visualizations.',
        results:
          'Delivered zero-conflict collaborative editing across concurrent team sessions with clear sprint burndown visibility.',
        liveUrl: '/projects/taskflow-pro',
        caseStudyUrl: '/projects/taskflow-pro',
        githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd',
        featured: true,
        published: true,
        order: 2,
        views: 289,
        createdBy: admin?._id,
      },
      {
        title: 'BizGrow',
        slug: 'bizgrow',
        category: 'Business',
        shortDescription: 'A premium business website for corporate growth.',
        overview:
          'BizGrow is an enterprise digital presence and lead-qualification platform with dynamic CMS case studies, technical SEO schema automation, and CRM-connected consultation booking.',
        thumbnail: IMG_BIZGROW,
        screenshots: [IMG_BIZGROW, IMG_NEXTGEN],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB'],
        features: ['Modern Design', 'SEO Optimized', 'Fast & Secure', 'Lead Capture CMS'],
        challenges:
          'Corporate marketing teams needed complete editorial control over landing pages and SEO metadata without sacrificing Core Web Vitals.',
        solutions:
          'Built a structured headless CMS dashboard with Zod schema validation, automated OpenGraph metadata, and static-first asset optimization.',
        results:
          'Achieved 98+ Lighthouse performance and accessibility scores while empowering non-technical editors to publish updates in minutes.',
        liveUrl: '/projects/bizgrow',
        caseStudyUrl: '/projects/bizgrow',
        githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd',
        featured: true,
        published: true,
        order: 3,
        views: 215,
        createdBy: admin?._id,
      },
      {
        title: 'FinPulse Admin',
        slug: 'finpulse-admin',
        category: 'Dashboards',
        shortDescription: 'Real-time financial operations and KPI control center.',
        overview:
          'A high-density executive admin dashboard for monitoring recurring revenue, cohort retention, invoice reconciliation, and audit logs.',
        thumbnail: IMG_TASKFLOW,
        screenshots: [IMG_TASKFLOW],
        technologies: ['React', 'TypeScript', 'Recharts', 'Express', 'MongoDB', 'JWT'],
        features: ['Cohort Telemetry', 'Role-Based Access', 'CSV/PDF Exports', 'Audit Trail'],
        challenges:
          'Finance analysts were manually reconciling CSV exports across multiple payment processors every week.',
        solutions:
          'Engineered normalized webhook ingestion pipelines and real-time aggregation endpoints with date-range filtering.',
        results:
          'Automated daily reconciliation workflows with instant drill-down charts and strict RBAC governance.',
        liveUrl: '/projects/finpulse-admin',
        caseStudyUrl: '/projects/finpulse-admin',
        githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd',
        featured: false,
        published: true,
        order: 4,
        views: 178,
        createdBy: admin?._id,
      },
      {
        title: 'CloudScale CRM',
        slug: 'cloudscale-crm',
        category: 'Web Apps',
        shortDescription: 'Full-stack client pipeline and proposal automation web app.',
        overview:
          'Custom web application built for B2B service agencies to track deal pipelines, automate client onboarding checklists, and manage retainers.',
        thumbnail: IMG_BIZGROW,
        screenshots: [IMG_BIZGROW],
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Zod'],
        features: ['Deal Pipeline', 'Client Portal', 'Automated Reminders', 'REST API v1'],
        challenges:
          'Account managers lacked a single source of truth linking incoming inquiries to active delivery milestones.',
        solutions:
          'Created a clean RESTful backend with indexed pipeline queries and automated status transitions.',
        results:
          'Streamlined client onboarding turnaround from days to hours.',
        liveUrl: '/projects/cloudscale-crm',
        caseStudyUrl: '/projects/cloudscale-crm',
        githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd',
        featured: false,
        published: true,
        order: 5,
        views: 146,
        createdBy: admin?._id,
      },
      {
        title: 'Aura Audio Store',
        slug: 'aura-audio-store',
        category: 'E-Commerce',
        shortDescription: 'Direct-to-consumer flagship storefront for studio audio gear.',
        overview:
          'Bespoke D2C eCommerce experience featuring interactive product comparison matrices, bundle configurators, and customer review verification.',
        thumbnail: IMG_NEXTGEN,
        screenshots: [IMG_NEXTGEN],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'Express'],
        features: ['Bundle Builder', 'Verified Reviews', 'Order Tracking', 'Mobile-First UI'],
        challenges:
          'High-ticket audio buyers required detailed technical comparisons before purchasing flagship headphones.',
        solutions:
          'Designed interactive side-by-side spec tables paired with instant search and persistent cart drawers.',
        results:
          'Delivered a cohesive luxury dark-mode shopping experience across desktop and mobile devices.',
        liveUrl: '/projects/aura-audio-store',
        caseStudyUrl: '/projects/aura-audio-store',
        githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd',
        featured: false,
        published: true,
        order: 6,
        views: 132,
        createdBy: admin?._id,
      },
    ]);
  } else {
    // Sanitize any existing records in database previously seeded with example.com
    await Project.updateMany(
      { liveUrl: { $regex: /example\.(com|org|net)|iana\.org/i } },
      [
        {
          $set: {
            liveUrl: { $concat: ['/projects/', '$slug'] },
          },
        },
      ],
      { updatePipeline: true }
    );
    await Project.updateMany(
      { githubUrl: { $regex: /github\.com\/example/i } },
      { $set: { githubUrl: 'https://github.com/mmdd420680-cloud/Protfilo-mmdd' } }
    );
  }

  // 4. Core Services (6 Required Cards)
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany([
      {
        title: 'E-Commerce Development',
        slug: 'ecommerce-development',
        icon: 'ShoppingBag',
        image: IMG_NEXTGEN,
        shortDescription:
          'High-converting custom online stores with secure payments, inventory sync, and merchant analytics.',
        fullDescription:
          'End-to-end eCommerce engineering tailored for conversion velocity, mobile responsiveness, payment gateway security, and effortless catalog management.',
        features: [
          'Custom Product Catalog & Faceted Filtering',
          'Stripe / SSL Payment Gateway Integration',
          'Inventory, Coupon & Order Management CMS',
          'Sub-Second Page Load & Technical SEO',
        ],
        deliverables: ['Storefront Web App', 'Merchant Admin Panel', 'Payment & Webhook Suite'],
        startingPrice: '$1,800',
        timelineEstimate: '3 – 5 Weeks',
        ctaText: 'Learn More',
        ctaLink: '/contact?service=E-Commerce+Development',
        featured: true,
        published: true,
        order: 1,
      },
      {
        title: 'Business Website',
        slug: 'business-website',
        icon: 'Globe',
        image: IMG_BIZGROW,
        shortDescription:
          'Authoritative corporate websites built to elevate brand trust, organic rankings, and inbound leads.',
        fullDescription:
          'Modern, responsive business websites coupled with a dynamic CMS so your team can update pages, case studies, and SEO metadata without touching code.',
        features: [
          'Bespoke Brand-Aligned Responsive UI',
          'Dynamic Content Management System',
          'Schema.org & OpenGraph SEO Architecture',
          'Lead Capture Forms with Spam Protection',
        ],
        deliverables: ['Multi-Page Responsive Website', 'Admin CMS', 'SEO & Analytics Setup'],
        startingPrice: '$1,200',
        timelineEstimate: '2 – 3 Weeks',
        ctaText: 'Learn More',
        ctaLink: '/contact?service=Business+Website',
        featured: true,
        published: true,
        order: 2,
      },
      {
        title: 'SaaS Applications',
        slug: 'saas-applications',
        icon: 'Layers',
        image: IMG_TASKFLOW,
        shortDescription:
          'Full-stack multi-tenant SaaS products engineered with clean APIs, authentication, and billing.',
        fullDescription:
          'From MVP launch to production scale, I architect full-stack TypeScript SaaS applications with role-based permissions, real-time workflows, and subscription tiers.',
        features: [
          'Multi-Role Authentication & JWT Security',
          'Versioned REST API & Database Modeling',
          'Subscription & Usage Tier Architecture',
          'Interactive Real-Time Data Workflows',
        ],
        deliverables: ['Full-Stack SaaS Application', 'REST API v1', 'Deployment Documentation'],
        startingPrice: '$2,800',
        timelineEstimate: '4 – 8 Weeks',
        ctaText: 'Learn More',
        ctaLink: '/contact?service=SaaS+Applications',
        featured: true,
        published: true,
        order: 3,
      },
      {
        title: 'Custom Admin Dashboards',
        slug: 'custom-admin-dashboards',
        icon: 'LayoutDashboard',
        image: IMG_TASKFLOW,
        shortDescription:
          'Data-rich internal tools, CRM portals, and analytics consoles for operational clarity.',
        fullDescription:
          'Replace scattered spreadsheets with a unified, secure admin dashboard featuring live charts, granular user permissions, CRUD workflows, and audit logs.',
        features: [
          'Interactive Charts & KPI Telemetry',
          'Complete CRUD & Media Management',
          'Role-Based Access Control (RBAC)',
          'Advanced Search, Filtering & Pagination',
        ],
        deliverables: ['Protected Admin Console', 'Analytics Engine', 'API Security Layer'],
        startingPrice: '$1,600',
        timelineEstimate: '2 – 4 Weeks',
        ctaText: 'Learn More',
        ctaLink: '/contact?service=Custom+Admin+Dashboards',
        featured: true,
        published: true,
        order: 4,
      },
      {
        title: 'Performance Optimization',
        slug: 'performance-optimization',
        icon: 'Gauge',
        image: IMG_BIZGROW,
        shortDescription:
          'Eliminate bottlenecks across React bundles, API latency, and MongoDB query execution.',
        fullDescription:
          'Comprehensive full-stack audits and refactoring to dramatically improve Core Web Vitals, database query indexing, caching strategies, and Lighthouse scores.',
        features: [
          'Code Splitting & Bundle Size Reduction',
          'MongoDB Compound Indexing & Aggregation Tuning',
          'API Caching & Payload Compression',
          'Core Web Vitals & Accessibility Hardening',
        ],
        deliverables: ['Audit Report', 'Optimized Production Codebase', 'Before/After Benchmarks'],
        startingPrice: '$750',
        timelineEstimate: '1 – 2 Weeks',
        ctaText: 'Learn More',
        ctaLink: '/contact?service=Performance+Optimization',
        featured: false,
        published: true,
        order: 5,
      },
      {
        title: 'Ongoing Support & Maintenance',
        slug: 'ongoing-support-maintenance',
        icon: 'ShieldCheck',
        image: IMG_NEXTGEN,
        shortDescription:
          'Proactive security updates, feature enhancements, uptime monitoring, and priority engineering.',
        fullDescription:
          'Dedicated technical partnership keeping your production web application secure, fast, backed up, and continuously evolving alongside your business.',
        features: [
          'Security Patching & Dependency Audits',
          'Database Backups & Health Monitoring',
          'Monthly Feature & UI Enhancements',
          'Priority Bug Resolution & Direct Support',
        ],
        deliverables: ['Monthly Health Reports', 'Priority SLA', 'Continuous Deployment Care'],
        startingPrice: '$450/mo',
        timelineEstimate: 'Ongoing Retainer',
        ctaText: 'Learn More',
        ctaLink: '/contact?service=Ongoing+Support',
        featured: false,
        published: true,
        order: 6,
      },
    ]);
  }

  // 5. About & Workflow
  const aboutCount = await About.countDocuments();
  if (aboutCount === 0) {
    await About.create({
      badgeText: 'About Me',
      headline: "Hi, I'm Mahim Dev",
      developerName: 'Mahim Dev',
      subtitle: 'Full-Stack Developer & Problem Solver',
      biography:
        "I'm a dedicated Full-Stack Software Developer passionate about turning ambitious business visions into blazing-fast, reliable web applications. Combining modern React & TypeScript interfaces with secure Node.js, Express, and MongoDB backends, I build products engineered for real-world scale.",
      extendedBio:
        'Every line of code I write is guided by three principles: measurable user experience, clean maintainable architecture, and transparent communication from discovery through launch.',
      profileImage: HERO_PORTRAIT,
      cvFileUrl: '/api/v1/about/cv-download',
      trustText: 'Sample portfolio demonstration — fully customizable via Admin CMS',
      experienceYears: '2+ Years',
      projectsDelivered: '100+',
      happyClients: '50+',
      clientSatisfaction: '99%',
      whyChooseMe: [
        {
          title: 'High Performance & Scalable Solutions',
          description: 'Engineered for sub-second load speeds and effortless horizontal growth as your traffic expands.',
          icon: 'Zap',
        },
        {
          title: 'Clean & Maintainable Code',
          description: 'Strictly typed TypeScript modules, clear separation of concerns, and well-documented APIs.',
          icon: 'Code2',
        },
        {
          title: 'Business-Focused Development',
          description: 'Every architectural choice aligns directly with conversion rates, user retention, and ROI.',
          icon: 'Briefcase',
        },
        {
          title: 'On-Time Delivery & Clear Communication',
          description: 'Structured milestones, regular interactive previews, and dependable launch timelines.',
          icon: 'Clock',
        },
      ],
      workflowSteps: [
        {
          stepNumber: '01',
          title: 'Share Your Idea',
          description: 'We discuss your business goals, target users, core requirements, and desired timeline.',
          icon: 'Lightbulb',
        },
        {
          stepNumber: '02',
          title: 'Plan & Design',
          description: 'I craft the system architecture, database schema, and pixel-accurate UI/UX roadmap.',
          icon: 'PenTool',
        },
        {
          stepNumber: '03',
          title: 'Develop & Deliver',
          description: 'Clean full-stack implementation with iterative previews, security hardening, and QA testing.',
          icon: 'Code2',
        },
        {
          stepNumber: '04',
          title: 'Grow Your Business',
          description: 'Smooth production deployment, SEO optimization, analytics tracking, and ongoing support.',
          icon: 'TrendingUp',
        },
      ],
    });
  }

  // 6. Career Journey Timeline
  const timelineCount = await Timeline.countDocuments();
  if (timelineCount === 0) {
    await Timeline.insertMany([
      {
        year: '2022',
        title: 'Started Learning Web Development',
        subtitle: 'Foundations in Web Standards & Programming',
        description:
          'Built strong fundamentals in semantic HTML5, modern CSS architectures, responsive layouts, and core JavaScript problem solving.',
        category: 'education',
        order: 1,
        published: true,
      },
      {
        year: '2023',
        title: 'Mastered Modern Frontend & Backend Technologies',
        subtitle: 'Full-Stack TypeScript Ecosystem',
        description:
          'Specialized in React, Next.js, TypeScript, Tailwind CSS, Node.js, Express, REST API architecture, and relational/document databases.',
        category: 'milestone',
        order: 2,
        published: true,
      },
      {
        year: '2024',
        title: 'Started Working on Freelance & Real Projects',
        subtitle: 'Production Client Deliveries',
        description:
          'Delivered custom eCommerce storefronts, business websites, and bespoke admin dashboards with authentication and payment integrations.',
        category: 'career',
        order: 3,
        published: true,
      },
      {
        year: '2025+',
        title: 'Building Scalable Digital Products',
        subtitle: 'Full-Stack Architecture & SaaS Engineering',
        description:
          'Partnering with founders and businesses globally to architect high-performance SaaS applications, dynamic CMS platforms, and scalable web ecosystems.',
        category: 'career',
        order: 4,
        published: true,
      },
    ]);
  }

  // 7. Technical Skills
  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    await Skill.insertMany([
      {
        name: 'JavaScript & TypeScript',
        category: 'Frontend',
        icon: 'FileCode2',
        proficiency: 95,
        description: 'Strict static typing, modern ESNext patterns, and modular architecture.',
        order: 1,
        visible: true,
      },
      {
        name: 'Next.js & React',
        category: 'Frontend',
        icon: 'Atom',
        proficiency: 94,
        description: 'SSR/SPA rendering, custom hooks, state management, and high-FPS UI.',
        order: 2,
        visible: true,
      },
      {
        name: 'Tailwind CSS & Design Systems',
        category: 'Frontend',
        icon: 'Palette',
        proficiency: 96,
        description: 'Responsive glassmorphic interfaces, accessible components, and dark UI.',
        order: 3,
        visible: true,
      },
      {
        name: 'Node.js & Express',
        category: 'Backend',
        icon: 'Server',
        proficiency: 92,
        description: 'Versioned REST APIs, JWT security, rate limiting, and clean MVC services.',
        order: 4,
        visible: true,
      },
      {
        name: 'MongoDB & Mongoose',
        category: 'Database',
        icon: 'Database',
        proficiency: 93,
        description: 'Schema design, compound indexing, aggregation pipelines, and Atlas.',
        order: 5,
        visible: true,
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        icon: 'HardDrive',
        proficiency: 88,
        description: 'Relational modeling, ACID transactions, and query optimization.',
        order: 6,
        visible: true,
      },
      {
        name: 'REST APIs & Authentication',
        category: 'Backend',
        icon: 'Shield',
        proficiency: 94,
        description: 'JWT HttpOnly cookies, RBAC middleware, Zod validation, and OAuth flows.',
        order: 7,
        visible: true,
      },
      {
        name: 'Git, Docker & Cloud Deployment',
        category: 'DevOps & Tools',
        icon: 'Cloud',
        proficiency: 86,
        description: 'CI/CD pipelines, containerized builds, environment security, and monitoring.',
        order: 8,
        visible: true,
      },
    ]);
  }

  // 8. Sample Testimonials
  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      {
        clientName: 'Sarah Khan',
        clientImage: '',
        company: 'TechVista (Sample)',
        position: 'CEO, TechVista',
        review:
          'Mahim Dev delivered an outstanding website. Professional, fast and highly skilled! Our team can now update every product and landing section effortlessly.',
        rating: 5,
        featured: true,
        published: true,
        order: 1,
      },
      {
        clientName: 'Daniel Mercer',
        clientImage: '',
        company: 'CloudPulse Studio (Sample)',
        position: 'Product Lead',
        review:
          'Exceptional full-stack execution. The custom admin dashboard and REST API architecture cut our weekly reporting workflow from hours down to seconds.',
        rating: 5,
        featured: true,
        published: true,
        order: 2,
      },
      {
        clientName: 'Ayesha Rahman',
        clientImage: '',
        company: 'NextCart Retail (Sample)',
        position: 'Founder',
        review:
          'From database modeling to mobile checkout polish, every milestone was delivered ahead of schedule with crystal-clear communication.',
        rating: 5,
        featured: true,
        published: true,
        order: 3,
      },
    ]);
  }

  // 9. FAQs
  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    await FAQ.insertMany([
      {
        question: 'How long does it take to complete a project?',
        answer:
          'Most standard business websites take 2–3 weeks, while custom eCommerce platforms, SaaS MVPs, and complex admin dashboards typically take 4–8 weeks depending on scope and integrations.',
        category: 'Timeline',
        order: 1,
        visible: true,
      },
      {
        question: 'Do you provide ongoing support?',
        answer:
          'Yes. Every project includes post-launch bug support, and I offer flexible monthly maintenance retainers covering security updates, backups, performance tuning, and new feature rollouts.',
        category: 'Support',
        order: 2,
        visible: true,
      },
      {
        question: 'What is your pricing model?',
        answer:
          'I offer transparent fixed-price milestones for well-defined projects and monthly retainers for ongoing engineering partnerships. Every proposal outlines exact deliverables upfront.',
        category: 'Pricing',
        order: 3,
        visible: true,
      },
      {
        question: 'Can we work together remotely?',
        answer:
          'Absolutely! I collaborate seamlessly with clients across North America, Europe, Asia, and Australia using structured async updates, live staging links, and scheduled video calls.',
        category: 'Collaboration',
        order: 4,
        visible: true,
      },
    ]);
  }

  // 10. Pricing Packages
  const pricingCount = await Pricing.countDocuments();
  if (pricingCount === 0) {
    await Pricing.insertMany([
      {
        packageName: 'Business Launch',
        audienceLabel: 'For startups & personal brands',
        price: '$1,200',
        currency: 'USD',
        billingType: 'One-Time',
        description: 'Modern, SEO-ready multi-page website with dynamic admin content controls.',
        features: [
          'Up to 6 Custom Responsive Pages',
          'Dynamic Admin CMS Dashboard',
          'Contact Form & MongoDB Inbox',
          'Technical SEO & OpenGraph Setup',
          '14 Days Post-Launch Support',
        ],
        featured: false,
        ctaText: 'Start Business Site',
        ctaLink: '/contact?package=Business+Launch',
        order: 1,
        visible: true,
      },
      {
        packageName: 'Full-Stack Growth',
        audienceLabel: 'For eCommerce & scaling SaaS teams',
        price: '$2,600',
        currency: 'USD',
        billingType: 'One-Time',
        description: 'Complete full-stack web application or eCommerce platform with custom APIs.',
        features: [
          'Custom React + TypeScript Frontend',
          'Node.js, Express & MongoDB Backend',
          'Role-Based Admin Dashboard & Analytics',
          'Payment or 3rd-Party API Integrations',
          '30 Days Priority Engineering Support',
        ],
        featured: true,
        ctaText: 'Build Full-Stack App',
        ctaLink: '/contact?package=Full-Stack+Growth',
        order: 2,
        visible: true,
      },
      {
        packageName: 'Dedicated Partner',
        audienceLabel: 'For ongoing product velocity',
        price: '$1,800',
        currency: 'USD',
        billingType: 'Monthly',
        description: 'Continuous full-stack feature development, architecture care, and SLA support.',
        features: [
          'Dedicated Weekly Engineering Sprints',
          'Continuous UI & Backend Feature Delivery',
          'Performance & Security Hardening',
          'Database Optimization & Monitoring',
          'Direct Slack / WhatsApp Priority Access',
        ],
        featured: false,
        ctaText: 'Book Retainer Call',
        ctaLink: '/contact?package=Dedicated+Partner',
        order: 3,
        visible: true,
      },
    ]);
  }

  // 11. Sample Inbox Inquiries (Clearly marked as sample inquiries)
  const msgCount = await Message.countDocuments();
  if (msgCount === 0) {
    await Message.insertMany([
      {
        fullName: 'Sarah Khan (Sample Inquiry)',
        email: 'sarah@techvista.example',
        service: 'SaaS Applications',
        subject: 'Custom SaaS Analytics Portal Inquiry',
        message:
          'Hi Mahim, we are planning a Q4 launch for our B2B analytics workspace and would love to discuss architecture, timeline, and milestone pricing.',
        status: 'New',
      },
      {
        fullName: 'Marcus Vance (Sample Inquiry)',
        email: 'marcus@nextcart.example',
        service: 'E-Commerce Development',
        subject: 'Headless Storefront & Admin CMS Upgrade',
        message:
          'Looking to migrate our existing online store to a faster React + Node.js stack with custom inventory filtering.',
        status: 'Read',
      },
      {
        fullName: 'Elena Rostova (Sample Inquiry)',
        email: 'elena@bizgrow.example',
        service: 'Custom Admin Dashboards',
        subject: 'Internal Operations Dashboard',
        message:
          'We need a role-protected dashboard for our operations team to manage client deliverables and KPIs.',
        status: 'Replied',
        replyBody: 'Thank you Elena! Shared our discovery agenda and timeline estimate.',
        repliedAt: new Date(Date.now() - 86400000),
      },
    ]);
  }

  // 12. Initial Seed Analytics Records (Real documents in Analytics collection)
  const analyticsCount = await Analytics.countDocuments();
  if (analyticsCount === 0) {
    const samplePaths = ['/', '/projects', '/services', '/about', '/contact', '/projects/nextgen-mart'];
    const sampleReferrers = ['Direct', 'GitHub', 'LinkedIn', 'Google Search', 'X / Twitter'];
    const docs: Array<{
      path: string;
      visitorHash: string;
      referrer: string;
      projectSlug?: string;
      deviceType: 'desktop' | 'tablet' | 'mobile';
      dateBucket: string;
      createdAt: Date;
    }> = [];

    const now = Date.now();
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const dayTime = new Date(now - dayOffset * 86400000);
      const dateBucket = dayTime.toISOString().slice(0, 10);
      const dailyCount = 8 + ((14 - dayOffset) % 7) * 3;
      for (let i = 0; i < dailyCount; i++) {
        const chosenPath = samplePaths[(dayOffset + i) % samplePaths.length];
        docs.push({
          path: chosenPath,
          visitorHash: `seed-visitor-${dateBucket}-${i % 9}`,
          referrer: sampleReferrers[(dayOffset + i) % sampleReferrers.length],
          projectSlug: chosenPath.startsWith('/projects/') ? 'nextgen-mart' : undefined,
          deviceType: i % 4 === 0 ? 'mobile' : i % 7 === 0 ? 'tablet' : 'desktop',
          dateBucket,
          createdAt: dayTime,
        });
      }
    }
    await Analytics.insertMany(docs);
  }
}
