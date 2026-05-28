import React from 'react';
import { Heart, ShoppingCart, Trash2, Tag, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface WishlistViewProps {
  wishlistedItems: Product[];
  onRemoveFromWishlist: (p: Product) => void;
  onMoveToCart: (p: Product) => void;
  onBrowseProducts: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistedItems,
  onRemoveFromWishlist,
  onMoveToCart,
  onBrowseProducts,
}) => {
  if (wishlistedItems.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-800">Your Wishlist is Empty!</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto font-sans">
          Save your favorite smart gadgets, smartphones, or gaming mice here so you do not miss premium price drops or stock refill alerts.
        </p>
        <button
          onClick={onBrowseProducts}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded shadow hover:shadow-lg transition-all"
        >
          Explore Gadgets Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 py-6 text-left">
      <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-current" />
        My Saved Wishlist ({wishlistedItems.length} items)
      </h2>

      <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100 shadow-sm overflow-hidden">
        {wishlistedItems.map((p) => {
          const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);

          return (
            <div key={p.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              
              {/* Product Photo */}
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded p-1.5 flex items-center justify-center shrink-0 overflow-hidden relative">
                <OptimizedImage src={p.images[0]} alt={p.title} category={p.category} imageClassName="max-h-full max-w-full" objectFit="contain" />
              </div>

              {/* Product Info */}
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.brand}</span>
                  {p.assured && (
                    <span className="bg-blue-50 text-blue-600 font-extrabold text-[8px] px-1 py-0.5 rounded border border-blue-100 uppercase">
                      Assured
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-800 text-sm md:text-base hover:text-blue-600 cursor-pointer transition-colors leading-tight">
                  {p.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    {p.rating}
                    <Heart className="w-2.5 h-2.5 fill-current text-white scale-75" />
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">
                    ({p.ratingCount.toLocaleString('en-IN')} ratings)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1.5">
                  <span className="text-slate-900 font-bold text-sm md:text-base">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  {p.mrp > p.price && (
                    <>
                      <span className="text-slate-400 line-through text-xs">
                        ₹{p.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-emerald-600 font-bold text-xs">
                        {discountPercent}% Off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <button
                  onClick={() => onMoveToCart(p)}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span>MOVE TO CART</span>
                </button>

                <button
                  onClick={() => onRemoveFromWishlist(p)}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded py-2 px-3 transition-colors flex items-center justify-center gap-1.5 border border-transparent"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>REMOVE</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
