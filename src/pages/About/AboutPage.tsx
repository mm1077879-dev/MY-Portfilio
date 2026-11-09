import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Rocket,
  ArrowRight,
  Award,
  Briefcase,
  Users,
  Smile,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import type {
  AboutData,
  TimelineMilestone,
  SkillItem,
} from '../../types/portfolio';
import { ResilientImage } from '../../components/common/ResilientImage';
import { DynamicIcon } from '../../components/common/DynamicIcon';
import { ContactCtaBanner } from '../../components/common/ContactCtaBanner';

const SKILL_CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'DevOps & Tools'] as const;

export const AboutPage: React.FC = () => {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [activeSkillCat, setActiveSkillCat] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadAbout() {
      try {
        const [aboutRes, skillRes] = await Promise.all([
          apiClient.get('/about'),
          apiClient.get('/skills'),
        ]);
        if (!mounted) return;
        setAbout(aboutRes.data?.data?.about || null);
        setTimeline(aboutRes.data?.data?.timeline || []);
        setSkills(skillRes.data?.data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAbout();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredSkills =
    activeSkillCat === 'All'
      ? skills
      : skills.filter((item) => item.category === activeSkillCat);

  const cvHref = about?.cvFileUrl || '/api/v1/about/cv-download';

  return (
    <div className="space-y-16 pt-8 pb-8">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 space-y-5"
          >
            <p className="text-xs font-semibold tracking-wider text-[#00D9FF]">
              {about?.badgeText || 'About Me'}
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#F5F5FF] leading-tight text-balance">
              {about?.headline || "Hi, I'm Mahim Dev"}
            </h1>
            <p className="font-display font-semibold text-xl text-gradient-blue">
              {about?.subtitle || 'Full-Stack Developer & Problem Solver'}
            </p>
            <p className="text-base text-[#B5BCD9] leading-relaxed">
              {about?.biography ||
                'I build modern, scalable, and business-focused full-stack applications combining TypeScript, React, Next.js, Node.js, Express, and MongoDB.'}
            </p>
            {about?.extendedBio && (
              <p className="text-sm text-[#B5BCD9]/90 leading-relaxed">
                {about.extendedBio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/contact"
                className="btn-neon-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
              >
                <Rocket className="w-4 h-4" />
                <span>Let&apos;s Work Together</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={cvHref}
                download
                className="btn-neon-secondary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#F5F5FF] whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4 text-[#00D9FF]" />
                <span>Download CV</span>
              </a>
            </div>

            {about?.trustText && (
              <div className="flex items-center gap-2 text-xs text-[#B5BCD9] pt-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E69A] shrink-0" />
                <span>{about.trustText}</span>
              </div>
            )}
          </motion.div>

          <div className="lg:col-span-5">
            <div className="cosmic-card rounded-3xl overflow-hidden p-3 border border-[#8B19FF]/35">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <ResilientImage
                  src={
                    about?.profileImage ||
                    '/src/assets/images/hero_developer_portrait_1793526368603.jpg'
                  }
                  alt={about?.developerName || 'Mahim Dev'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: 'Development Experience',
              value: about?.experienceYears || '2+ Years',
              icon: Award,
              color: 'text-[#00D9FF]',
            },
            {
              label: 'Projects Delivered',
              value: about?.projectsDelivered || '100+',
              icon: Briefcase,
              color: 'text-[#A855F7]',
            },
            {
              label: 'Happy Clients',
              value: about?.happyClients || '50+',
              icon: Users,
              color: 'text-[#00E69A]',
            },
            {
              label: 'Client Satisfaction',
              value: about?.clientSatisfaction || '99%',
              icon: Smile,
              color: 'text-amber-400',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="cosmic-card rounded-2xl p-6 flex flex-col justify-between gap-3"
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
                <div className="font-display font-extrabold text-3xl text-white tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#B5BCD9]">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MY JOURNEY TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-semibold text-[#00D9FF]">Career Milestones</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            My <span className="text-gradient-purple">Journey</span> Timeline
          </h2>
          <p className="text-sm text-[#B5BCD9]">
            Continuous growth from core web engineering to production full-stack architecture.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="cosmic-card rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative grid md:grid-cols-2 gap-6">
            {timeline.map((item) => (
              <div
                key={item._id}
                className="cosmic-card cosmic-card-hover rounded-2xl p-6 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-lg text-[#00D9FF] tabular-nums">
                    {item.year}
                  </span>
                  <span className="text-xs text-[#B5BCD9] capitalize">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs font-medium text-[#A855F7]">{item.subtitle}</p>
                )}
                <p className="text-sm text-[#B5BCD9] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TECHNICAL SKILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#00E69A]">Core Stack</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Technical <span className="text-gradient-blue">Skills</span>
            </h2>
            <p className="text-sm text-[#B5BCD9]">
              Modern technologies used to build reliable frontend and backend systems.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveSkillCat(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSkillCat === cat
                    ? 'btn-neon-primary text-white'
                    : 'bg-[#090E2C] border border-white/10 text-[#B5BCD9] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill._id}
              className="cosmic-card cosmic-card-hover rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B19FF]/15 border border-[#8B19FF]/35 flex items-center justify-center text-[#00D9FF]">
                  <DynamicIcon name={skill.icon} className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-semibold text-[#00E69A] tabular-nums">
                  {skill.proficiency}%
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-white">
                  {skill.name}
                </h3>
                <p className="text-xs text-[#B5BCD9]/75">{skill.category}</p>
              </div>

              {skill.description && (
                <p className="text-xs text-[#B5BCD9] leading-relaxed">
                  {skill.description}
                </p>
              )}

              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B19FF] to-[#00D9FF]"
                  style={{ width: `${Math.min(100, Math.max(0, skill.proficiency))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE ME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-xs font-semibold text-[#A855F7]">Engineering Standards</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Why Choose <span className="text-gradient-purple">Me</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(about?.whyChooseMe && about.whyChooseMe.length > 0
            ? about.whyChooseMe
            : [
                {
                  title: 'High Performance & Scalable Solutions',
                  description: 'Sub-second responses and clean horizontal scalability.',
                  icon: 'Zap',
                },
                {
                  title: 'Clean & Maintainable Code',
                  description: 'Modular TypeScript components and validated REST APIs.',
                  icon: 'Code2',
                },
                {
                  title: 'Business-Focused Development',
                  description: 'Engineered to maximize user trust and conversion rates.',
                  icon: 'Briefcase',
                },
                {
                  title: 'On-Time Delivery & Clear Communication',
                  description: 'Predictable milestones and transparent progress updates.',
                  icon: 'Clock',
                },
              ]
          ).map((item, idx) => (
            <div key={idx} className="cosmic-card rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#087BFF]/15 border border-[#087BFF]/35 flex items-center justify-center text-[#00D9FF]">
                <DynamicIcon name={item.icon} className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#B5BCD9] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <ContactCtaBanner showQuickForm={false} />
    </div>
  );
};
