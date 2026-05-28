export interface Review {
  id: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified: boolean;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  category: 'smartphones' | 'laptops' | 'smartwatches' | 'headphones' | 'gaming' | 'speakers' | 'accessories' | 'mens-fashion' | 'womens-fashion' | 'fitness' | 'grooming';
  categoryLabel: string;
  brand: string;
  price: number; // current price
  mrp: number; // manufacturer's recommended price (for strike-through discount)
  rating: number; // e.g. 4.4
  ratingCount: number; // e.g. 12402
  reviewCount: number; // e.g. 948
  images: string[]; // array of image URLs
  description: string;
  highlights: string[];
  specifications: Specification[];
  reviews: Review[];
  stock: number;
  assured: boolean; // Similar to Flipkart Assured
  isBestSeller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'ordered' | 'shipped' | 'out_for_delivery' | 'delivered';
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    pincode: string;
    state: string;
  };
}

export interface FilterState {
  category: string;
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  searchQuery: string;
  sortBy: 'popularity' | 'price_low_high' | 'price_high_low' | 'rating';
}

/**
 * Mobile phone products pricing adjuster
 * Automatically sets price to 1499 for any products matching mobile categorizations
 */
export function adjustProductMobilePrice<T extends { id?: string; category?: string; categoryLabel?: string; title?: string; price: number; mrp: number; images?: string[] }>(product: T): T {
  const cat = (product.category || '').toLowerCase();
  const label = (product.categoryLabel || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  const isMobile = 
    cat === 'smartphones' || 
    label === 'smartphones' || 
    label === 'mobile phones' || 
    label === 'android phones' || 
    label === 'iphones' || 
    label === 'gaming phones';

  const isLaptop =
    cat === 'laptops' || 
    label === 'laptops' || 
    label === 'gaming laptops' || 
    label === 'ultrabooks' || 
    label === 'macbooks' || 
    label === 'student laptops' || 
    label === 'notebooks';

  if (isMobile) {
    let mrp = product.mrp;
    // Show realistic original prices like ₹24,999 -> ₹1499
    if (!mrp || mrp <= 1499) {
      if (title.includes('s24') || title.includes('iphone')) {
        mrp = 119999;
      } else if (title.includes('oneplus')) {
        mrp = 64999;
      } else if (title.includes('redmi') || title.includes('realme') || title.includes('nord')) {
        mrp = 15999;
      } else {
        mrp = 24999;
      }
    }

    // Curated high quality real phone images for perfect alignment
    let images = product.images;
    const phoneImages: Record<string, string[]> = {
      'phone-01': [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-02': [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-03': [
        'https://images.unsplash.com/photo-1565849328230-72594458397a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-04': [
        'https://images.unsplash.com/photo-1598327106026-d9521da673d1?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-05': [
        'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-06': [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-07': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-08': [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-09': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
      ],
      'phone-10': [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
      ]
    };

    const idKey = (product.id || '') as string;
    if (phoneImages[idKey]) {
      images = phoneImages[idKey];
    } else if (images && (images.length === 0 || images[0].includes('placeholder') || images[0].includes('unsplash.com/photo-1511707171634-5f897ff02aa9'))) {
      images = [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
      ];
    }

    return {
      ...product,
      price: 1499,
      mrp: mrp,
      images: images
    };
  }

  if (isLaptop) {
    let mrp = product.mrp;
    // Show realistic original prices like ₹59,999 -> ₹1499
    if (!mrp || mrp <= 1499) {
      if (title.includes('macbook max') || title.includes('pro m3') || title.includes('zephyrus')) {
        mrp = 149999;
      } else if (title.includes('macbook air') || title.includes('predator')) {
        mrp = 99999;
      } else if (title.includes('inspiron') || title.includes('book4') || title.includes('katana') || title.includes('victus')) {
        mrp = 74999;
      } else {
        mrp = 59999;
      }
    }

    // Curated high quality real laptop images for a premium Flipkart UI appearance
    let images = product.images;
    const laptopImages: Record<string, string[]> = {
      'laptop-01': [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-02': [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-03': [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-04': [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1496181130204-755241544e3f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-05': [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-06': [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-07': [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-08': [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1496181130204-755241544e3f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-09': [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      ],
      'laptop-10': [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      ]
    };

    const idKey = (product.id || '') as string;
    if (laptopImages[idKey]) {
      images = laptopImages[idKey];
    } else if (images && (images.length === 0 || images[0].includes('placeholder') || images[0].includes('unsplash.com/photo-1588872657578-17efd1f1555ed'))) {
      images = [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80'
      ];
    }

    return {
      ...product,
      price: 1499,
      mrp: mrp,
      images: images
    };
  }

  return product;
}

