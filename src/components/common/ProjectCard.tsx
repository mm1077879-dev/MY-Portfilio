import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { ProjectItem } from '../../types/portfolio';
import { resolveProjectLiveDestination } from '../../utils/portfolioLogic';
import { ResilientImage } from './ResilientImage';

interface ProjectCardProps {
  project: ProjectItem;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const detailPath = `/projects/${project.slug || project._id}`;
  const { isExternal: isExternalLive, destination: liveHref } = resolveProjectLiveDestination(project);

  return (
    <article className="cosmic-card cosmic-card-hover rounded-2xl overflow-hidden flex flex-col h-full group">
      {/* Thumbnail showcase container — Clickable to project case study */}
      <Link
        to={detailPath}
        aria-label={`View ${project.title} project details`}
        className="relative aspect-[16/10] overflow-hidden bg-[#070B24] border-b border-[#8B19FF]/20 block cursor-pointer"
      >
        <ResilientImage
          src={project.thumbnail}
          alt={`${project.title} preview`}
          fallbackLabel={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090E2C] via-[#090E2C]/20 to-transparent pointer-events-none" />

        {/* Category overlay label */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-block px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-[#8B19FF]/90 text-white shadow-lg">
            {project.category}
          </span>
        </div>

        {/* Top-right action button */}
        {isExternalLive ? (
          <a
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${project.title} live site`}
            className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-lg bg-[#070B24]/90 border border-white/20 flex items-center justify-center text-[#F5F5FF] hover:border-[#00D9FF] hover:text-[#00D9FF] transition-colors shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div
            aria-hidden="true"
            className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-lg bg-[#070B24]/90 border border-white/20 flex items-center justify-center text-[#F5F5FF] group-hover:border-[#00D9FF] group-hover:text-[#00D9FF] transition-colors shadow-md"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </Link>

      {/* Content body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-bold text-xl text-[#F5F5FF] group-hover:text-[#00D9FF] transition-colors">
            <Link to={detailPath}>{project.title}</Link>
          </h3>
          <Link
            to={detailPath}
            aria-label={`Inspect ${project.title} case study`}
            className="w-7 h-7 rounded-md bg-[#0E1640] border border-[#087BFF]/35 flex items-center justify-center text-[#00D9FF] hover:bg-[#087BFF]/20 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-sm text-[#B5BCD9] leading-relaxed mb-4 line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Feature list with glowing checkmarks */}
        {project.features && project.features.length > 0 && (
          <ul className="space-y-2 mb-5 flex-1">
            {project.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13px] text-[#E2E8F0]">
                <CheckCircle2 className="w-4 h-4 text-[#8B19FF] shrink-0" />
                <span className="truncate">{feat}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tech metadata */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="text-[11px] text-[#B5BCD9]/75 mb-4 truncate font-mono">
            {project.technologies.slice(0, 4).join(' · ')}
          </div>
        )}

        {/* Bottom CTA row */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
          {isExternalLive ? (
            <a
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Live Preview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <Link
              to={detailPath}
              className="btn-neon-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Live Preview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <span className="text-white/15 select-none" aria-hidden="true">
            |
          </span>

          <Link
            to={detailPath}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5F5FF] hover:text-[#00D9FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Case Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
