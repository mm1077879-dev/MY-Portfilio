import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useSiteSettings } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import type { FAQItem, ServiceItem } from '../../types/portfolio';
import {
  contactFormSchema,
  type ContactFormValues,
} from '../../validations/clientSchemas';
import { normalizeWhatsAppHref } from '../../utils/portfolioLogic';
import { DynamicIcon } from '../../components/common/DynamicIcon';
import { ContactCtaBanner } from '../../components/common/ContactCtaBanner';
import { CanvasSuccessCelebration } from '../../components/common/CanvasSuccessCelebration';

export const ContactPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const preselectedService =
    searchParams.get('service') || searchParams.get('package') || '';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      service: preselectedService || 'E-Commerce Development',
      subject: preselectedService ? `Inquiry: ${preselectedService}` : '',
      message: '',
      honeypot: '',
    },
  });

  useEffect(() => {
    if (preselectedService) {
      setValue('service', preselectedService);
      setValue('subject', `Inquiry: ${preselectedService}`);
    }
  }, [preselectedService, setValue]);

  useEffect(() => {
    let mounted = true;
    async function loadContactPageResources() {
      try {
        const [srvRes, faqRes] = await Promise.all([
          apiClient.get('/services'),
          apiClient.get('/faq'),
        ]);
        if (!mounted) return;
        setServices(srvRes.data?.data || []);
        const faqItems: FAQItem[] = faqRes.data?.data || [];
        setFaqs(faqItems);
        if (faqItems.length > 0) {
          setOpenFaqId(faqItems[0]._id);
        }
      } catch {
        // Handled cleanly
      }
    }
    loadContactPageResources();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const res = await apiClient.post('/messages', values);
      // Strictly verify database persistence confirmation from real backend
      if (res.status === 201 && res.data?.data?.id) {
        setSubmittedData({ name: values.fullName, email: values.email });
        reset();
        setShowCelebration(true);
        showToast('Message sent and saved to database successfully!', 'success');
      } else {
        throw new Error('Database insertion was not confirmed by the server.');
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to submit inquiry. Please try again.'), 'error');
    }
  };

  const email = settings?.email || 'hello@mahimdev.com';
  const whatsappHref = normalizeWhatsAppHref(settings?.whatsapp);
  const socialLinks = (settings?.socialLinks || []).filter((s) => s.visible !== false);

  return (
    <div className="space-y-16 pt-8 pb-8">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-wider text-[#00D9FF]">
              Direct Collaboration
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white">
              Contact <span className="text-gradient-purple">Me</span>
            </h1>
            <p className="font-display font-semibold text-xl text-gradient-blue">
              Let&apos;s Turn Your Idea Into Reality
            </p>
            <p className="text-base text-[#B5BCD9] leading-relaxed max-w-xl">
              Have an upcoming web application, eCommerce store, or custom admin dashboard? Send a message below or connect directly via email or WhatsApp.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={`mailto:${email}`}
                className="btn-neon-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Email Me</span>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-[#F5F5FF] bg-[#090E2C] border border-[#00E69A]/45 hover:border-[#00E69A] transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-[#00E69A]" />
                <span>WhatsApp</span>
                <ArrowRight className="w-4 h-4 text-[#00E69A]" />
              </a>
            </div>
          </div>

          {/* Right Global Remote Connectivity Visual */}
          <div className="lg:col-span-5">
            <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-5 border border-[#087BFF]/35">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#087BFF]/15 border border-[#087BFF]/40 flex items-center justify-center text-[#00D9FF]">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Global Remote Engineering
                  </h2>
                  <p className="text-xs text-[#B5BCD9]">
                    Serving clients across North America, Europe, Asia &amp; APAC
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#05081D] border border-white/10 p-4 space-y-2.5 text-xs text-[#B5BCD9]">
                <div className="flex justify-between">
                  <span>Typical First Response</span>
                  <span className="font-mono text-[#00E69A] font-semibold">&lt; 12 Hours</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.06] pt-2">
                  <span>Project Onboarding</span>
                  <span className="font-mono text-white">24 – 48 Hours</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.06] pt-2">
                  <span>Working Schedule</span>
                  <span className="text-white">{settings?.workingHours || 'Mon – Sat'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 CONTACT INFORMATION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="cosmic-card rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B19FF]/15 border border-[#8B19FF]/35 flex items-center justify-center text-[#A855F7]">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#B5BCD9]">Email Address</div>
            <a
              href={`mailto:${email}`}
              className="block font-display font-bold text-sm sm:text-base text-white hover:text-[#00D9FF] truncate"
            >
              {email}
            </a>
          </div>

          <div className="cosmic-card rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/35 flex items-center justify-center text-[#00E69A]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#B5BCD9]">WhatsApp</div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-display font-bold text-sm sm:text-base text-white hover:text-[#00E69A] truncate"
            >
              {settings?.phone || 'Direct WhatsApp Chat'}
            </a>
          </div>

          <div className="cosmic-card rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#087BFF]/15 border border-[#087BFF]/35 flex items-center justify-center text-[#00D9FF]">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#B5BCD9]">Location</div>
            <div className="font-display font-bold text-sm sm:text-base text-white">
              {settings?.location || 'Dhaka, Bangladesh · Remote'}
            </div>
          </div>

          <div className="cosmic-card rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#B5BCD9]">Working Hours</div>
            <div className="font-display font-bold text-sm sm:text-base text-white">
              {settings?.workingHours || 'Mon – Sat · 9 AM – 8 PM'}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM + SOCIAL MEDIA & LOCATION MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Validated Full Contact Form */}
          <div className="lg:col-span-7 cosmic-card rounded-3xl p-6 sm:p-8">
            <h2 className="font-display font-bold text-2xl text-white mb-2">
              Send a Project Inquiry
            </h2>
            <p className="text-sm text-[#B5BCD9] mb-6">
              Fill out the form below and your inquiry will be saved immediately to my inbox.
            </p>

            <CanvasSuccessCelebration
              show={showCelebration}
              onComplete={() => setShowCelebration(false)}
              durationMs={3000}
              title="Message Sent Successfully!"
              subtitle="Thank you for contacting us. Your message has been received."
            />

            {submittedData ? (
              <div className="rounded-2xl bg-[#05081D] border border-[#00E69A]/40 p-8 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-[#00E69A]/15 border border-[#00E69A]/40 flex items-center justify-center mx-auto text-[#00E69A] shadow-[0_0_20px_rgba(0,230,154,0.4)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-2xl text-white">
                    Message Sent Successfully!
                  </h3>
                  <p className="font-semibold text-sm text-[#00E69A]">
                    Thank you for contacting us. Your message has been received.
                  </p>
                </div>
                <p className="text-sm text-[#B5BCD9] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{submittedData.name}</strong>! Your inquiry has been securely verified and saved to the database. I will review your project requirements and follow up at{' '}
                  <strong className="text-white">{submittedData.email}</strong> shortly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="btn-neon-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:border-[#00D9FF]"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Honeypot anti-spam field */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  {...register('honeypot')}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-fullname"
                      className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="contact-fullname"
                      type="text"
                      placeholder="e.g. Sarah Khan"
                      {...register('fullName')}
                      className="w-full rounded-xl bg-[#05081D] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:outline-none focus:border-[#8B19FF]"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-400 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@company.com"
                      {...register('email')}
                      className="w-full rounded-xl bg-[#05081D] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:outline-none focus:border-[#8B19FF]"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-service"
                      className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
                    >
                      Select Service *
                    </label>
                    <select
                      id="contact-service"
                      {...register('service')}
                      className="w-full rounded-xl bg-[#05081D] border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B19FF]"
                    >
                      {services.length > 0 ? (
                        services.map((s) => (
                          <option key={s._id} value={s.title}>
                            {s.title}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="E-Commerce Development">E-Commerce Development</option>
                          <option value="Business Website">Business Website</option>
                          <option value="SaaS Applications">SaaS Applications</option>
                          <option value="Custom Admin Dashboards">Custom Admin Dashboards</option>
                        </>
                      )}
                      <option value="General Inquiry">General / Custom Project</option>
                    </select>
                    {errors.service && (
                      <p className="text-xs text-rose-400 mt-1">{errors.service.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
                    >
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="Project scope or timeline"
                      {...register('subject')}
                      className="w-full rounded-xl bg-[#05081D] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:outline-none focus:border-[#8B19FF]"
                    />
                    {errors.subject && (
                      <p className="text-xs text-rose-400 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
                  >
                    Project Details / Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Share your project goals, key features, target launch timeline, or budget range..."
                    {...register('message')}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:outline-none focus:border-[#8B19FF] resize-y"
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-400 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-neon-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Inquiry...' : 'Send Message'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Social Links + Regional Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="cosmic-card rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-xl text-white">
                Connect on Social Media
              </h3>
              <p className="text-xs text-[#B5BCD9]">
                Follow open-source repositories, technical articles, and community updates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={social._id || idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#05081D] border border-white/10 hover:border-[#8B19FF] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#8B19FF]/15 flex items-center justify-center text-[#00D9FF] shrink-0">
                      <DynamicIcon name={social.icon || social.platform} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">
                      {social.platform}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Configurable Regional Location Map */}
            <div className="cosmic-card rounded-3xl overflow-hidden p-3 space-y-3">
              <div className="px-3 pt-2 flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white">
                  Regional Base
                </h3>
                <span className="text-xs text-[#B5BCD9]">
                  {settings?.location || 'Remote Worldwide'}
                </span>
              </div>
              {settings?.mapEmbedUrl ? (
                <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#05081D]">
                  <iframe
                    title="Developer Regional Location Map"
                    src={settings.mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0 opacity-85 contrast-125"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] rounded-2xl bg-[#05081D] flex items-center justify-center text-xs text-[#B5BCD9]">
                  Configure Map Embed URL in Admin Site Settings
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* EXPANDABLE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <p className="text-xs font-semibold text-[#00D9FF]">Common Questions</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Frequently Asked <span className="text-gradient-purple">Questions</span>
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq._id;
            return (
              <div
                key={faq._id}
                className="cosmic-card rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqId(isOpen ? null : faq._id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display font-bold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#00D9FF] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#B5BCD9] leading-relaxed border-t border-white/[0.06]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL READY TO START CTA */}
      <ContactCtaBanner
        showQuickForm={false}
        headingPrefix="Ready to Start Your"
        headingHighlight="Project?"
      />
    </div>
  );
};
