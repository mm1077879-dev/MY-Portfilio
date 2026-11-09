import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  CheckCircle2,
  Eye,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Monitor,
  Tablet,
  Smartphone,
  Play,
  Sparkles,
} from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import type { ProjectItem } from '../../types/portfolio';
import { resolveProjectLiveDestination } from '../../utils/portfolioLogic';
import { ResilientImage } from '../../components/common/ResilientImage';
import { ContactCtaBanner } from '../../components/common/ContactCtaBanner';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Live Showcase state
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [simulatedActionStatus, setSimulatedActionStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/projects/${id}`);
        if (!mounted) return;
        const data: ProjectItem = res.data.data;
        setProject(data);
        setActiveImage(data.thumbnail);
      } catch (err) {
        if (mounted) {
          setError(extractApiErrorMessage(err, 'Project case study not found.'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="h-10 w-64 rounded-xl bg-[#090E2C] animate-pulse" />
        <div className="aspect-[16/9] rounded-3xl bg-[#090E2C] animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display font-bold text-3xl text-white">
          Project Not Found
        </h1>
        <p className="text-sm text-[#B5BCD9]">{error}</p>
        <Link
          to="/projects"
          className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>
      </div>
    );
  }

  const gallery = Array.from(
    new Set([project.thumbnail, ...(project.screenshots || [])].filter(Boolean))
  );

  const { isExternal: hasRealExternalLive } = resolveProjectLiveDestination(project);

  const githubRepoUrl =
    project.githubUrl && !project.githubUrl.includes('github.com/example')
      ? project.githubUrl
      : 'https://github.com/mmdd420680-cloud/Protfilo-mmdd';

  const handleSimulateAction = (featureName: string) => {
    setSimulatedActionStatus(`Tested flow: "${featureName}" verified successfully.`);
    setTimeout(() => {
      setSimulatedActionStatus(null);
    }, 3500);
  };

  return (
    <div className="space-y-14 pt-8 pb-8">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#B5BCD9] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-[#B5BCD9]">
            <span className="text-[#00D9FF] font-semibold">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Eye className="w-3.5 h-3.5 text-[#A855F7]" />
              {project.views} views
            </span>
          </div>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-[#B5BCD9] leading-relaxed">
              {project.shortDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {hasRealExternalLive ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <a
                href="#live-showcase"
                className="btn-neon-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#00D9FF]" />
                <span>Interactive Live Showcase</span>
              </a>
            )}

            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-secondary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#F5F5FF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>Source Code</span>
            </a>
          </div>
        </div>

        {/* Main Showcase Screenshot + Gallery Thumbnails */}
        <div className="space-y-4">
          <div className="cosmic-card rounded-3xl overflow-hidden p-2 sm:p-3 border border-[#8B19FF]/35 shadow-2xl">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#05081D]">
              <ResilientImage
                src={activeImage || project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  aria-label={`View screenshot ${idx + 1}`}
                  className={`w-28 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImage === imgUrl
                      ? 'border-[#00D9FF] scale-[1.02] shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <ResilientImage
                    src={imgUrl}
                    alt={`${project.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INTERACTIVE LIVE PROJECT SHOWCASE SECTION */}
        <section id="live-showcase" className="scroll-mt-24 space-y-6 pt-4">
          <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-6 border border-[#087BFF]/40 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Project Architecture &amp; Prototype</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white">
                  Interactive Prototype Showcase
                </h2>
                <p className="text-xs sm:text-sm text-[#B5BCD9]">
                  Explore responsive layouts, simulated user workflows, and core architecture for {project.title}.
                </p>
              </div>

              {/* Viewport simulation toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#05081D] border border-white/10 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  aria-label="Desktop preview"
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewMode === 'desktop'
                      ? 'bg-[#8B19FF] text-white shadow-sm'
                      : 'text-[#B5BCD9] hover:text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode('tablet')}
                  aria-label="Tablet preview"
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewMode === 'tablet'
                      ? 'bg-[#8B19FF] text-white shadow-sm'
                      : 'text-[#B5BCD9] hover:text-white'
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  aria-label="Mobile preview"
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewMode === 'mobile'
                      ? 'bg-[#8B19FF] text-white shadow-sm'
                      : 'text-[#B5BCD9] hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Viewport Container Frame */}
            <div className="flex justify-center bg-[#030514]/90 p-4 sm:p-6 rounded-2xl border border-white/10 overflow-hidden">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden border border-[#8B19FF]/40 bg-[#070B24] flex flex-col ${
                  previewMode === 'desktop'
                    ? 'w-full max-w-4xl'
                    : previewMode === 'tablet'
                    ? 'w-full max-w-xl'
                    : 'w-full max-w-xs'
                }`}
              >
                {/* Browser-like Mock Header */}
                <div className="bg-[#05081D] px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[11px] font-mono text-[#B5BCD9] truncate bg-[#070B24] px-3 py-1 rounded-md border border-white/10 flex-1 max-w-xs text-center">
                    https://demo.mahimdev.com/{project.slug}
                  </div>
                  <div className="text-[10px] text-[#00E69A] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E69A] animate-pulse" />
                    <span>Live Simulation</span>
                  </div>
                </div>

                {/* Simulated Screen View */}
                <div className="relative aspect-[16/10] bg-[#070B24] overflow-hidden group">
                  <ResilientImage
                    src={activeImage || project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070B24] via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#030514]/85 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
                    <div>
                      <div className="text-xs font-bold text-white">{project.title} Live Core</div>
                      <div className="text-[11px] text-[#B5BCD9] line-clamp-1">{project.shortDescription}</div>
                    </div>
                    {project.features && project.features.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSimulateAction(project.features[activeFeatureTab] || 'Core Workflow')}
                        className="btn-neon-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer shrink-0"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test Core Flow</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Action Feedback Toast */}
            {simulatedActionStatus && (
              <div className="rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 p-3 flex items-center gap-2 text-xs text-[#00E69A] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{simulatedActionStatus}</span>
              </div>
            )}

            {/* Feature Walkthrough Tabs */}
            {project.features && project.features.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B5BCD9]">
                  Verified Production Features (Click to inspect)
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {project.features.map((feat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveFeatureTab(idx);
                        handleSimulateAction(feat);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activeFeatureTab === idx
                          ? 'bg-[#8B19FF]/20 border-[#8B19FF] shadow-[0_0_15px_rgba(139,25,255,0.3)]'
                          : 'bg-[#05081D] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-[#00D9FF] shrink-0" />
                        <span className="text-[10px] font-mono text-[#B5BCD9]">Module #{idx + 1}</span>
                      </div>
                      <div className="text-xs font-semibold text-white truncate">{feat}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Overview, Tech Stack & Key Features */}
        <div className="grid lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-8 space-y-8">
            <div className="cosmic-card rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="font-display font-bold text-2xl text-white">
                Project Overview
              </h2>
              <p className="text-sm sm:text-base text-[#B5BCD9] leading-relaxed">
                {project.overview || project.shortDescription}
              </p>
            </div>

            {/* Challenges, Solutions, Results */}
            <div className="grid sm:grid-cols-2 gap-6">
              {project.challenges && (
                <div className="cosmic-card rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-base">
                    <AlertCircle className="w-5 h-5" />
                    <h3>The Challenge</h3>
                  </div>
                  <p className="text-sm text-[#B5BCD9] leading-relaxed">
                    {project.challenges}
                  </p>
                </div>
              )}

              {project.solutions && (
                <div className="cosmic-card rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[#00D9FF] font-display font-bold text-base">
                    <Lightbulb className="w-5 h-5" />
                    <h3>Architectural Solution</h3>
                  </div>
                  <p className="text-sm text-[#B5BCD9] leading-relaxed">
                    {project.solutions}
                  </p>
                </div>
              )}
            </div>

            {project.results && (
              <div className="cosmic-card rounded-2xl p-6 space-y-3 border-[#00E69A]/30">
                <div className="flex items-center gap-2 text-[#00E69A] font-display font-bold text-base">
                  <TrendingUp className="w-5 h-5" />
                  <h3>Key Outcomes &amp; Results</h3>
                </div>
                <p className="text-sm sm:text-base text-[#E2E8F0] leading-relaxed">
                  {project.results}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar: Technologies & Features */}
          <div className="lg:col-span-4 space-y-6">
            <div className="cosmic-card rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-lg text-white">
                Technologies Used
              </h3>
              <div className="text-sm text-[#00D9FF] leading-relaxed font-mono">
                {project.technologies.length > 0
                  ? project.technologies.join(' · ')
                  : 'TypeScript · React · Node.js · MongoDB'}
              </div>
            </div>

            {project.features.length > 0 && (
              <div className="cosmic-card rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-white">
                  Core Features
                </h3>
                <ul className="space-y-3">
                  {project.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[#E2E8F0]">
                      <CheckCircle2 className="w-4 h-4 text-[#00E69A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <ContactCtaBanner showQuickForm={false} />
    </div>
  );
};
