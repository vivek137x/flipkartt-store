import React, { useEffect } from 'react';

interface FlipkartLogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' means white/yellow text for blue/dark backgrounds, 'dark' means blue/gold text for white/light backgrounds
  showSubtitle?: boolean;
  onClick?: () => void;
}

/**
 * Authentic Flipkart Shopping Bag Icon (Official design)
 * Vibrant yellow background with customized speed lines of Royal Blue and Orange/Yellow.
 */
export const FlipkartIcon: React.FC<{ className?: string; strokeColor?: string; fillColor?: string; starColor?: string }> = ({
  className = 'w-8 h-8',
}) => (
  <svg 
    className={`inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 select-none ${className}`} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clean gradient/shadow back drop */}
    <defs>
      <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE01B" />
        <stop offset="100%" stopColor="#FFC200" />
      </linearGradient>
      <linearGradient id="trailsGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#047BD5" />
        <stop offset="100%" stopColor="#2874F0" />
      </linearGradient>
    </defs>

    {/* Authentic angled and curved Flipkart Shopping Bag Body */}
    <path 
      d="M18,34 C18,30 21.2,27 25,27 L75,27 C78.8,27 82,30 82,34 L88,77 C88.5,82.5 83.5,87 78,87 L22,87 C16.5,87 11.5,82.5 12,77 L18,34 Z" 
      fill="url(#bagGradient)" 
      filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.1))"
    />

    {/* Bag Handles - exact proportions */}
    <path 
      d="M38,27 M38,27 C38,15 43,12 50,12 C57,12 62,15 62,27" 
      stroke="#1E5BC4" 
      strokeWidth="4.5" 
      strokeLinecap="round" 
      fill="none"
    />

    {/* Speed Trails Swoosh (the iconic blue & white motion graphic inside Flipkart's bag) */}
    <path 
      d="M24,46 C34,46 45,39 52,43 C58,46.5 54,58 64,54 C72,50.8 74,40 76,44" 
      stroke="#FFFFFF" 
      strokeWidth="6" 
      strokeLinecap="round" 
      fill="none"
    />
    <path 
      d="M30,55 C38,55 46,50 51,53 C56,56 53,65 61,62 C67,59.6 69,51 71,53" 
      stroke="url(#trailsGradient)" 
      strokeWidth="5" 
      strokeLinecap="round" 
      fill="none"
    />

    {/* Dynamic brand star */}
    <polygon 
      points="68,36 71,41 77,41 72,45 74,51 68,47 62,51 64,45 59,41 65,41" 
      fill="#FF6000" 
    />
  </svg>
);

/**
 * High-quality authentic star for "Explore Plus"
 */
export const PlusStarIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-3 h-3',
  color = '#ffe11b'
}) => (
  <svg 
    className={`inline-block select-none animate-pulse ${className}`} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color: color }}
  >
    {/* Official asymmetric plus-star design */}
    <path d="M12 2L14.8 8.6L22 9.2L16.5 13.8L18.2 20.8L12 17L5.8 20.8L7.5 13.8L2 9.2L9.2 8.6L12 2Z" />
  </svg>
);

/**
 * Unified responsive Flipkart Logo component with official styling & typography
 */
export const FlipkartLogo: React.FC<FlipkartLogoProps> = ({
  className = '',
  variant = 'light',
  showSubtitle = true,
  onClick
}) => {
  const isLight = variant === 'light';

  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-2.5 select-none font-sans shrink-0 transition-opacity duration-200 cursor-pointer ${className}`}
    >
      {/* Official 3D-Look Icon */}
      <div className="relative flex items-center justify-center transform group-hover:-translate-y-0.5 transition-transform duration-300">
        <FlipkartIcon className="w-8 h-8 md:w-9 md:h-9" />
        {/* Subtle premium gold aura on hover */}
        <span className="absolute -inset-1 rounded-full bg-yellow-400/15 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col items-start text-left">
        <span className="font-sans font-black italic text-xl md:text-2xl leading-none tracking-tight flex items-center">
          {/* F-l-i-p in White or Iconic blue */}
          <span className={isLight ? 'text-white font-extrabold' : 'text-[#2874f0] font-extrabold'}>Flip</span>
          {/* k-a-r-t in Vibrant Yellow or Gold */}
          <span className={isLight ? 'text-[#ffe11b] font-black' : 'text-[#ff9f00] font-black'}>kart</span>
        </span>
        
        {showSubtitle && (
          <span className={`text-[9px] md:text-[10px] italic flex items-center gap-0.5 mt-0.5 font-bold tracking-tight hover:underline ${isLight ? 'text-slate-100' : 'text-slate-500'}`}>
            Explore <span className={`${isLight ? 'text-[#ffe11b]' : 'text-[#ff9f00]'} font-extrabold ml-0.5`}>Plus</span>
            <PlusStarIcon 
              className="w-3 h-3 ml-0.5" 
              color={isLight ? '#ffe11b' : '#ff9f00'}
            />
          </span>
        )}
      </div>
    </div>
  );
};

// Also export the legacy name to prevent import errors during phase-in
export { FlipkartLogo as FlipcartLogo };
export { FlipkartIcon as FlipcartIcon };

/**
 * Hook to dynamically load official Flipkart favicon on browser tabs
 */
export const useFavicon = () => {
  useEffect(() => {
    // Highly-optimized official SVG favicon code matching the official shopping bag
    const faviconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="28" fill="#2874f0" />
        <path d="M46 41 C46 27, 51 22, 60 22 C69 22, 74 27, 74 41" fill="none" stroke="#ffe11b" stroke-width="6.5" stroke-linecap="round" />
        <path d="M26 49 C26 44.5 29.5 41 34 41 L86 41 C90.5 41 94 44.5 94 49 L100 93 C100.5 99 95 104 89 104 L31 104 C25 104 19.5 99 20 93 L26 49 Z" fill="linear-gradient(135deg, #FFE01B 0%, #FFC200 100%)" />
        <!-- internal trails -->
        <path d="M33 62 C43 62 53 55 60 59 C66 62.5 62 74 72 70 C80 66.8 82 56 84 60" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" fill="none" />
        <path d="M39 71 C47 71 55 66 60 69 C65 72 62 81 70 78 C76 75.6 78 67 80 69" stroke="#1057c7" stroke-width="5" stroke-linecap="round" fill="none" />
        <polygon points="76,51 79,56 85,56 80,60 82,66 76,62 70,66 72,60 67,56 73,56" fill="#FF6000" />
      </svg>
    `;
    const blob = new Blob([faviconSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Replace all rel=icon link tags dynamically
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
    if (links.length > 0) {
      links.forEach(link => {
        link.type = 'image/svg+xml';
        link.href = url;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = url;
      document.head.appendChild(link);
    }
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);
};
