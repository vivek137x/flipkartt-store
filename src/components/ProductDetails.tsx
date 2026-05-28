import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Star, Heart, ShoppingCart, Zap, CheckCircle2, Shield, RefreshCw, X, Send, Award,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Product, Review } from '../types';
import { OptimizedImage } from './OptimizedImage';

export function getProductGalleryImages(product: { id: string; category: string; images: string[] }): string[] {
  // We define specific high-quality product angle & lifestyle images by category.
  const poolByCategory: Record<string, string[]> = {
    smartphones: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80', // front angle
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80', // back camera/case
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80', // front display glowing
      'https://images.unsplash.com/photo-1565849328230-72594458397a?auto=format&fit=crop&w=600&q=80', // detailed charging bezel
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'  // hands usage lifestyle
    ],
    laptops: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', // silver metal screen
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80', // colorful keyboard lit
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80', // closed front view profile
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', // dynamic ultra slim angle
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=600&q=80'  // lifestyle workspace
    ],
    smartwatches: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80', // side angle/leather
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80', // full clock screen top
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80', // active tracking dials
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80', // fit look on wrist
      'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=600&q=80'  // dial crown closeup
    ],
    headphones: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=600&q=80', // premium buds details
      'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&w=600&q=80', // dual overhead specs
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80', // immersive workspace audio
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', // lifestyle wearing buds
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=600&q=80'  // neckband design
    ],
    gaming: [
      'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=600&q=80', // mouse top profiles
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80', // key switches close
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80', // controller handheld
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'  // lit screen set
    ],
    speakers: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', // wooden vintage front
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', // rear layout
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80', // speaker strap details
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80'  // controls top metal
    ],
    accessories: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80', // white fast charging brick
      'https://images.unsplash.com/photo-1619120238346-978e07731e77?auto=format&fit=crop&w=600&q=80', // double braided connection fast-line
      'https://images.unsplash.com/photo-1622445262465-248197fe910e?auto=format&fit=crop&w=600&q=80'  // flat layout pad
    ],
    'mens-fashion': [
      'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?auto=format&fit=crop&w=600&q=80', // flatlay folded items
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80', // checks model style
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80', // texture weave details
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80'  // street fashion apparel
    ],
    'womens-fashion': [
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80', // full flow look fabric
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80', // chic studio style details
      'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=600&q=80'  // back design close zoom
    ],
    fitness: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', // metal chrome weights
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80', // athlete run tracker
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80'  // premium trainer item details
    ],
    grooming: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80', // trimmer precision gears detail
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80', // face cream box display
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80'  // blow dry close zoom
    ]
  };

  const baseImages = (product.images || []).filter(img => typeof img === 'string' && img.trim().length > 0);
  const pool = poolByCategory[product.category] || poolByCategory['smartphones'];
  const finalImagesSet = new Set<string>();

  baseImages.forEach(img => finalImagesSet.add(img));

  for (let i = 0; i < pool.length; i++) {
    if (finalImagesSet.size >= 5) break;
    finalImagesSet.add(pool[i]);
  }

  if (finalImagesSet.size < 3) {
    poolByCategory['smartphones'].forEach(img => {
      if (finalImagesSet.size < 4) finalImagesSet.add(img);
    });
  }

  return Array.from(finalImagesSet);
}

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isInCart: boolean;
  onAddReview: (review: Review) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  isInCart,
  onAddReview,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewFormVisible, setReviewFormVisible] = useState(false);

  // Hover zoom states (Magnifying glass effect)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Touch Swipe states for Mobile Gallery
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Dynamic realistic image set matching user request 4 & 5
  const enrichedImages = useMemo(() => {
    return getProductGalleryImages(product);
  }, [product]);

  // Keep state matching the loaded product index
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

  const discountPercentage = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const review: Review = {
      id: `rev-user-${Date.now()}`,
      userName: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      verified: true
    };

    onAddReview(review);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewFormVisible(false);
  };

  // Cursor offset calculation for zoom focus origin
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Navigation handlers for next/prev
  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % enrichedImages.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + enrichedImages.length) % enrichedImages.length);
  };

  // Swipe gesture listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start md:items-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded border border-slate-300 w-full max-w-5xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-4 md:p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            
            {/* Left Column: Image Gallery & Top Buy Controls (45%) */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              {/* Flipkart/Amazon-style Image Gallery Grid */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Thumbnails list or scroll row */}
                <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 justify-start select-none no-scrollbar shrink-0 max-h-[400px]">
                  {enrichedImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      onMouseEnter={() => setActiveImageIndex(i)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 p-1 rounded-sm border bg-white focus:outline-none transition-all duration-150 shrink-0 overflow-hidden relative cursor-pointer ${
                        activeImageIndex === i 
                          ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-400 hover:shadow-2xs'
                      }`}
                      aria-label={`View product image ${i + 1}`}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

                {/* Main Large Product Image */}
                <div className="order-1 md:order-2 flex-grow relative aspect-square bg-slate-50 border border-slate-150 rounded flex items-center justify-center p-4 overflow-hidden select-none">
                  <div 
                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in overflow-hidden"
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={enrichedImages[activeImageIndex]}
                      alt={product.title}
                      className={`max-h-full max-w-full object-contain transition-transform duration-100 ease-out pointer-events-none md:pointer-events-auto ${
                        isZooming ? 'scale-[2.4]' : 'scale-100'
                      }`}
                      style={
                        isZooming 
                          ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } 
                          : undefined
                      }
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {product.assured && (
                    <div className="absolute top-3 left-3 z-10 flex items-center bg-[#2874f0] text-white font-black text-[9px] px-2 py-0.5 rounded shadow-3xs select-none">
                      f Assured
                    </div>
                  )}

                  {/* Left & Right Arrow icons on Mobile/Desktop overlay */}
                  {enrichedImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow border border-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-90 hover:scale-105"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow border border-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-90 hover:scale-105"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </>
                  )}

                  {/* Dot Bullet Pagination Overlay for mobile/desktop track feedback */}
                  {enrichedImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-slate-900/30 px-2 py-1 rounded-full backdrop-blur-xs select-none">
                      {enrichedImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                            activeImageIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Core Store Promises card */}
              <div className="grid grid-cols-3 gap-2 py-4 px-3 bg-slate-50 rounded border border-slate-100 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">Genuine Brand</span>
                  <span className="text-[9px] text-slate-400">100% Quality Products</span>
                </div>
                <div className="flex flex-col items-center border-x border-slate-200">
                  <RefreshCw className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">Easy Returns</span>
                  <span className="text-[9px] text-slate-400">7 Days Return Guarantee</span>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-5 h-5 text-yellow-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">Fast Delivery</span>
                  <span className="text-[9px] text-slate-400">Free Home Shipping</span>
                </div>
              </div>

              {/* Add to Cart / Wishlist Actions block */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onAddToCart}
                  className={`flex-1 font-bold py-3 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-all shadow active:scale-[0.98] text-xs md:text-sm ${
                    isInCart
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                      : 'bg-yellow-550 hover:bg-yellow-500 text-slate-900 bg-yellow-500 font-semibold'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isInCart ? 'VIEW IN CART' : 'ADD TO CART'}</span>
                </button>

                <button
                  onClick={onBuyNow}
                  className="flex-1 font-bold py-3 px-3 rounded-sm bg-[#fb641b] hover:bg-orange-600 text-white flex items-center justify-center gap-1.5 transition-all shadow active:scale-[0.98] text-xs md:text-sm font-semibold"
                >
                  <Zap className="w-4 h-4 fill-current text-white" />
                  <span>BUY NOW</span>
                </button>

                <button
                  onClick={onToggleWishlist}
                  className={`px-3 md:px-4 rounded-sm border shadow-sm flex items-center justify-center transition-all ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                  }`}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right Column: Detailed Stats & Content Specs (55%) */}
            <div className="md:col-span-7 flex flex-col space-y-6 text-left">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.brand} • {product.categoryLabel}
                </span>
                <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 mt-2 leading-snug">
                  {product.title}
                </h1>

                {/* Rating layout */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <div className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5 rounded flex items-center gap-0.5">
                    <span>{product.rating}</span>
                    <Star className="w-3 h-3 fill-white text-white" />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">
                    {product.ratingCount.toLocaleString('en-IN')} Ratings & {product.reviewCount.toLocaleString('en-IN')} Reviews
                  </span>
                  {product.assured && (
                    <span className="bg-yellow-300 text-slate-950 font-black text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded border border-yellow-400">
                      Assured
                    </span>
                  )}
                </div>
              </div>

              {/* Price bracket card */}
              <div className="bg-slate-50 p-4 rounded border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">SPECIAL OFFER PRICE</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-slate-400 line-through font-medium text-sm">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-emerald-600 font-extrabold text-base">
                        {discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Currently in Stock ({product.stock} items available) • Eligible for FREE Delivery.</span>
                </div>
              </div>

              {/* Bank offers box */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Available Bank Offers</h3>
                <ul className="mt-2 space-y-1.5">
                  <li className="text-xs text-slate-600 flex items-start gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bank Offer:</strong> Get 10% instant discount up to ₹1,500 on all major credit card transactions.</span>
                  </li>
                  <li className="text-xs text-slate-600 flex items-start gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Cost EMI:</strong> Start EMI options from ₹5,400/month. No downpayment required.</span>
                  </li>
                </ul>
              </div>

              {/* Key Highlights Section */}
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1">
                  Product Highlights
                </h2>
                <ul className="mt-2.5 space-y-1.5">
                  {product.highlights.map((hl, i) => (
                    <li key={i} className="text-xs md:text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Specifications Section */}
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1">
                  Specifications
                </h2>
                <div className="mt-2.5 border border-slate-100 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr 
                          key={i} 
                          className={`border-b border-slate-50 last:border-0 ${
                            i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                          }`}
                        >
                          <td className="w-1/3 p-2.5 font-semibold text-slate-400">{spec.label}</td>
                          <td className="w-2/3 p-2.5 text-slate-700">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Ratings & Reviews
                  </h2>
                  <button
                    onClick={() => setReviewFormVisible(!reviewFormVisible)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {reviewFormVisible ? 'Cancel Adding' : 'Write a Review'}
                  </button>
                </div>

                {/* Review Form */}
                {reviewFormVisible && (
                  <form onSubmit={handleReviewSubmit} className="bg-blue-50/50 border border-blue-100 rounded p-4 space-y-3">
                    <div className="font-semibold text-xs text-blue-800">ADD YET ANOTHER REVIEW</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">YOUR DISPLAY NAME</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aman S"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs rounded focus:outline-none focus:border-blue-500"
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">RATING STARS</label>
                        <select
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs rounded focus:outline-none focus:border-blue-500 font-semibold"
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        >
                          <option value={5}>5 Stars - Outstanding</option>
                          <option value={4}>4 Stars - Very Good</option>
                          <option value={3}>3 Stars - Satisfactory</option>
                          <option value={2}>2 Stars - Poor Quality</option>
                          <option value={1}>1 Star - Horrible</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1 font-sans">WRITTEN REACTION COMMENT</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Share your personal performance, look, feel or features review..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs rounded focus:outline-none focus:border-blue-500"
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish Review
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {product.reviews.length === 0 ? (
                    <div className="text-slate-400 text-xs text-center py-4 bg-slate-50 italic rounded">
                      No customer reviews yet. Be the first to write!
                    </div>
                  ) : (
                    product.reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className={`text-white text-[10px] font-bold px-1.5 rounded flex items-center gap-0.5 ${
                            rev.rating >= 4 ? 'bg-emerald-600' : rev.rating === 3 ? 'bg-orange-500' : 'bg-red-500'
                          }`}>
                            <span>{rev.rating}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                          <span className="font-bold text-xs text-slate-700">{rev.userName}</span>
                          {rev.verified && (
                            <span className="text-emerald-600 font-bold text-[9px] bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 uppercase scale-90">
                              Verified
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto">{rev.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
