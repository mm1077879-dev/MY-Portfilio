import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  ArrowRight,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Trophy,
  Star,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { useSiteSettings } from '../../context/SiteContext';
import type {
  ServiceItem,
  AboutData,
  PricingPackageItem,
} from '../../types/portfolio';
import { DynamicIcon } from '../../components/common/DynamicIcon';
import { ResilientImage } from '../../components/common/ResilientImage';
import { ContactCtaBanner } from '../../components/common/ContactCtaBanner';

const LAPTOP_SHOWCASE = '/src/assets/images/project_taskflow_pro_1793526372048.jpg';

export const ServicesPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pricing, setPricing] = useState<PricingPackageItem[]>([]);
  const [about, setAbout] = useState<AboutData | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadServicesData() {
      try {
        const [srvRes, priceRes, aboutRes] = await Promise.all([
          apiClient.get('/services'),
          apiClient.get('/pricing'),
          apiClient.get('/about'),
        ]);
        if (!mounted) return;
        setServices(srvRes.data?.data || []);
        setPricing(priceRes.data?.data || []);
        setAbout(aboutRes.data?.data?.about || null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadServicesData();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = settings?.stats;
  const workflowSteps =
    about?.workflowSteps && about.workflowSteps.length > 0
      ? about.workflowSteps
      : [
          {
            stepNumber: '01',
            title: 'Share Your Idea',
            description: 'Tell me about your goals, target audience, and timeline.',
            icon: 'Lightbulb',
          },
          {
            stepNumber: '02',
            title: 'Plan & Design',
            description: 'Receive a clear technical blueprint and modern UI design.',
            icon: 'PenTool',
          },
          {
            stepNumber: '03',
            title: 'Develop & Deliver',
            description: 'Iterative full-stack engineering with rigorous QA testing.',
            icon: 'Code2',
          },
          {
            stepNumber: '04',
            title: 'Grow Your Business',
            description: 'Smooth launch, SEO readiness, and ongoing technical support.',
            icon: 'TrendingUp',
          },
        ];

  return (
    <div className="space-y-16 pt-8 pb-8">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-6 space-y-6"
          >
            <p className="text-xs font-semibold tracking-wider text-[#00D9FF]">
              Full-Stack Solutions
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight text-balance">
              Premium <span className="text-gradient-purple">Services</span> for Your Business
            </h1>
            <p className="text-base text-[#B5BCD9] leading-relaxed">
              From high-converting eCommerce platforms to custom multi-role SaaS applications and admin dashboards, every solution is architected for speed, security, and measurable business growth.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="btn-neon-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
              >
                <Rocket className="w-4 h-4" />
                <span>Let&apos;s Work Together</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#core-services"
                className="btn-neon-secondary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#F5F5FF] whitespace-nowrap shrink-0"
              >
                <span>Explore My Services</span>
              </a>
            </div>
          </motion.div>

          {/* Right: Futuristic Laptop / Architecture Illustration */}
          <div className="lg:col-span-6">
            <div className="cosmic-card rounded-3xl overflow-hidden p-3 border border-[#087BFF]/40 shadow-[0_22px_70px_-15px_rgba(8,123,255,0.35)]">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden">
                <ResilientImage
                  src={LAPTOP_SHOWCASE}
                  alt="Futuristic SaaS & Dashboard Engineering"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width KPI Strip below Hero Split */}
        <div className="mt-10 cosmic-card rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl text-white tabular-nums">
                {stats?.happyClients || '50+'}
              </div>
              <div className="text-xs text-[#B5BCD9]">Happy Clients</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:border-l sm:border-white/10 sm:pl-6">
            <div className="w-11 h-11 rounded-xl bg-[#00D9FF]/15 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl text-white tabular-nums">
                {stats?.projectsDelivered || '100+'}
              </div>
              <div className="text-xs text-[#B5BCD9]">Projects Delivered</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:border-l sm:border-white/10 sm:pl-6">
            <div className="w-11 h-11 rounded-xl bg-[#8B19FF]/20 border border-[#8B19FF]/40 flex items-center justify-center text-[#A855F7]">
              <Star className="w-5 h-5 fill-[#A855F7]" />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl text-white tabular-nums">
                {stats?.clientRating || '5.0'} / 5.0
              </div>
              <div className="text-xs text-[#B5BCD9]">Client Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES (6 DYNAMIC CARDS) */}
      <section id="core-services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-semibold text-[#00E69A]">What I Offer</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Core <span className="text-gradient-blue">Services</span>
          </h2>
          <p className="text-sm text-[#B5BCD9]">
            Tailored full-stack engineering services designed to launch and scale digital products.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="cosmic-card rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <article
                key={srv._id}
                className="cosmic-card cosmic-card-hover rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B19FF]/25 to-[#087BFF]/25 border border-[#8B19FF]/40 flex items-center justify-center text-[#00D9FF]">
                      <DynamicIcon name={srv.icon} className="w-6 h-6" />
                    </div>
                    {srv.startingPrice && (
                      <span className="font-mono text-xs text-[#B5BCD9] tabular-nums">
                        From <strong className="text-white">{srv.startingPrice}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-xl text-white">
                    {srv.title}
                  </h3>

                  <p className="text-sm text-[#B5BCD9] leading-relaxed">
                    {srv.shortDescription}
                  </p>

                  {srv.features && srv.features.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {srv.features.slice(0, 4).map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs text-[#E2E8F0]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#00E69A] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService(srv)}
                    className="btn-neon-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>{srv.ctaText || 'Learn More'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {srv.timelineEstimate && (
                    <span className="text-xs text-[#B5BCD9]/80 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#00D9FF]" />
                      <span>{srv.timelineEstimate}</span>
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS (4 WORKFLOW STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-semibold text-[#A855F7]">Proven Process</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            How It <span className="text-gradient-purple">Works</span>
          </h2>
          <p className="text-sm text-[#B5BCD9]">
            A transparent four-stage workflow from initial concept to launch and growth.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="cosmic-card rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-2xl text-[#00D9FF] tabular-nums">
                  {step.stepNumber || `0${idx + 1}`}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#8B19FF]/15 border border-[#8B19FF]/35 flex items-center justify-center text-[#A855F7]">
                  <DynamicIcon name={step.icon} className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#B5BCD9] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TRANSPARENT PRICING PACKAGES (MANAGED VIA ADMIN PRICING) */}
      {pricing.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <p className="text-xs font-semibold text-[#00D9FF]">Investment Plans</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Flexible <span className="text-gradient-blue">Packages</span>
            </h2>
            <p className="text-sm text-[#B5BCD9]">
              Clear deliverables and predictable milestone pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((pkg) => (
              <div
                key={pkg._id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 ${
                  pkg.featured
                    ? 'bg-gradient-to-b from-[#171242] to-[#090E2C] border-2 border-[#8B19FF] shadow-[0_20px_60px_-15px_rgba(139,25,255,0.45)]'
                    : 'cosmic-card'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#00D9FF]">
                      {pkg.audienceLabel}
                    </span>
                    {pkg.featured && (
                      <span className="text-xs font-bold text-[#00E69A]">Most Popular</span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-2xl text-white">
                    {pkg.packageName}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-[#B5BCD9]">/ {pkg.billingType}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#B5BCD9] leading-relaxed">
                    {pkg.description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#E2E8F0]">
                        <CheckCircle2 className="w-4 h-4 text-[#8B19FF] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={pkg.ctaLink || `/contact?package=${encodeURIComponent(pkg.packageName)}`}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    pkg.featured
                      ? 'btn-neon-primary text-white'
                      : 'btn-neon-secondary text-[#F5F5FF]'
                  }`}
                >
                  <span>{pkg.ctaText || 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <ContactCtaBanner showQuickForm={false} />

      {/* DYNAMIC SERVICE DETAIL MODAL */}
      {selectedService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#8B19FF]/20 border border-[#8B19FF]/40 flex items-center justify-center text-[#00D9FF]">
                  <DynamicIcon name={selectedService.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="service-modal-title" className="font-display font-bold text-2xl text-white">
                    {selectedService.title}
                  </h3>
                  <p className="text-xs text-[#B5BCD9]">
                    {selectedService.startingPrice
                      ? `Starting at ${selectedService.startingPrice}`
                      : 'Custom Proposal'}{' '}
                    · {selectedService.timelineEstimate || 'Flexible Timeline'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label="Close service details"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B5BCD9] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedService.image && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-white/10">
                <ResilientImage
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm sm:text-base text-[#E2E8F0] leading-relaxed">
              {selectedService.fullDescription || selectedService.shortDescription}
            </p>

            {selectedService.features.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="font-display font-bold text-sm text-[#00D9FF] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Included Capabilities</span>
                </h4>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {selectedService.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#B5BCD9]">
                      <CheckCircle2 className="w-4 h-4 text-[#00E69A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedService.deliverables && selectedService.deliverables.length > 0 && (
              <div className="pt-2 border-t border-white/10 text-xs text-[#B5BCD9]">
                <strong className="text-white">Deliverables:</strong>{' '}
                {selectedService.deliverables.join(' · ')}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#B5BCD9] bg-white/5 hover:text-white"
              >
                Close
              </button>
              <Link
                to={`/contact?service=${encodeURIComponent(selectedService.title)}`}
                onClick={() => setSelectedService(null)}
                className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
              >
                <span>Request Quote for {selectedService.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
