import React, { useState, useEffect } from 'react';

// Solid, high-availability, extremely reliable backup image assets for each category
const CATEGORY_FALLBACKS: Record<string, string> = {
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  laptops: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  smartwatches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  speakers: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
  accessories: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  'mens-fashion': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  'womens-fashion': 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80',
  fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  grooming: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
};

// Ultimate global fallback if category maps miss or fail too
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  containerClassName?: string;
  imageClassName?: string;
  objectFit?: 'contain' | 'cover';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = 'Product image',
  category = 'all',
  containerClassName = '',
  imageClassName = '',
  objectFit = 'contain',
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);

  // Sync internal src with prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    if (hasError) return; // Prevent infinite error handler triggers

    setHasError(true);
    setLoading(false);

    // Swap to specific category backdrop, or absolute final tech backdrop
    const catFallback = CATEGORY_FALLBACKS[category] || DEFAULT_FALLBACK;
    setCurrentSrc(catFallback);
  };

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center bg-slate-50 w-full h-full ${containerClassName}`}
    >
      {/* Skeletons Shimmer Effect */}
      {loading && (
        <div 
          className="absolute inset-0 bg-slate-100 animate-pulse flex flex-col items-center justify-center p-4"
          aria-hidden="true"
        >
          {/* Internal shape layout simulating the product silhouette */}
          <div className="w-16 h-16 bg-slate-200/80 rounded-sm mb-2" />
          <div className="w-1/2 h-2.5 bg-slate-200/80 rounded mb-1.5" />
          <div className="w-1/3 h-2 bg-slate-200/80 rounded" />
          {/* Subtle clean shimmer lines */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* Actual Responsive Image tag with optimized properties */}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-all duration-300 ease-in-out ${
          objectFit === 'contain' ? 'object-contain' : 'object-cover'
        } ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${imageClassName}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        {...rest}
      />
    </div>
  );
};
