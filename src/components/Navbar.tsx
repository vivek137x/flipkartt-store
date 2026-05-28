import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, ClipboardList, Menu, X, ChevronDown, HelpCircle, ShieldAlert } from 'lucide-react';
import { Product } from '../types';
import { FlipkartLogo } from './FlipkartLogo';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'shop' | 'cart' | 'wishlist' | 'orders';
  setActiveTab: (tab: 'shop' | 'cart' | 'wishlist' | 'orders') => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAdmin: () => void;
  isLoggedIn?: boolean;
  setIsLoggedIn?: (isLoggedIn: boolean) => void;
  userName?: string;
  setUserName?: (userName: string) => void;
  showLoginModal?: boolean;
  setShowLoginModal?: (showLoginModal: boolean) => void;
  settings?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  products,
  onSelectProduct,
  onOpenAdmin,
  settings,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter recommendations based on search term
  const suggestions = searchQuery.trim()
    ? products
        .filter((p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleSuggestionClick = (p: Product) => {
    onSelectProduct(p);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveTab('shop');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-[56px] gap-4">
          
          {/* Flipkart Yellow/Blue Brand Logo - Compact scaled layout on mobile */}
          <div 
            className="flex items-center gap-1 select-none shrink-0 cursor-pointer scale-[0.85] xs:scale-95 sm:scale-100 origin-left" 
            onClick={() => { setActiveTab('shop'); setSearchQuery(''); }}
          >
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Store custom logo" className="h-9 max-w-[150px] object-contain invert-0 brightness-110" referrerPolicy="no-referrer" />
            ) : (
              <FlipkartLogo variant="light" />
            )}
          </div>

          {/* Search Bar - Exact Flipkart centered layout */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:block relative flex-1 max-w-xl mx-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for accessories, garments, premium gadgets and more..."
                className="w-full h-9 px-4 pr-12 text-slate-800 bg-white placeholder-slate-400 rounded-sm text-sm focus:outline-none focus:ring-0 shadow-sm border-0"
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <button 
                type="submit" 
                className="absolute right-0 top-0 h-full px-3.5 text-[#2874f0] hover:text-blue-800 flex items-center justify-center transition-colors"
                aria-label="Submit search entry"
              >
                <Search className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Suggestions list dropdown overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl overflow-hidden max-h-80 z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                <div className="p-2 text-[10px] font-bold text-slate-400 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
                  Recommended gadgets
                </div>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSuggestionClick(p)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-all text-left"
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      className="w-8 h-8 rounded object-cover border border-slate-100 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-700 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <strong className="text-[#2874f0]">₹{p.price.toLocaleString('en-IN')}</strong>
                        <span>•</span>
                        <span>{p.categoryLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            
            <button
              onClick={() => setActiveTab('shop')}
              className={`text-sm font-bold tracking-wide hover:text-yellow-200 transition-colors py-1 cursor-pointer ${
                activeTab === 'shop' ? 'text-[#ffe11b]' : 'text-white'
              }`}
            >
              Shop
            </button>

            {/* Track Registered Orders cargo */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-sm font-bold hover:text-yellow-200 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders' ? 'text-[#ffe11b]' : 'text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-300" />
              <span>Track Orders</span>
            </button>

            {/* Wishlist triggers */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`text-sm font-bold hover:text-yellow-200 transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wishlist' ? 'text-[#ffe11b]' : 'text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-400 text-red-400' : 'text-white'}`} />
              <span>Wishlist ({wishlistCount})</span>
            </button>

            {/* Help & warranties overview */}
            <div className="relative group animate-none">
              <button className="flex items-center gap-1 text-sm font-bold hover:text-yellow-200 transition-colors py-1 cursor-pointer">
                <span>Support</span>
                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
              </button>
              {/* Hover bridge wrapper using transparent pt-2 to provide a continuous cursor corridor */}
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50 animate-in fade-in-50 duration-150">
                <div className="bg-white border border-slate-200 rounded shadow-xl text-slate-800 text-xs py-1.5 text-left font-medium">
                  <button 
                    onClick={() => alert('Flipkart Secure Trust shield is currently operating on automatic modes across all products.')} 
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    🛡️ Assured Shield
                  </button>
                  <button 
                    onClick={() => alert('Direct bank-to-bank UPI transfers secured via cryptographic end-to-end checksum protocols (VPA & Transaction ID / UTR verification).')} 
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    💳 UPI Payment Security
                  </button>
                  <button 
                    onClick={onOpenAdmin} 
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-[#2874f0] hover:text-blue-700 font-black border-t border-slate-100/80 cursor-pointer"
                  >
                    🔐 Admin Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Yellow Cart button badge (classic design) */}
            <button
              onClick={() => setActiveTab('cart')}
              className="flex items-center gap-2 bg-[#ffe11b] hover:bg-yellow-400 text-slate-900 font-black px-5 h-8 rounded-sm transition-all shadow-sm group active:scale-95 cursor-pointer text-xs md:text-sm"
            >
              <div className="relative">
                <ShoppingCart className="w-4.5 h-4.5 text-slate-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3.5 bg-red-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-yellow-400 shadow animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>My Cart</span>
            </button>
          </nav>

          {/* Quick-action Mobile indicators with proper spacing & 44px touch-friendly targets */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2.5">
            <button 
              onClick={() => setActiveTab('wishlist')} 
              className="relative p-2.5 rounded hover:bg-[#1a65df] transition-colors focus:ring-1 focus:ring-white/30"
              aria-label="Toggle user wishlist panel"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-yellow-300 text-yellow-300' : 'text-white'}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-black text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('cart')} 
              className="relative p-2.5 rounded hover:bg-[#1a65df] transition-colors focus:ring-1 focus:ring-white/30"
              aria-label="Toggle shopping cart summaries"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#ffe11b] text-slate-950 font-black text-[8px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2.5 rounded hover:bg-[#1a65df] transition-colors focus:ring-1 focus:ring-white/30"
              aria-label="Toggle side drawer menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search block (below simple bar) */}
        <div className="md:hidden pb-3 pt-0.5">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search accessories, garments & more..."
              className="w-full h-8.5 px-3.5 pr-10 text-slate-800 bg-white placeholder-slate-400 rounded-sm text-xs focus:outline-none focus:ring-0 shadow-sm border-0"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 h-full px-3 text-[#2874f0] flex items-center justify-center"
              aria-label="Search submit"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Mobile suggested product overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg overflow-hidden max-h-72 z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 text-left">
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSuggestionClick(p)}
                    className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
                  >
                    <img src={p.images[0]} alt={p.title} className="w-7 h-7 rounded object-cover border border-slate-100 flex-shrink-0" referrerPolicy="no-referrer" />
                    <span className="flex-1 truncate font-medium text-slate-700">{p.title}</span>
                    <span className="font-extrabold text-[#2874f0]">₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Mobile Menu side panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e5bc1] bg-[#1a5bc2]/95 backdrop-blur-md text-white animate-in slide-in-from-top duration-200">
          <div className="px-5 py-4 space-y-4 text-left">
            
            <button
              onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full text-left py-1 text-sm font-bold ${activeTab === 'shop' ? 'text-[#ffe11b]' : 'text-blue-50'}`}
            >
              <div className="w-2 h-2 rounded-full bg-[#ffe11b]"></div>
              Browse Flipkart ₹99 Shop
            </button>
            
            <button
              onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full text-left py-1 text-sm font-bold ${activeTab === 'wishlist' ? 'text-[#ffe11b]' : 'text-blue-50'}`}
            >
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              My Wishlist Products ({wishlistCount})
            </button>
            
            <button
              onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full text-left py-1 text-sm font-bold ${activeTab === 'orders' ? 'text-[#ffe11b]' : 'text-blue-50'}`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-300" />
              My Cargo Shipped Orders
            </button>
            
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full text-left py-1 text-sm font-bold text-yellow-300"
            >
              <ShieldAlert className="w-4 h-4 text-yellow-300" />
              🔐 Admin Dashboard Panel
            </button>
            
            <hr className="border-blue-400/30" />
            
            <div className="text-[10px] text-blue-200 font-bold uppercase tracking-widest text-center select-none py-1">
              ⚡ Direct UPI Payments Enabled
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
