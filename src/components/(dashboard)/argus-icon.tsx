import React from 'react';

export interface ArgusIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Reusable Argus brand SVG icon.
 * 
 * Features a minimalist Binance-gold rounded block housing an architectural
 * diamond aperture and centered focal guardian pupil.
 */
export function ArgusIcon({
  size,
  className = 'size-4 text-theme-brand-binance',
  ...props
}: ArgusIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="4.5" fill="currentColor" />
      <path d="M12 7L16 12L12 17L8 12L12 7Z" fill="var(--theme-bg-overlay, #0a0a0a)" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" />
    </svg>
  );
}
