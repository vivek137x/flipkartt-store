import React from 'react';
import { Star, Heart, ShoppingCart, Eye, Zap, Truck } from 'lucide-react';
import { Product } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, p: Product) => void;
  onAddToCart: (e: React.MouseEvent, p: Product) => void;
  onBuyNow: (p: Product) => void;
  isInCart: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  isInCart,
}) => {
  const discountPercentage = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <article 
      onClick={() => onSelect(product)}
      className="group relative bg-white border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer flex flex-col h-full overflow-hidden rounded-sm"
    >
      {/* Floating Badges */}
      {product.isBestSeller && (
        <span className="absolute top-1 left-1 z-10 bg-orange-500 text-white font-bold text-[8px] uppercase px-1 py-0.5 rounded-sm shadow-xs select-none">
          BESTSELLER
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={(e) => onToggleWishlist(e, product)}
        className="absolute top-1 right-1 z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-all group-hover:scale-105 active:scale-95"
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart 
          className={`w-3 h-3 sm:w-4.5 sm:h-4.5 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-400'
          }`} 
        />
      </button>

      {/* Product Image Section with 160px Max Height limits for mobile, studio lighting backgrounds */}
      <div className="h-[145px] xs:h-[160px] sm:h-[190px] md:h-[220px] bg-gradient-to-b from-white via-white to-slate-50/80 w-full flex items-center justify-center p-2.5 sm:p-4 overflow-hidden relative border-b border-slate-100/80 group-hover:from-white group-hover:to-blue-50/10 transition-all duration-300">
        {/* Subtle radial glare simulating studio spotlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />
        
        <OptimizedImage
          src={product.images[0]}
          alt={product.title}
          category={product.category}
          imageClassName="max-h-full max-w-full transition-all duration-350 ease-out group-hover:scale-105 filter drop-shadow-[0_4px_8px_rgba(15,23,42,0.06)] group-hover:drop-shadow-[0_12px_20px_rgba(15,23,42,0.12)]"
          objectFit="contain"
        />
        
        {/* Mirror Reflection Overlay at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-white/20 to-transparent pointer-events-none mix-blend-overlay" />
        
        {/* Quick View Overlay (Hidden on mobile for clean touch interaction) */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
          <span className="bg-white/95 text-slate-800 font-bold text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-sm shadow-md border border-slate-150 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600" />
            Quick View
          </span>
        </div>
      </div>

      {/* Product Information with Compact Spacings */}
      <div className="p-1.5 xs:p-2 sm:p-3.5 flex flex-col flex-grow text-left bg-white">
        {/* Brand Name */}
        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider uppercase truncate">
          {product.brand}
        </span>

        {/* Title */}
        <h3 className="text-slate-700 font-medium text-[10px] sm:text-xs md:text-[13px] mt-0.5 line-clamp-2 h-7 sm:h-9 leading-tight group-hover:text-[#2874f0] transition-colors overflow-hidden">
          {product.title}
        </h3>

        {/* Rating Row with Flipkart-inspired f-Assured Badge */}
        <div className="flex items-center gap-1 mt-1 sm:mt-1.5 flex-wrap">
          <div className="bg-[#26a541] text-white font-bold text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-xs flex items-center gap-0.5 shadow-3xs select-none">
            <span>{product.rating}</span>
            <Star className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current text-white stroke-none" />
          </div>
          <span className="text-slate-400 text-[9px] sm:text-[11px] font-semibold">
            ({product.ratingCount.toLocaleString('en-IN')})
          </span>

          {product.assured && (
            <div className="ml-auto inline-flex items-center gap-0.5 bg-slate-50 border border-slate-100 px-1 rounded-xs py-0.5 scale-75 sm:scale-90 origin-right shrink-0" title="Flipkart Assured Guarantee">
              <span className="text-[#2874f0] font-black italic text-[8px] sm:text-[9px] tracking-tighter">f</span>
              <span className="text-[#ffe11b] font-black italic text-[8px] sm:text-[9px] tracking-tighter mr-0.5">Assured</span>
            </div>
          )}
        </div>

        {/* Pricing Layout */}
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
          <span className="text-slate-900 font-extrabold text-xs sm:text-xs md:text-sm lg:text-base">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="text-slate-400 line-through text-[9px] sm:text-[10px] md:text-[11px]">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-[#26a541] font-bold text-[9px] sm:text-[10px] md:text-xs">
                {discountPercentage}% off
              </span>
            </>
          )}
        </div>

        {/* Flipkart-Style Delivery Section */}
        <div className="flex items-center gap-1 mt-1 select-none">
          <Truck className="w-3 h-3 text-[10px] text-[#26a541] shrink-0" />
          <span className="text-[9px] sm:text-[10px] text-[#26a541] font-bold tracking-wide">
            Free Delivery <span className="text-slate-400 font-normal">in 5 Days</span>
          </span>
        </div>

        {/* Additional Mini highlights (Hidden entirely on mobile for ultra-compact screen layout) */}
        <ul className="hidden md:block mt-2.5 space-y-1 border-t border-slate-100/80 pt-2 bg-white">
          {product.highlights.slice(0, 2).map((hl, i) => (
            <li key={i} className="text-[10px] text-slate-500 truncate list-none pl-0">
              • {hl}
            </li>
          ))}
        </ul>

        {/* Action Button Section in Flipkart Brand Colors (Compact and non-overflowing) */}
        <div className="mt-auto pt-2 flex gap-1 sm:gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(e, product);
            }}
            className={`flex-1 text-[8px] sm:text-[10px] font-bold py-1.5 transition-all border px-1 rounded-sm flex items-center justify-center gap-0.5 sm:gap-1 uppercase tracking-wide cursor-pointer select-none truncate ${
              isInCart
                ? 'bg-[#ffe11b] border-[#ffe11b] text-slate-900 hover:bg-yellow-400'
                : 'bg-white border-[#2874f0]/30 text-[#2874f0] hover:bg-blue-50/50 hover:border-[#2874f0]'
            }`}
          >
            <ShoppingCart className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[2.5]" />
            <span className="truncate">{isInCart ? 'In Cart' : 'Add'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            className="flex-1 text-[8px] sm:text-[10px] font-bold py-1.5 transition-all bg-[#fb641b] border border-[#fb641b] text-white hover:bg-orange-600 px-1 rounded-sm flex items-center justify-center gap-0.5 sm:gap-1 uppercase tracking-wide cursor-pointer select-none shadow-3xs truncate"
          >
            <Zap className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[2.5] fill-current text-white" />
            <span className="truncate">Buy</span>
          </button>
        </div>
      </div>
    </article>
  );
};
