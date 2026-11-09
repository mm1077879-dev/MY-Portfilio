import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  name?: string;
  subtitle?: string;
  logoUrl?: string;
  to?: string;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  name = 'Mahim Dev',
  subtitle = 'Full-Stack Developer',
  logoUrl,
  to = '/',
  compact = false,
}) => {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-3 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B19FF] rounded-lg"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-9 h-9 rounded-lg object-cover border border-[#8B19FF]/40"
        />
      ) : (
        <div className="relative w-9 h-9 rounded-lg bg-[#070B24] border border-[#087BFF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(8,123,255,0.35)] group-hover:border-[#00D9FF]/70 transition-colors">
          <svg
            viewBox="0 0 40 40"
            className="w-6 h-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="brandM1" x1="4" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00D9FF" />
                <stop offset="55%" stopColor="#087BFF" />
                <stop offset="100%" stopColor="#8B19FF" />
              </linearGradient>
            </defs>
            <path
              d="M6 31V9L20 22L34 9V31H27.5V18.5L20 25.5L12.5 18.5V31H6Z"
              fill="url(#brandM1)"
            />
          </svg>
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-base sm:text-[17px] tracking-tight text-[#F5F5FF] group-hover:text-white transition-colors">
          {name}
        </span>
        {!compact && subtitle && (
          <span className="text-[11px] font-medium text-[#B5BCD9]/85 tracking-wide">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
};
