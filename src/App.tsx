import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, Sparkles, TrendingUp, RotateCcw, Award, Zap, CheckCircle2, 
  ChevronLeft, ChevronRight, Bookmark, X, BookOpen, Heart, ShoppingBag, 
  Clock, Shield, Star, ArrowRight, Truck
} from 'lucide-react';
import { Product, CartItem, Order, FilterState, adjustProductMobilePrice } from './types';
import { PRODUCTS, CATEGORIES } from './data';

// Component imports
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { CartView } from './components/CartView';
import { WishlistView } from './components/WishlistView';
import { CheckoutView } from './components/CheckoutView';
import { OrdersView } from './components/OrdersView';
import { AdminView } from './components/AdminView';
import { FlipkartLogo, useFavicon } from './components/FlipkartLogo';

// Pre-seeded mock order for instant, interactive tracking visualization
const PRE_SEEDED_ORDER: Order = {
  id: 'TZ-2026-9482',
  date: '18 May 2026',
  items: [
    {
      product: PRODUCTS.find((p) => p.id === 'phone-03') || PRODUCTS[2],
      quantity: 1,
    },
    {
      product: PRODUCTS.find((p) => p.id === 'watch-02') || PRODUCTS[6],
      quantity: 1,
    }
  ],
  totalAmount: 1598, // 1499 + 99 (no packaging fee)
  status: 'shipped',
  paymentMethod: 'UPI',
  shippingAddress: {
    fullName: 'Aman Sharma',
    phone: '+91 98765 43210',
    addressLine: '123 Tech-Forward Avenue, Sector-3, HSR Layout',
    city: 'Bengaluru',
    pincode: '560001',
    state: 'Karnataka',
  }
};

export default function App() {
  // Activate browser tab favicon dynamically
  useFavicon();

  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<'shop' | 'cart' | 'wishlist' | 'orders'>('shop');

  // Lifted authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('techzone_is_logged_in') === 'true';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('techzone_user_name') || '';
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  // Cart, Wishlist, Orders list - loaded from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('techzone_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistedItems, setWishlistedItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('techzone_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('techzone_orders');
    return saved ? JSON.parse(saved) : [PRE_SEEDED_ORDER];
  });

  // Search & Categories & Details State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [cashfreeVerificationId, setCashfreeVerificationId] = useState<string | null>(null);
  const [isAdminActive, setIsAdminActive] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#/admin';
  });

  // Automated URL parameter parsing for Cashfree redirect callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const paymentStatus = params.get('payment');
    if (orderId) {
      console.log(`[CASHFREE INTERCEPT] Redirect callback order detected of ID: ${orderId}`);
      setCashfreeVerificationId(orderId);
      setCheckoutActive(true);

      // If payment=success, verify on backend and mark as paid
      if (paymentStatus === 'success') {
        fetch('/api/cashfree/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              console.log('[CASHFREE] Payment verified successfully:', orderId);
            }
          })
          .catch(err => console.error('[CASHFREE] verify error:', err));
      }

      // Clean browser history URL parameter so refreshing does not trigger double validation requests
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  useEffect(() => {
    const handleLocationRouter = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        setIsAdminActive(true);
      } else {
        setIsAdminActive(false);
      }
    };
    window.addEventListener('popstate', handleLocationRouter);
    return () => window.removeEventListener('popstate', handleLocationRouter);
  }, []);

  const handleOpenAdminView = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminActive(true);
  };

  const handleCloseAdminView = () => {
    window.history.pushState({}, '', '/');
    setIsAdminActive(false);
  };

  // Open checkout for regular cart:
  const handleOpenCartCheckout = () => {
    setCheckoutItems([...cartItems]);
    setCheckoutActive(true);
  };

  // Open checkout for a single product (Buy Now):
  const handleBuyNow = (product: Product) => {
    setCheckoutItems([{ product, quantity: 1 }]);
    setCheckoutActive(true);
  };

  // Products state matching dynamic database changes (no hardcoded overrides)
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [settings, setSettings] = useState<any>({
    logoUrl: '',
    promoHeadline: '',
    promoSubheadline: '',
    homepageBanners: []
  });

  const fetchShopData = React.useCallback(async () => {
    try {
      const resProj = await fetch('/api/admin/products');
      const dataProj = await resProj.json();
      if (dataProj.success && dataProj.products) {
        setAllProducts(dataProj.products.map(adjustProductMobilePrice));
      }
    } catch (e) {
      console.warn('Product database fetch failed. Falling back to local storage sync.');
      const saved = localStorage.getItem('techzone_products_db');
      if (saved) {
        setAllProducts(JSON.parse(saved).map(adjustProductMobilePrice));
      }
    }

    try {
      const resOrder = await fetch('/api/admin/orders');
      const dataOrder = await resOrder.json();
      if (dataOrder.success && dataOrder.orders) {
        setOrders(dataOrder.orders);
      }
    } catch (e) {
      console.warn('Order database fetch failed.');
    }

    try {
      const resSets = await fetch('/api/admin/settings');
      const dataSets = await resSets.json();
      if (dataSets.success && dataSets.settings) {
        setSettings(dataSets.settings);
      }
    } catch (e) {
      console.warn('Settings database fetch failed.');
    }
  }, []);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  // Promotional Banner slider state
  const [bannerIndex, setBannerIndex] = useState(0);
  const banners = [
    {
      title: 'LATEST FASHION MEGAPORT - FLAT ₹99!',
      tagline: 'Trendy Roadster shirts, luxury ZARA dresses, US Polo tees, Levi\'s jeans, and BIBA sets at flat ₹99!',
      bg: 'from-[#ec4899] via-[#d946ef] to-[#8b5cf6]',
      badge: '90%+ OFF LATEST TRENDS',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80',
      cta: 'Shop Fashion Parade'
    },
    {
      title: 'BIG BILLION SAVINGS: FLAT ₹99 EXTREME STORE!',
      tagline: 'Samsung S24 Ultra, Apple M3 MacBooks, boAt Rockerz - All Flat ₹99!',
      bg: 'from-[#0f172a] via-[#1e3a8a] to-[#2874f0]',
      badge: 'FLIPCART PLUS EXCLUSIVE',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
      cta: 'Flat 90%+ Off'
    },
    {
      title: 'BOAT BASSHEADS AUDIO ZONE - FLAT ₹99',
      tagline: 'Bass-boosted Earbuds, Bluetooth Neckbands, and portable speakers at unbelievable prices!',
      bg: 'from-[#881337] via-[#dc2626] to-[#fb7185]',
      badge: 'OFFICIAL BRAND DEALS',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80',
      cta: 'Shop boAt Specials'
    },
    {
      title: 'PREMIUM CHARGERS & HIGH CELL POWER BANKS',
      tagline: 'Warp Adapters, multi-device fast charge accessories & certified backup power hub combo!',
      bg: 'from-[#115e59] via-[#0d9488] to-[#2dd4bf]',
      badge: 'ACCESSORIES MEGAFEST',
      image: 'https://images.unsplash.com/photo-1609592424083-d9eb7ef2bd4f?auto=format&fit=crop&w=300&q=80',
      cta: 'Browse Adapters'
    },
    {
      title: 'ACTIVE GYM & INTENSE GROOMING CARNIVAL - FLAT ₹99',
      tagline: 'Professional hex dumbbells, MuscleBlaze whey, Nike training bags, & premium dermatological face washes - flat ₹99!',
      bg: 'from-[#b45309] via-[#f59e0b] to-[#10b981]',
      badge: 'FITNESS & WELLNESS EXTRAVAGANZA',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80',
      cta: 'Explore Fitness & Grooming'
    }
  ];

  // Live countdown timer state for Dial of the Day
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 42, seconds: 29 });

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const categoryMetaData: Record<string, { bg: string; text: string; image: string }> = {
    all: { bg: 'bg-slate-100', text: 'text-slate-700', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80' },
    smartphones: { bg: 'bg-[#e3f2fd]', text: 'text-[#0d47a1]', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=120&q=80' },
    laptops: { bg: 'bg-[#f3e5f5]', text: 'text-[#4a148c]', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=120&q=80' },
    smartwatches: { bg: 'bg-[#efebe9]', text: 'text-[#3e2723]', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=120&q=80' },
    headphones: { bg: 'bg-[#e8f5e9]', text: 'text-[#1b5e20]', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80' },
    gaming: { bg: 'bg-[#fff3e0]', text: 'text-[#e65100]', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=120&q=80' },
    speakers: { bg: 'bg-[#fbe9e7]', text: 'text-[#bf360c]', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=120&q=80' },
    accessories: { bg: 'bg-[#e0f7fa]', text: 'text-[#006064]', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=120&q=80' },
    'mens-fashion': { bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=120&q=80' },
    'womens-fashion': { bg: 'bg-[#fce7f3]', text: 'text-[#be185d]', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=120&q=80' },
    fitness: { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=120&q=80' },
    grooming: { bg: 'bg-[#fdf2f8]', text: 'text-[#db2777]', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=120&q=80' }
  };

  // Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 200000 });
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>('popularity');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('techzone_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('techzone_wishlist', JSON.stringify(wishlistedItems));
  }, [wishlistedItems]);

  useEffect(() => {
    localStorage.setItem('techzone_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('techzone_products_db', JSON.stringify(allProducts));
  }, [allProducts]);

  // Auto-slide banners
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Extract all available brands inside dataset to display in sidebar
  const brandList = useMemo(() => {
    const brands = new Set<string>();
    allProducts.forEach((p) => brands.add(p.brand));
    return Array.from(brands);
  }, [allProducts]);

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Brand Filters
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Price Filter
    result = result.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);

    // Keyword Search query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sorting block
    if (sortBy === 'popularity') {
      result.sort((a, b) => b.ratingCount - a.ratingCount);
    } else if (sortBy === 'price_low_high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high_low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allProducts, activeCategory, selectedBrands, minRating, priceRange, searchQuery, sortBy]);

  // Cart Management
  const handleAddToCart = (e: React.MouseEvent | null, p: Product) => {
    if (e) e.stopPropagation();
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === p.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist Management
  const handleToggleWishlist = (e: React.MouseEvent | null, p: Product) => {
    if (e) e.stopPropagation();

    setWishlistedItems((prev) => {
      const isBookmarked = prev.some((item) => item.id === p.id);
      if (isBookmarked) {
        return prev.filter((item) => item.id !== p.id);
      } else {
        return [...prev, p];
      }
    });
  };

  const handleMoveToCart = (p: Product) => {
    // Add to cart
    handleAddToCart(null, p);
    // Remove from wishlist
    setWishlistedItems((prev) => prev.filter((item) => item.id !== p.id));
  };

  // Order placement
  const handlePlaceOrderSubmit = (
    shippingDetails: {
      fullName: string;
      phone: string;
      addressLine: string;
      city: string;
      pincode: string;
      state: string;
      paymentMethod: string;
    },
    itemsToOrder: CartItem[]
  ) => {
    const totalAmount = itemsToOrder.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    
    const newOrder: Order = {
      id: `TZ-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      items: [...itemsToOrder],
      totalAmount,
      status: 'ordered',
      paymentMethod: shippingDetails.paymentMethod,
      shippingAddress: shippingDetails,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Persist new verified UPI payment order directly to server database
    fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(err => console.warn('[App] Server orders db sync warning:', err));

    // Only clear the cart if the user actually ordered their main cart contents
    const isMainCart =
      cartItems.length === itemsToOrder.length &&
      cartItems.every(
        (val, i) =>
          val.product.id === itemsToOrder[i].product.id &&
          val.quantity === itemsToOrder[i].quantity
      );

    if (isMainCart) {
      setCartItems([]); // Clear cart
    }

    setCheckoutActive(false);
    setActiveTab('orders'); // Jump directly to track shipping
  };

  // Shipments cycle status advances (Simulator Toolbox)
  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          let nextStatus: Order['status'] = o.status;
          if (o.status === 'ordered') nextStatus = 'shipped';
          else if (o.status === 'shipped') nextStatus = 'out_for_delivery';
          else if (o.status === 'out_for_delivery') nextStatus = 'delivered';
          
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  // Review Submissions
  const handleAddReview = (newReview: any) => {
    if (!selectedProduct) return;

    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id === selectedProduct.id) {
          return {
            ...p,
            reviews: [newReview, ...p.reviews],
            ratingCount: p.ratingCount + 1,
            // Adjust overall rating slightly toward the new review rating for high fidelity feel
            rating: Number(((p.rating * p.ratingCount + newReview.rating) / (p.ratingCount + 1)).toFixed(1))
          };
        }
        return p;
      })
    );

    // Keep the details panel product reference in sync too
    setSelectedProduct((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        reviews: [newReview, ...prev.reviews],
        ratingCount: prev.ratingCount + 1,
        rating: Number(((prev.rating * prev.ratingCount + newReview.rating) / (prev.ratingCount + 1)).toFixed(1))
      };
    });
  };

  const handleSelectProductFromSuggestions = (p: Product) => {
    setSelectedProduct(p);
  };

  // Clear all filter tags to default
  const handleResetFilters = () => {
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 200000 });
    setMinRating(0);
    setSortBy('popularity');
    setActiveCategory('all');
  };

  if (isAdminActive) {
    return (
      <AdminView 
        products={allProducts} 
        setProducts={(valOrFn) => {
          if (typeof valOrFn === 'function') {
            setAllProducts((prev) => {
              const res = (valOrFn as any)(prev);
              return res.map(adjustProductMobilePrice);
            });
          } else {
            setAllProducts((valOrFn as any).map(adjustProductMobilePrice));
          }
        }}
        orders={orders} 
        setOrders={setOrders} 
        onClose={handleCloseAdminView}
      />
    );
  }

  const bannerList = settings?.homepageBanners && settings.homepageBanners.length > 0 
    ? settings.homepageBanners 
    : banners;
  const currentBanner = bannerList[bannerIndex] || bannerList[0] || banners[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Brand Header & Quick suggestions row */}
      <Navbar
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistedItems.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCheckoutActive(false);
        }}
        products={allProducts}
        onSelectProduct={handleSelectProductFromSuggestions}
        onOpenAdmin={handleOpenAdminView}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        userName={userName}
        setUserName={setUserName}
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        settings={settings}
      />

      {/* Main Container contents - Optimized compact margins and paddings for small mobile screens */}
      <main className="flex-grow py-2 sm:py-6 max-w-7xl mx-auto w-full px-1.5 xs:px-2.5 sm:px-4 md:px-6">
        
        {/* SHOPPING TAB PORT */}
        {activeTab === 'shop' && !checkoutActive && (
          <div className="space-y-3 sm:space-y-6">
            
            {/* Top Category Deck in Actual Flipcart Mobile/Desktop Row Wheel */}
            <section className="bg-white border border-slate-150 rounded-sm shadow-xs flex items-center justify-start sm:justify-around gap-4 sm:gap-6 md:gap-8 overflow-x-auto p-2 sm:p-4 py-2 sm:py-4 md:py-5 min-w-full no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const meta = categoryMetaData[cat.id] || { bg: 'bg-slate-50', text: 'text-slate-700', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80' };
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer text-center relative"
                    style={{ minWidth: '85px' }}
                  >
                    {/* Circle Image Wrapper */}
                    <div className={`w-14 h-14 md:w-[68px] md:h-[68px] rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
                      isActive 
                        ? 'ring-2 ring-[#2874f0] scale-105 shadow-md bg-white' 
                        : 'group-hover:scale-105 shadow-2xs border border-slate-100 bg-white'
                    } ${meta.bg}`}>
                      <img 
                        src={meta.image} 
                        alt={cat.label} 
                        className="w-10/12 h-10/12 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Category Label */}
                    <span className={`text-[11px] md:text-xs font-bold leading-tight tracking-tight transition-colors ${
                      isActive 
                        ? 'text-[#2874f0]' 
                        : 'text-slate-700 group-hover:text-[#2874f0]'
                    }`}>
                      {cat.label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 w-6 h-0.5 bg-[#2874f0] rounded-full" />
                    )}
                  </button>
                );
              })}
            </section>

            {/* UPGRADED HERO MARKETING ADVERTISEMENTS CAROUSEL */}
            <section className={`relative overflow-hidden rounded-sm bg-gradient-to-r ${currentBanner.bg} text-white p-6 md:p-8 min-h-[180px] md:min-h-[250px] flex items-center shadow-xs transition-all duration-500`}>
              
              {/* Background accent decor lines */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              
              {/* Main flex layout for text on left, floating image on right */}
              <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-6 relative z-10">
                <div className="space-y-3.5 max-w-xl text-left">
                  <div className="inline-flex items-center gap-1.5 bg-[#ffe11b] text-slate-900 font-black text-[10px] tracking-wider px-2.5 py-1 rounded-sm uppercase">
                    <Sparkles className="w-3.5 h-3.5 fill-current animate-spin-slow" />
                    {currentBanner.badge}
                  </div>
                  
                  <h2 className="text-xl md:text-3xl font-black tracking-tight pt-1 leading-tight text-white drop-shadow-sm uppercase">
                    {currentBanner.title}
                  </h2>
                  
                  <p className="text-xs md:text-sm text-blue-100 font-semibold max-w-lg leading-relaxed">
                    {currentBanner.tagline}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-4">
                    <button 
                      onClick={() => setActiveCategory('all')} 
                      className="bg-[#ffe11b] text-slate-900 hover:bg-yellow-400 font-extrabold text-xs px-5 py-2.5 rounded-sm transition-all shadow-md group tracking-wide active:scale-95 cursor-pointer uppercase flex items-center gap-1.5"
                    >
                      <span>{currentBanner.cta}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
                    </button>
                    <span className="text-[11px] font-bold text-yellow-300 bg-white/10 px-3 py-1.5 rounded-sm border border-white/10">
                      ⚡ Flat ₹99 Deal Store
                    </span>
                  </div>
                </div>

                {/* Right side floating promotional graphic overlay */}
                <div className="hidden md:block w-48 h-48 lg:w-56 lg:h-56 shrink-0 relative bg-white/10 p-2 rounded-sm backdrop-blur-xs border border-white/10 select-none transform hover:rotate-2 transition-transform">
                  <div className="absolute top-2 left-2 bg-[#ff6161] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-xs uppercase">
                    MEGA DEAL
                  </div>
                  <img 
                    src={currentBanner.image} 
                    alt="Current banner promotional view" 
                    className="w-full h-full object-contain rounded-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#26a541] font-black text-white px-3 py-1 rounded-sm text-xs shadow-md">
                    ₹99 ONLY
                  </div>
                </div>
              </div>

              {/* Slider dot navigation controls */}
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <button 
                  onClick={() => setBannerIndex((prev) => (prev - 1 + bannerList.length) % bannerList.length)}
                  className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
                  aria-label="Previous Offer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1.5 px-1">
                  {bannerList.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setBannerIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all focus:outline-none ${bannerIndex === i ? 'bg-[#ffe11b] w-4' : 'bg-white/40 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setBannerIndex((prev) => (prev + 1) % bannerList.length)}
                  className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
                  aria-label="Next Offer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* DEAL OF THE DAY TICKER MODULE (Actual Flipkart Urgency Bar) */}
            <section className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-3xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff6161] animate-pulse"></span>
                  Deals of the Day
                </span>
                
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                
                {/* Live clock countdown with red blocks */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ends in:</span>
                  
                  {/* Hours block */}
                  <div className="bg-red-50 text-[#ff6161] text-xs font-black px-1.5 py-0.5 rounded-xs font-mono">
                    {countdown.hours.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">:</span>
                  {/* Minutes block */}
                  <div className="bg-red-50 text-[#ff6161] text-xs font-black px-1.5 py-0.5 rounded-xs font-mono">
                    {countdown.minutes.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">:</span>
                  {/* Seconds block */}
                  <div className="bg-red-50 text-[#ff6161] text-xs font-black px-1.5 py-0.5 rounded-xs font-mono animate-pulse">
                    {countdown.seconds.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t border-slate-50 pt-2 sm:pt-0 sm:border-none">
                <div className="text-xs font-semibold text-emerald-650 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  Every single item in stock drop-down to flat ₹99!
                </div>
                <button 
                  onClick={() => {
                    setActiveCategory('all');
                    handleResetFilters();
                  }}
                  className="bg-[#2874f0] hover:bg-[#1a5bc2] text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-sm transition-all shadow-3xs cursor-pointer active:scale-95 text-center shrink-0"
                >
                  View All Brand Deals
                </button>
              </div>
            </section>

            {/* Split Page: Full Width Product Grid Layout */}
            <div className="w-full">
              
              {/* PRODUCTS LIST GRID (Full Width) */}
              <section className="w-full space-y-4">
                
                {/* Search result count overview info */}
                <div className="flex justify-between items-center bg-white border border-slate-200 rounded p-3.5 shadow-sm text-left">
                  <div>
                    <h3 className="font-bold text-sm text-slate-700">
                      Showing {filteredProducts.length} Premium Gadgets
                    </h3>
                    <p className="text-slate-405 text-[11px]">
                      {activeCategory === 'all' ? 'All categories combined' : `Category: ${activeCategory}`} 
                      {searchQuery ? ` • Search keyword: "${searchQuery}"` : ''}
                    </p>
                  </div>
                  
                  {/* Clean up filter shortcuts if any set */}
                  {(selectedBrands.length > 0 || activeCategory !== 'all' || minRating > 0 || searchQuery !== '') && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 py-1 px-3 border border-red-200 rounded transition-colors"
                    >
                      Clear Criteria
                    </button>
                  )}
                </div>

                {/* Empty product list case */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-sm p-12 text-center shadow-sm space-y-4">
                    <p className="text-slate-400 text-sm font-sans">
                      No gadgets match your current selection. Try clicking "Reset All" or selecting a different category.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded shadow"
                    >
                      Show All Available Products
                    </button>
                  </div>
                ) : (
                  // Grid itself with responsive columns: exactly 2 on mobile, 3 on tablet, 4 on desktop, and 5 on large desktop
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-4 md:gap-5 w-full">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onSelect={(p) => setSelectedProduct(p)}
                        isWishlisted={wishlistedItems.some((w) => w.id === prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isInCart={cartItems.some((c) => c.product.id === prod.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

            </div>

          </div>
        )}

        {/* SHOPPING CART VIEW PORT */}
        {activeTab === 'cart' && !checkoutActive && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onPlaceOrder={handleOpenCartCheckout}
            onBrowseProducts={() => setActiveTab('shop')}
          />
        )}

        {/* SHOP CHECKOUT WINDOW PORT */}
        {checkoutActive && (
          <CheckoutView
            cartItems={checkoutItems}
            onSubmitOrder={(shippingDetails) => handlePlaceOrderSubmit(shippingDetails, checkoutItems)}
            onCancel={() => {
              setCheckoutActive(false);
              setCashfreeVerificationId(null);
            }}
            settings={settings}
            cashfreeVerificationId={cashfreeVerificationId}
            onClearCart={() => setCartItems([])}
          />
        )}

        {/* WISHLIST VIEW PORT */}
        {activeTab === 'wishlist' && !checkoutActive && (
          <WishlistView
            wishlistedItems={wishlistedItems}
            onRemoveFromWishlist={(p) => handleToggleWishlist(null, p)}
            onMoveToCart={handleMoveToCart}
            onBrowseProducts={() => setActiveTab('shop')}
          />
        )}

        {/* TRACKING ORDERS SHIPMENT VIEW PORT */}
        {activeTab === 'orders' && !checkoutActive && (
          <OrdersView
            orders={orders}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setActiveTab('shop');
            }}
          />
        )}

      </main>

      {/* CORE PRODUCT SPECIFICATION DETAILS DRAWER POPUP */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isWishlisted={wishlistedItems.some((w) => w.id === selectedProduct.id)}
          onToggleWishlist={() => handleToggleWishlist(null, selectedProduct)}
          onAddToCart={() => {
            handleAddToCart(null, selectedProduct);
            // After click let user see go to cart state or continue shopping
          }}
          onBuyNow={() => {
            handleBuyNow(selectedProduct);
            setSelectedProduct(null);
          }}
          isInCart={cartItems.some((c) => c.product.id === selectedProduct.id)}
          onAddReview={handleAddReview}
        />
      )}

      {/* FOOTER SECTION: Branding coordinates, Why choose, target details */}
      <footer className="bg-[#172337] border-t border-slate-800 text-white mt-16 text-left shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Cell 1: Tagline, Pitch */}
            <div className="space-y-4">
              <FlipkartLogo variant="light" showSubtitle={true} />
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                Flipkart is a modern electronics & gadgets e-commerce portal delivering the absolute latest high-quality electronics directly to students, tech lovers, office workers, and smart shoppers.
              </p>
              <div className="text-xs font-semibold text-[#ffe11b]">
                ★ Tagline: “Smart Electronics, Smarter Prices.”
              </div>
            </div>

            {/* Cell 2: Why Choose Us */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Why Shop Flipkart</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-1.5">• 100% Genuine Certified Gadgets</li>
                <li className="flex items-center gap-1.5">• Flat ₹99 Deal Specials for All Products</li>
                <li className="flex items-center gap-1.5">• Super Fast Secure Shipping across India</li>
                <li className="flex items-center gap-1.5">• Reliable 7 Days Easy Return Policy</li>
                <li className="flex items-center gap-1.5">• Secure SSL Payments Encryptions</li>
              </ul>
            </div>

            {/* Cell 3: Target Customers list */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Target Audiences</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Students', 'Gamers', 'Tech Lovers', 'Office Workers', 'Everyday Shoppers'].map((t) => (
                  <span key={t} className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-1 rounded">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Dedicated features configured to save budgets for students and supply heavy high-spec components for gamers.
              </p>
            </div>

            {/* Cell 4: Assurances */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Guarantees & Badges</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 bg-slate-800 border border-slate-700 p-2 rounded">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">Authorized Brand-Certified Electronics Hub.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 bg-slate-800 border border-slate-705 p-2 rounded">
                  <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-[11px]">100% Secure Payments Protocol.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Bottom copyright terms info */}
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div>
              &copy; 2026 Flipkart Electronics and Gadgets Store Private Limited. All rights reserved.
            </div>
            <div className="flex gap-4">
              <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-white">Terms of Sale</a>
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-white">Privacy Policy</a>
              <a href="#sitemap" onClick={(e) => e.preventDefault()} className="hover:text-white flex items-center">Sitemap Index</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
