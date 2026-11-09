import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, Search, Code2, Layers, Database } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { ProjectItem } from '../../types/portfolio';
import {
  PUBLIC_PROJECT_FILTERS,
  filterProjectsList,
} from '../../utils/portfolioLogic';
import { ProjectCard } from '../../components/common/ProjectCard';
import { ContactCtaBanner } from '../../components/common/ContactCtaBanner';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All Projects');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAllProjects() {
      try {
        const res = await apiClient.get('/projects?limit=50');
        if (mounted) {
          setProjects(res.data?.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAllProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = useMemo(
    () => filterProjectsList(projects, activeCategory, searchQuery),
    [projects, activeCategory, searchQuery]
  );

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  return (
    <div className="space-y-14 pt-8 pb-8">
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
              Portfolio &amp; Case Studies
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight text-balance">
              My Featured <span className="text-gradient-purple">Projects</span>
            </h1>
            <p className="text-base text-[#B5BCD9] leading-relaxed max-w-2xl">
              Explore real-world eCommerce platforms, SaaS workspaces, custom admin dashboards, and corporate websites built with TypeScript, React, Next.js, Node.js, and MongoDB.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/contact"
                className="btn-neon-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
              >
                <Rocket className="w-4 h-4" />
                <span>Let&apos;s Work Together</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#portfolio-catalog"
                className="btn-neon-secondary inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-[#F5F5FF] whitespace-nowrap shrink-0"
              >
                <span>Explore More</span>
              </a>
            </div>
          </motion.div>

          {/* Right Developer Tech Architecture Cards */}
          <div className="lg:col-span-5 grid sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
            {[
              {
                icon: Code2,
                title: 'Frontend Engineering',
                detail: 'React · Next.js · TypeScript · Tailwind CSS',
                color: 'text-[#00D9FF]',
              },
              {
                icon: Layers,
                title: 'Backend & APIs',
                detail: 'Node.js · Express · REST v1 · JWT Security',
                color: 'text-[#A855F7]',
              },
              {
                icon: Database,
                title: 'Data & Cloud',
                detail: 'MongoDB · Mongoose · PostgreSQL · Cloud CDN',
                color: 'text-[#00E69A]',
              },
            ].map((stack, i) => {
              const Icon = stack.icon;
              return (
                <div
                  key={i}
                  className="cosmic-card rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${stack.color}`} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-white">
                      {stack.title}
                    </div>
                    <div className="text-xs text-[#B5BCD9]">{stack.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FILTER BAR & SEARCH */}
      <section id="portfolio-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#070B24]/90 border border-white/10 rounded-2xl p-3 sm:p-4">
          {/* Functional Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Project Categories"
            className="flex flex-wrap items-center gap-2"
          >
            {PUBLIC_PROJECT_FILTERS.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setVisibleCount(6);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'btn-neon-primary text-white'
                      : 'bg-[#090E2C] text-[#B5BCD9] hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#B5BCD9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or tech stack..."
              aria-label="Search projects"
              className="w-full rounded-xl bg-[#05081D] border border-white/12 pl-10 pr-4 py-2 text-xs text-[#F5F5FF] placeholder:text-[#B5BCD9]/55 focus:outline-none focus:border-[#8B19FF]"
            />
          </div>
        </div>

        {/* PROJECT CARDS GRID */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="cosmic-card rounded-2xl h-[410px] animate-pulse" />
            ))}
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="cosmic-card rounded-2xl p-12 text-center space-y-4">
            <h3 className="font-display font-bold text-xl text-white">
              No matching projects found
            </h3>
            <p className="text-sm text-[#B5BCD9] max-w-md mx-auto">
              Try clearing your search filter or switching back to All Projects.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All Projects');
                setSearchQuery('');
              }}
              className="btn-neon-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>

            {visibleCount < filteredProjects.length && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="btn-neon-secondary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
                >
                  <span>
                    Load More Projects ({filteredProjects.length - visibleCount} remaining)
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* MORE PROJECTS CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cosmic-card rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="font-display font-bold text-2xl text-white">
              Have a Custom Web App or SaaS Idea in Mind?
            </h2>
            <p className="text-sm text-[#B5BCD9]">
              Let&apos;s architect and launch your custom platform from the ground up.
            </p>
          </div>
          <Link
            to="/contact"
            className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white whitespace-nowrap shrink-0"
          >
            <span>Start a Conversation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <ContactCtaBanner showQuickForm={false} />
    </div>
  );
};
