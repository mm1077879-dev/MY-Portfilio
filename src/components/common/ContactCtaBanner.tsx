import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MessageCircle, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import {
  quickContactSchema,
  type QuickContactValues,
} from '../../validations/clientSchemas';
import { normalizeWhatsAppHref } from '../../utils/portfolioLogic';
import { ResilientImage } from './ResilientImage';
import { CanvasSuccessCelebration } from './CanvasSuccessCelebration';

const MOUNTAIN_BG = '/src/assets/images/contact_mountain_horizon_1793526372399.jpg';

interface ContactCtaBannerProps {
  showQuickForm?: boolean;
  headingPrefix?: string;
  headingHighlight?: string;
}

export const ContactCtaBanner: React.FC<ContactCtaBannerProps> = ({
  showQuickForm = true,
  headingPrefix = "Have an Idea? Let's Turn It Into",
  headingHighlight = 'Value.',
}) => {
  const { settings } = useSiteSettings();
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickContactValues>({
    resolver: zodResolver(quickContactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      message: '',
    },
  });

  const onQuickSubmit = async (values: QuickContactValues) => {
    try {
      const res = await apiClient.post('/messages', {
        fullName: values.fullName,
        email: values.email,
        service: 'Quick Project Inquiry',
        subject: `Quick Inquiry from ${values.fullName}`,
        message: values.message,
      });
      if (res.status === 201 && res.data?.data?.id) {
        setSubmitted(true);
        reset();
        setShowCelebration(true);
        showToast('Message sent and saved to database successfully!', 'success');
      } else {
        throw new Error('Database insertion was not confirmed by the server.');
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Could not send message. Please try again.'), 'error');
    }
  };

  const email = settings?.email || 'hello@mahimdev.com';
  const whatsappUrl = normalizeWhatsAppHref(settings?.whatsapp);

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-[#8B19FF]/30 bg-[#070B24] shadow-[0_24px_70px_-15px_rgba(139,25,255,0.28)]">
          {/* Atmospheric mountain horizon artwork on left blending into #070B24 */}
          <div className="absolute inset-0 pointer-events-none">
            <ResilientImage
              src={MOUNTAIN_BG}
              alt="Mountain summit at twilight"
              className="w-full lg:w-3/5 h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030514]/30 via-[#070B24]/82 to-[#070B24]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030514]/85 via-transparent to-[#030514]/35" />
          </div>

          <div
            className={`relative z-10 p-6 sm:p-10 lg:p-12 grid gap-10 items-center ${
              showQuickForm ? 'lg:grid-cols-12' : 'lg:grid-cols-1 text-center'
            }`}
          >
            {/* Left / Center CTA Column */}
            <div className={showQuickForm ? 'lg:col-span-7 space-y-5' : 'max-w-2xl mx-auto space-y-5'}>
              <p className="text-xs font-semibold tracking-wider text-[#00D9FF]">
                Get In Touch
              </p>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#F5F5FF] leading-tight text-balance">
                {headingPrefix}{' '}
                <span className="text-gradient-purple">{headingHighlight}</span>
              </h2>
              <p className="text-sm sm:text-base text-[#B5BCD9] max-w-xl leading-relaxed">
                Reach out to discuss your project, get a quote, or just say hello! Every inquiry is stored directly in my project inbox.
              </p>

              <div
                className={`flex flex-wrap items-center gap-3.5 pt-2 ${
                  showQuickForm ? '' : 'justify-center'
                }`}
              >
                <a
                  href={`mailto:${email}`}
                  className="btn-neon-primary inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap shrink-0"
                >
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-[#F5F5FF] bg-[#090E2C]/90 border border-[#00E69A]/45 hover:border-[#00E69A] hover:bg-[#00E69A]/10 transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-[#00E69A]" />
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 text-[#00E69A]" />
                </a>
              </div>
            </div>

            {/* Right Quick Contact Form matching Homepage Reference Image */}
            {showQuickForm && (
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#090E2C]/90 border border-[#8B19FF]/30 p-5 sm:p-6 backdrop-blur-xl">
                  <CanvasSuccessCelebration
                    show={showCelebration}
                    onComplete={() => setShowCelebration(false)}
                    durationMs={3000}
                    title="Message Sent Successfully!"
                    subtitle="Thank you for contacting us. Your message has been received."
                  />

                  {submitted ? (
                    <div className="py-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#00E69A]/15 border border-[#00E69A]/40 flex items-center justify-center mx-auto text-[#00E69A] shadow-[0_0_20px_rgba(0,230,154,0.35)]">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg text-white">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-xs text-[#00E69A] font-semibold">
                          Thank you for contacting us. Your message has been received.
                        </p>
                      </div>
                      <p className="text-xs text-[#B5BCD9] leading-relaxed">
                        Your inquiry has been stored directly into the database. I will review it and reply as soon as possible.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="text-xs font-semibold text-[#00D9FF] hover:underline pt-1 cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onQuickSubmit)} className="space-y-3.5" noValidate>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="quick-name" className="sr-only">
                            Your Name
                          </label>
                          <input
                            id="quick-name"
                            type="text"
                            placeholder="Your Name"
                            {...register('fullName')}
                            className="w-full rounded-xl bg-[#05081D] border border-white/12 px-3.5 py-2.5 text-sm text-[#F5F5FF] placeholder:text-[#B5BCD9]/55 focus:outline-none focus:border-[#8B19FF]"
                          />
                          {errors.fullName && (
                            <p className="text-[11px] text-rose-400 mt-1">
                              {errors.fullName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="quick-email" className="sr-only">
                            Your Email
                          </label>
                          <input
                            id="quick-email"
                            type="email"
                            placeholder="Your Email"
                            {...register('email')}
                            className="w-full rounded-xl bg-[#05081D] border border-white/12 px-3.5 py-2.5 text-sm text-[#F5F5FF] placeholder:text-[#B5BCD9]/55 focus:outline-none focus:border-[#8B19FF]"
                          />
                          {errors.email && (
                            <p className="text-[11px] text-rose-400 mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="quick-message" className="sr-only">
                          Your Message
                        </label>
                        <textarea
                          id="quick-message"
                          rows={3}
                          placeholder="Your Message"
                          {...register('message')}
                          className="w-full rounded-xl bg-[#05081D] border border-white/12 px-3.5 py-2.5 text-sm text-[#F5F5FF] placeholder:text-[#B5BCD9]/55 focus:outline-none focus:border-[#8B19FF] resize-none"
                        />
                        {errors.message && (
                          <p className="text-[11px] text-rose-400 mt-1">
                            {errors.message.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-neon-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
