import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  ArrowRight,
  ArrowDown,
  Zap,
  Star,
  CheckCircle2,
  ShoppingCart,
  TrendingUp,
  Code2,
  ShieldCheck,
  Trophy,
  Clock,
  Quote,
  ChevronLeft,
  ChevronRight,
  Layers,
  Handshake,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { useSiteSettings } from '../../context/SiteContext';
import type {
  ProjectItem,
  ServiceItem,
  TestimonialItem,
} from '../../types/portfolio';
import { ProjectCard } from '../../components/common/ProjectCard';
import { ResilientImage } from '../../components/common/ResilientImage';
import { ContactCtaBanner } from '../../components/common/ContactCtaBanner';

const DEFAULT_HERO_PORTRAIT = '/src/assets/images/hero_developer_portrait_1793526368603.jpg';
const SHOWCASE_CARD_IMG = '/src/assets/images/project_nextgen_mart_1793526369277.jpg';

const WHY_WORK_ITEMS = [
  {
    title: 'Blazing Fast Performance',
    desc: 'Lightning speed for better results.',
    icon: Zap,
    accent: 'text-[#00D9FF] bg-[#00D9FF]/12 border-[#00D9FF]/30',
  },
  {
    title: 'Scalable Architecture',
    desc: 'Built to grow with your business.',
    icon: Layers,
    accent: 'text-[#38BDF8] bg-[#087BFF]/15 border-[#087BFF]/35',
  },
  {
    title: 'Clean & Maintainable Code',
    desc: 'Readable, reliable, and future-ready.',
    icon: Code2,
    accent: 'text-[#A855F7] bg-[#8B19FF]/15 border-[#8B19FF]/35',
  },
  {
    title: 'Business-Focused Development',
    desc: 'Your success is my priority.',
    icon: Handshake,
    accent: 'text-[#D000FF] bg-[#D000FF]/15 border-[#D000FF]/35',
  },
];

export const HomePage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchHomepageData() {
      try {
        const [projRes, srvRes, testRes] = await Promise.all([
          apiClient.get('/projects?featured=true&limit=3'),
          apiClient.get('/services'),
          apiClient.get('/testimonials'),
        ]);
        if (!mounted) return;
        setProjects(projRes.data?.data || []);
        setServices(srvRes.data?.data || []);
        setTestimonials(testRes.data?.data || []);
      } catch {
        // Handled gracefully with empty/fallback UI
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchHomepageData();
    return () => {
      mounted = false;
    };
  }, []);

  const banner = settings?.banner;
  const stats = settings?.stats;
  const activeTestimonial = testimonials[activeTestimonialIdx] || null;

  return (
    <div className="space-y-8">
      {/* SECTION 2: HERO (Design Authority: Homepage Reference Image) */}
      {banner?.visible !== false && (
        <section className="relative pt-8 pb-16 lg:pt-12 lg:pb-20 overflow-hidden border-b border-white/[0.06]">
          {/* Futuristic neon purple-blue glow behind portrait */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#8B19FF]/28 via-[#087BFF]/22 to-[#00D9FF]/18 blur-[95px]"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Availability, Headline, Intro, CTAs, Tech Stack */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="lg:col-span-6 space-y-6"
              >
                {banner?.availabilityText && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#090E2C]/90 border border-[#00E69A]/30 text-xs font-medium text-[#E2E8F0]">
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full ${
                        banner.availabilityActive !== false
                          ? 'bg-[#00E69A]'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>{banner.availabilityText}</span>
                  </div>
                )}

                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[60px] leading-[1.06] tracking-tight text-[#F5F5FF] text-balance">
                  <span className="block">
                    {banner?.headlineLine1 || 'Build Something'}
                  </span>
                  <span className="block text-gradient-blue mt-1">
                    {banner?.headlineLine2 || 'Extraordinary'}
                  </span>
                </h1>

                <p className="text-base sm:text-[17px] text-[#B5BCD9] leading-relaxed max-w-xl">
                  {banner?.subtitle ||
                    "I'm Mahim, a Full-Stack Developer specializing in high-performance web apps and eCommerce platforms. Let's turn your ideas into powerful digital products."}
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link
                    to={banner?.primaryCtaLink || '/contact'}
                    className="btn-neon-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>{banner?.primaryCtaLabel || "Let's Work Together"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={banner?.secondaryCtaLink || '/projects'}
                    className="btn-neon-secondary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#F5F5FF] whitespace-nowrap shrink-0"
                  >
                    <span>{banner?.secondaryCtaLabel || 'Explore My Work'}</span>
                    <ArrowDown className="w-4 h-4 text-[#B5BCD9]" />
                  </Link>
                </div>

                {/* Technology Stack Strip */}
                <div className="pt-2">
                  <div className="inline-flex items-start sm:items-center gap-3 px-4 py-3 rounded-2xl bg-[#070B24]/90 border border-white/[0.08] max-w-xl">
                    <div className="w-8 h-8 rounded-lg bg-[#087BFF]/15 border border-[#087BFF]/35 flex items-center justify-center text-[#00D9FF] shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#B5BCD9] leading-snug">
                      {banner?.techStackLine ||
                        'Full-Stack Development — JavaScript, TypeScript, Next.js, Node, PostgreSQL, MongoDB'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Developer Portrait with Halo & Editorial Callout */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-6 relative"
              >
                <div className="relative mx-auto max-w-xl rounded-3xl overflow-hidden border border-[#8B19FF]/35 bg-[#070B24] shadow-[0_24px_80px_-12px_rgba(139,25,255,0.4)]">
                  <div className="aspect-[4/3] w-full relative">
                    <ResilientImage
                      src={banner?.profileImage || DEFAULT_HERO_PORTRAIT}
                      alt={`${settings?.developerName || 'Mahim Dev'} — Full-Stack Developer`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030514]/85 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Top-right motivational script callout matching reference */}
                  {(banner?.floatingQuoteTop || banner?.floatingQuoteBottom) && (
                    <div className="hidden sm:block absolute top-5 right-5 text-right bg-[#030514]/65 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2">
                      <p className="font-display italic font-bold text-sm text-[#F5F5FF] leading-tight">
                        {banner?.floatingQuoteTop || 'Dream Big'}
                      </p>
                      <p className="font-display italic font-bold text-sm text-[#00D9FF] leading-tight">
                        {banner?.floatingQuoteBottom || 'Build Better'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: FEATURED PROJECTS */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="md:mx-auto md:text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FBBF24]">
                <Star className="w-3.5 h-3.5 fill-[#FBBF24]" />
                <span>My Best Projects</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F5F5FF]">
                Featured <span className="text-gradient-purple">Projects</span>
              </h2>
              <p className="text-sm text-[#B5BCD9]">
                Real-world projects that deliver results.
              </p>
            </div>

            <div className="md:absolute md:right-8">
              <Link
                to="/projects"
                className="btn-neon-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#F5F5FF] whitespace-nowrap shrink-0"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="cosmic-card rounded-2xl h-[420px] animate-pulse bg-[#090E2C]/60"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="cosmic-card rounded-2xl p-10 text-center space-y-3">
              <p className="text-base font-semibold text-white">No featured projects published yet.</p>
              <p className="text-sm text-[#B5BCD9]">
                Add or feature projects inside the Admin Dashboard to showcase them here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4 & 5: SERVICES OVERVIEW + MULTI-DEVICE SHOWCASE + WHY WORK WITH ME */}
      <section className="py-12 sm:py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: What I Can Build For You */}
            <div className="lg:col-span-4 space-y-5">
              <p className="text-xs font-semibold text-[#00E69A] tracking-wide">
                What I Can Build For You
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-[#F5F5FF] text-balance">
                Turn Your Ideas Into{' '}
                <span className="text-gradient-purple">Powerful Solutions</span>
              </h2>
              <p className="text-sm text-[#B5BCD9] leading-relaxed">
                From eCommerce to SaaS, I build modern, scalable and business-focused web applications.
              </p>

              <ul className="space-y-3 pt-1">
                {(services.length > 0
                  ? services.slice(0, 4).map((s) => s.title)
                  : [
                      'Premium eCommerce Site',
                      'Business Website',
                      'SaaS Applications',
                      'Custom Admin Dashboards',
                    ]
                ).map((itemTitle, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm font-semibold text-[#F5F5FF]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#8B19FF] shrink-0" />
                    <span>{itemTitle}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  to="/services"
                  className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
                >
                  <span>Let&apos;s Discuss Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Center Column: Layered Multi-Device Solution Showcase */}
            <div className="lg:col-span-4 relative py-4">
              <div className="relative mx-auto max-w-sm">
                <div className="rounded-2xl overflow-hidden border border-[#087BFF]/40 bg-[#090E2C] shadow-[0_20px_60px_-10px_rgba(8,123,255,0.35)] -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-[4/3]">
                    <ResilientImage
                      src={SHOWCASE_CARD_IMG}
                      alt="Modern eCommerce and SaaS application showcase"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-[#070B24] border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Responsive Web &amp; Mobile UI</span>
                    <Link to="/services" className="text-[#00D9FF] font-semibold hover:underline">
                      6 Services →
                    </Link>
                  </div>
                </div>

                {/* Corner functional link badges */}
                <Link
                  to="/services"
                  aria-label="Explore eCommerce services"
                  className="absolute -top-4 -left-3 w-11 h-11 rounded-2xl bg-[#090E2C] border border-[#087BFF]/45 flex items-center justify-center text-[#00D9FF] shadow-lg hover:scale-105 transition-transform"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <Link
                  to="/services"
                  aria-label="Explore SaaS analytics services"
                  className="absolute -top-4 -right-3 w-11 h-11 rounded-2xl bg-[#090E2C] border border-[#8B19FF]/45 flex items-center justify-center text-[#A855F7] shadow-lg hover:scale-105 transition-transform"
                >
                  <TrendingUp className="w-5 h-5" />
                </Link>
                <Link
                  to="/projects"
                  aria-label="Explore clean code projects"
                  className="absolute -bottom-3 -left-3 w-11 h-11 rounded-2xl bg-[#090E2C] border border-[#8B19FF]/45 flex items-center justify-center text-[#00D9FF] shadow-lg hover:scale-105 transition-transform"
                >
                  <Code2 className="w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  aria-label="Explore security and reliability"
                  className="absolute -bottom-3 -right-3 w-11 h-11 rounded-2xl bg-[#090E2C] border border-[#00E69A]/45 flex items-center justify-center text-[#00E69A] shadow-lg hover:scale-105 transition-transform"
                >
                  <ShieldCheck className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Why Work With Me? 2x2 Grid */}
            <div className="lg:col-span-4 lg:pl-4 lg:border-l lg:border-white/[0.08] space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#38BDF8] tracking-wide">
                  Why Work With Me
                </p>
                <h2 className="font-display font-extrabold text-3xl text-[#F5F5FF]">
                  Why Work With <span className="text-gradient-purple">Me?</span>
                </h2>
                <p className="text-sm text-[#B5BCD9]">
                  I&apos;m not just a developer — I&apos;m your long-term tech{' '}
                  <strong className="text-white font-semibold">partner</strong> for{' '}
                  <strong className="text-white font-semibold">growth</strong>.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {WHY_WORK_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[#090E2C]/90 border border-white/[0.09] hover:border-[#8B19FF]/45 p-4 transition-colors space-y-2.5"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.accent}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-bold text-sm text-[#F5F5FF] leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#B5BCD9] leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 & 7: STATISTICS + TESTIMONIALS STRIP */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Columns: 4 Statistics Bar */}
            <div className="lg:col-span-8 cosmic-card rounded-2xl p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 xl:gap-5 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-xl xl:text-2xl text-white tabular-nums whitespace-nowrap">
                    {stats?.happyClients || '50+'}
                  </div>
                  <div className="text-xs text-[#B5BCD9] truncate">Happy Clients</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-4">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-[#00D9FF]/12 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-xl xl:text-2xl text-white tabular-nums whitespace-nowrap">
                    {stats?.projectsDelivered || '100+'}
                  </div>
                  <div className="text-xs text-[#B5BCD9] truncate">Projects Delivered</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-4">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-xl xl:text-2xl text-white tabular-nums whitespace-nowrap">
                    {stats?.clientRating || '5.0'}
                  </div>
                  <div className="text-xs text-[#B5BCD9] truncate">Client Rating</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-4">
                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-[#087BFF]/15 border border-[#087BFF]/35 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-xl xl:text-2xl text-white tabular-nums whitespace-nowrap">
                    {stats?.experienceYears || '2+ Years'}
                  </div>
                  <div className="text-xs text-[#B5BCD9] truncate">Development Experience</div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Client Testimonial Card */}
            <div className="lg:col-span-4 cosmic-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
              {activeTestimonial ? (
                <>
                  <div className="flex items-start gap-3">
                    <Quote className="w-7 h-7 text-[#8B19FF] shrink-0 -mt-0.5" />
                    <p className="text-xs sm:text-[13px] text-[#E2E8F0] leading-relaxed italic">
                      &ldquo;{activeTestimonial.review}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2.5">
                      {activeTestimonial.clientImage ? (
                        <ResilientImage
                          src={activeTestimonial.clientImage}
                          alt={activeTestimonial.clientName}
                          className="w-9 h-9 rounded-full object-cover border border-[#8B19FF]/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B19FF] to-[#087BFF] flex items-center justify-center text-xs font-bold text-white">
                          {activeTestimonial.clientName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">
                          — {activeTestimonial.clientName}
                        </div>
                        <div className="text-[11px] text-[#B5BCD9]">
                          {activeTestimonial.position}
                        </div>
                      </div>
                    </div>

                    {testimonials.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Previous testimonial"
                          onClick={() =>
                            setActiveTestimonialIdx((prev) =>
                              prev === 0 ? testimonials.length - 1 : prev - 1
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-[#05081D] border border-white/15 flex items-center justify-center text-[#B5BCD9] hover:text-white"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next testimonial"
                          onClick={() =>
                            setActiveTestimonialIdx((prev) =>
                              (prev + 1) % testimonials.length
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-[#05081D] border border-white/15 flex items-center justify-center text-[#B5BCD9] hover:text-white"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#B5BCD9]">
                  Client testimonials managed via the Admin Dashboard appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: CONTACT CTA + QUICK FORM */}
      <ContactCtaBanner showQuickForm={true} />
    </div>
  );
};
