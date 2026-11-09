import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0D1438] via-[#090E2C] to-[#1B1045] text-[#B5BCD9] p-4 text-center ${className}`}
      >
        <div className="w-11 h-11 rounded-xl bg-[#8B19FF]/20 border border-[#8B19FF]/40 flex items-center justify-center text-[#00D9FF]">
          <Code2 className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-[#F5F5FF]/90 line-clamp-1">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
