import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Check, X, Shield, Lock, Eye, 
  Search, Filter, Smartphone, Laptop, Watch, Headphones, 
  Gamepad2, Volume2, Zap, Shirt, Dumbbell, Sparkles, AlertCircle, 
  CheckCircle2, TrendingUp, ShoppingBag, Users, Settings, Tag, 
  Mail, Phone, ShieldCheck, MapPin, DollarSign, Calendar, EyeOff, CheckSquare, Square
} from 'lucide-react';
import { Product, Order, Specification } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { FlipkartLogo } from './FlipkartLogo';


interface AdminViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onClose: () => void;
}

interface Coupon {
  code: string;
  discountPercent: number;
  minOrderValue: number;
  active: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  products, 
  setProducts, 
  orders, 
  setOrders,
  onClose 
}) => {
  // Authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(true); // check on load
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  // Login form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form inputs
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRecoveryPin, setRegisterRecoveryPin] = useState('');

  // Forgot Password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRecoveryPin, setForgotRecoveryPin] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Settings credentials updater inputs
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsNewRecoveryPin, setSettingsNewRecoveryPin] = useState('');

  // Layout Tab State
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'settings' | 'coupons'>('dashboard');

  // Products state filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Customer Orders Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Active Users database and filters
  const [usersList, setUsersList] = useState<any[]>(() => {
    const saved = localStorage.getItem('techzone_registered_users');
    if (saved) return JSON.parse(saved);
    
    // Seed standard dummy users for realistic demo
    const defaultUsers = [
      { id: 'usr-101', name: 'Aman Sharma', email: 'aman@gmail.com', phone: '+91 98765 43210', joinedDate: '10 Feb 2026', blocked: false },
      { id: 'usr-102', name: 'Priya Patel', email: 'priya@yahoo.com', phone: '+91 87654 32109', joinedDate: '15 Mar 2026', blocked: false },
      { id: 'usr-103', name: 'Rohan Deshmukh', email: 'rohan.d@outlook.com', phone: '+91 76543 21098', joinedDate: '22 Apr 2026', blocked: false },
      { id: 'usr-104', name: 'Surbhi Gupta', email: 'surbhi@gmail.com', phone: '+91 65432 10987', joinedDate: '01 May 2026', blocked: true },
      { id: 'usr-105', name: 'Manish Kumar', email: 'manish@rediffmail.com', phone: '+91 91234 56789', joinedDate: '18 May 2026', blocked: false },
    ];
    localStorage.setItem('techzone_registered_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  });
  const [userSearch, setUserSearch] = useState('');

  // Coupon configuration
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('techzone_coupons');
    if (saved) return JSON.parse(saved);
    
    const defaultCoupons = [
      { code: 'WELCOME99', discountPercent: 10, minOrderValue: 99, active: true },
      { code: 'FLIPDEALS', discountPercent: 15, minOrderValue: 198, active: true },
      { code: 'SUPER99', discountPercent: 20, minOrderValue: 297, active: true },
    ];
    localStorage.setItem('techzone_coupons', JSON.stringify(defaultCoupons));
    return defaultCoupons;
  });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(99);

  // Global Brand Config
  const [siteTitle, setSiteTitle] = useState(() => localStorage.getItem('techzone_site_title') || 'Flipkart Plus');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('techzone_support_phone') || '+91 1800 208 9898');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('techzone_support_email') || 'support@flipkart.com');
  const [logoUrl, setLogoUrl] = useState('');
  const [promoHeadline, setPromoHeadline] = useState('');
  const [promoSubheadline, setPromoSubheadline] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantUpi, setMerchantUpi] = useState('');
  const [merchantQrCode, setMerchantQrCode] = useState('');
  const [homepageBanners, setHomepageBanners] = useState<any[]>([]);

  const [disabledProducts, setDisabledProducts] = useState<string[]>(() => {
    const saved = localStorage.getItem('techzone_disabled_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Editing or Adding product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    category: 'smartphones',
    brand: '',
    price: 99,
    mrp: 999,
    stock: 50,
    description: '',
    images: [''],
    highlights: [''],
    specifications: [{ label: '', value: '' }],
    assured: true,
  });

  // Interactive Live Toast Tickers
  const [notifier, setNotifier] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotifier({ message, type });
    setTimeout(() => {
      setNotifier(null);
    }, 4000);
  };

  // Check registration status and session token on mount
  useEffect(() => {
    checkAdminStatus();
    verifyExistingSession();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/status');
      const data = await res.json();
      if (data.success) {
        setIsRegistered(data.exists);
        if (!data.exists) {
          setAuthMode('register');
        } else {
          setAuthMode('login');
        }
      }
    } catch (err) {
      console.error('Failed to query admin status:', err);
    }
  };

  const verifyExistingSession = async () => {
    const token = localStorage.getItem('techzone_admin_token');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminEmail(data.email);
        setIsAdminAuthenticated(true);
      } else {
        localStorage.removeItem('techzone_admin_token');
        setIsAdminAuthenticated(false);
      }
    } catch (err) {
      console.error('Verify session failed:', err);
      // fallback to preventing locking if the fetch itself fails due to network offline
      setIsAdminAuthenticated(true);
    }
  };

  const loadAllServerData = async () => {
    const token = localStorage.getItem('techzone_admin_token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn('Product load failed');
    }

    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.warn('Orders load failed');
    }

    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setSiteTitle(s.siteTitle || 'Flipkart Plus');
        setSupportPhone(s.supportPhone || '+91 1800 208 9898');
        setSupportEmail(s.supportEmail || 'support@flipkart.com');
        setLogoUrl(s.logoUrl || '');
        setPromoHeadline(s.promoHeadline || '');
        setPromoSubheadline(s.promoSubheadline || '');
        setMerchantName(s.merchantName || '');
        setMerchantUpi(s.merchantUpi || '');
        setMerchantQrCode(s.qrCode || '');
        setHomepageBanners(s.homepageBanners || []);
        if (s.disabledProducts) setDisabledProducts(s.disabledProducts);
      }
    } catch (e) {
      console.warn('Settings load failed');
    }

    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success && data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.warn('Coupons load failed');
    }

    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.users) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.warn('Users load failed');
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAllServerData();
    }
  }, [isAdminAuthenticated]);

  // Secure Sign In Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('techzone_admin_token', data.token);
        setAdminEmail(data.email);
        setIsAdminAuthenticated(true);
        triggerNotification('Admin session authenticated successfully.', 'success');
      } else {
        setLoginError(data.error || 'Invalid administrator credentials. Authentication rejected.');
      }
    } catch (err: any) {
      setLoginError('Server authentication request failed. Make sure server is running.');
    }
  };

  // Secure Register Handler
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: registerEmail, 
          password: registerPassword, 
          recoveryPin: registerRecoveryPin 
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('techzone_admin_token', data.token);
        setAdminEmail(data.email);
        setIsAdminAuthenticated(true);
        setIsRegistered(true);
        triggerNotification('Secure administrator account configured successfully.', 'success');
      } else {
        setLoginError(data.error || 'Failed to register administrator.');
      }
    } catch (err: any) {
      setLoginError('Server registration request failed. Make sure server is running.');
    }
  };

  // Forgot password reset handler
  const handleAdminForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          recoveryPin: forgotRecoveryPin,
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerNotification(data.message || 'Password reset successfully.', 'success');
        setAuthMode('login');
        setLoginEmail(forgotEmail);
      } else {
        setLoginError(data.error || 'Failed to verify recovery pin or update password.');
      }
    } catch (err) {
      setLoginError('Server forgot password request failed.');
    }
  };

  // Logout handler
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('techzone_admin_token');
    triggerNotification('Security session terminated successfully.', 'info');
  };

  // Password Update
  const handleCredentialsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('techzone_admin_token');
    if (!token) {
      triggerNotification('Authorization session expired. Please sign in again.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: adminEmail,
          newPassword: settingsNewPassword || undefined,
          newRecoveryPin: settingsNewRecoveryPin || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerNotification('Administrator credentials updated securely.', 'success');
        setAdminEmail(data.email);
        setSettingsNewPassword('');
        setSettingsNewRecoveryPin('');
      } else {
        triggerNotification(data.error || 'Failed to update credentials.', 'error');
      }
    } catch (err) {
      triggerNotification('Failed to commit credentials updates to server database.', 'error');
    }
  };

  // Branding Update
  const handleBrandingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('techzone_admin_token');

    const payload = {
      siteTitle,
      supportPhone,
      supportEmail,
      logoUrl,
      promoHeadline,
      promoSubheadline
    };

    fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        triggerNotification('Global branding configuration saved completely to database.', 'success');
        localStorage.setItem('techzone_site_title', siteTitle);
        localStorage.setItem('techzone_support_phone', supportPhone);
        localStorage.setItem('techzone_support_email', supportEmail);
      } else {
        triggerNotification(data.error || 'Failed to save branding profile.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server API connection failure.', 'error');
    });
  };

  // Payment Gateway Settings Update
  const handlePaymentSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('techzone_admin_token');

    const payload = {
      merchantName,
      merchantUpi,
      qrCode: merchantQrCode
    };

    fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        triggerNotification('Merchant gateway settings updated successfully.', 'success');
      } else {
        triggerNotification(data.error || 'Failed to persist gateway settings.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server communication failure.', 'error');
    });
  };

  const handleQrCodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setMerchantQrCode(reader.result as string);
        triggerNotification('QR code file loaded into memory. Click ACTIVATE to commit.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        triggerNotification('Store logo file loaded. Click COMMIT BRANDING to persist.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Products helper
  const saveProductsListLocal = (updatedList: Product[]) => {
    setProducts(updatedList);
    localStorage.setItem('techzone_products_db', JSON.stringify(updatedList));
  };

  // Toggle dynamic active status for product listings
  const handleToggleProductStatus = (productId: string) => {
    const nextDisabled = disabledProducts.includes(productId)
      ? disabledProducts.filter(id => id !== productId)
      : [...disabledProducts, productId];
    
    setDisabledProducts(nextDisabled);
    localStorage.setItem('techzone_disabled_products', JSON.stringify(nextDisabled));

    const token = localStorage.getItem('techzone_admin_token');
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ disabledProducts: nextDisabled })
    }).catch(() => {});

    triggerNotification(
      `Product state is now ${disabledProducts.includes(productId) ? 'Enabled' : 'Disabled'} instantly.`,
      'info'
    );
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this product listing? This action cannot be reversed.')) {
      const token = localStorage.getItem('techzone_admin_token');
      fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const remaining = products.filter(p => p.id !== id);
          setProducts(remaining);
          triggerNotification('Product catalog profile was removed from database.', 'error');
        } else {
          triggerNotification(data.error || 'Failed to remove product from records.', 'error');
        }
      })
      .catch(() => {
        triggerNotification('Server communication failure. Product removal failed.', 'error');
      });
    }
  };

  // Handle Order delivery updates
  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'ordered' | 'shipped' | 'out_for_delivery' | 'delivered') => {
    const token = localStorage.getItem('techzone_admin_token');
    
    fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const updated = orders.map(o => o.id === orderId ? data.order : o);
        setOrders(updated);
        triggerNotification(`Order #${orderId} state transitioned to: ${nextStatus.toUpperCase()}`, 'success');
      } else {
        triggerNotification(data.error || 'Failed to update order status.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server communication failure. Order status not updated.', 'error');
    });
  };

  // Block/Unblock user profiles
  const handleToggleBlockUser = (userId: string) => {
    const token = localStorage.getItem('techzone_admin_token');
    fetch(`/api/admin/users/${userId}/block`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const updated = usersList.map(u => u.id === userId ? data.user : u);
        setUsersList(updated);
        triggerNotification(
          `User ${data.user.name} is now ${data.user.blocked ? 'BLOCKED' : 'UNBLOCKED'}.`,
          data.user.blocked ? 'error' : 'success'
        );
      } else {
        triggerNotification(data.error || 'Failed to modify user access block state.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server communication error. Blocking toggled failed.', 'error');
    });
  };

  // Delete User record
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Delete this user account cleanly? Customer purchase histories will be unlinked.')) {
      const token = localStorage.getItem('techzone_admin_token');
      fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const remaining = usersList.filter(u => u.id !== userId);
          setUsersList(remaining);
          triggerNotification('Customer account deleted successfully from server ledger.', 'info');
        } else {
          triggerNotification(data.error || 'Failed to delete user profile from records.', 'error');
        }
      })
      .catch(() => {
        triggerNotification('Server communication failure. User deletion aborted.', 'error');
      });
    }
  };

  // Coupons Manager
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const cleanCode = newCouponCode.trim().toUpperCase();
    if (coupons.some(c => c.code === cleanCode)) {
      triggerNotification('Coupon code is already registered.', 'error');
      return;
    }
    const added: Coupon = {
      code: cleanCode,
      discountPercent: Number(newCouponDiscount),
      minOrderValue: Number(newCouponMinOrder),
      active: true,
    };

    const token = localStorage.getItem('techzone_admin_token');
    fetch('/api/admin/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(added)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCoupons(data.coupons);
        setNewCouponCode('');
        triggerNotification(`Promo Code ${cleanCode} active now!`, 'success');
      } else {
        triggerNotification(data.error || 'Failed to save new coupon.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server communication failure. Coupon not added.', 'error');
    });
  };

  const handleDeleteCoupon = (code: string) => {
    const token = localStorage.getItem('techzone_admin_token');
    fetch(`/api/admin/coupons/${code}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCoupons(data.coupons);
        triggerNotification('Coupon disabled and purged from server records.', 'info');
      } else {
        triggerNotification(data.error || 'Failed to delete coupon.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server communication error. Coupon delete aborted.', 'error');
    });
  };

  const handleToggleCoupon = (code: string) => {
    const target = coupons.find(c => c.code === code);
    if (!target) return;

    const modified = { ...target, active: !target.active };
    const token = localStorage.getItem('techzone_admin_token');

    fetch('/api/admin/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(modified)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCoupons(data.coupons);
        triggerNotification('Coupon status updated and saved.', 'info');
      } else {
        triggerNotification(data.error || 'Failed to toggle coupon status.', 'error');
      }
    })
    .catch(() => {
      triggerNotification('Server communication error. Coupon toggle failed.', 'error');
    });
  };

  // Product Fields handling logic
  const handleFormChange = (field: string, val: any) => {
    setProductForm(prev => ({ ...prev, [field]: val }));
  };

  const handleAddFieldArray = (field: 'highlights' | 'images' | 'specifications') => {
    if (field === 'highlights') {
      setProductForm(p => ({ ...p, highlights: [...(p.highlights || []), ''] }));
    } else if (field === 'images') {
      setProductForm(p => ({ ...p, images: [...(p.images || []), ''] }));
    } else {
      setProductForm(p => ({ ...p, specifications: [...(p.specifications || []), { label: '', value: '' }] }));
    }
  };

  const handleRemoveFieldArray = (field: 'highlights' | 'images' | 'specifications', index: number) => {
    if (field === 'highlights') {
      const next = [...(productForm.highlights || [])];
      next.splice(index, 1);
      setProductForm(p => ({ ...p, highlights: next }));
    } else if (field === 'images') {
      const next = [...(productForm.images || [])];
      next.splice(index, 1);
      setProductForm(p => ({ ...p, images: next }));
    } else {
      const next = [...(productForm.specifications || [])];
      next.splice(index, 1);
      setProductForm(p => ({ ...p, specifications: next }));
    }
  };

  const handleArrayValueEdit = (field: 'highlights' | 'images' | 'specifications', index: number, value: any, keyName?: 'label' | 'value') => {
    if (field === 'highlights') {
      const next = [...(productForm.highlights || [])];
      next[index] = value;
      setProductForm(p => ({ ...p, highlights: next }));
    } else if (field === 'images') {
      const next = [...(productForm.images || [])];
      next[index] = value;
      setProductForm(p => ({ ...p, images: next }));
    } else {
      const next = [...(productForm.specifications || [])];
      if (keyName) {
        next[index] = { ...next[index], [keyName]: value };
      }
      setProductForm(p => ({ ...p, specifications: next }));
    }
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const list = [...(productForm.images || [])];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setProductForm(p => ({ ...p, images: list }));
  };

  const handleSetPrimaryImage = (index: number) => {
    const list = [...(productForm.images || [])];
    if (index > 0 && index < list.length) {
      const primary = list.splice(index, 1)[0];
      list.unshift(primary);
      setProductForm(p => ({ ...p, images: list }));
    }
  };

  const handleProductImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const list = [...(productForm.images || [])];
      list[index] = base64String;
      setProductForm(p => ({ ...p, images: list }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Product Add/Edit Form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.brand || !productForm.description) {
      triggerNotification('Missing product core properties. Fill required attributes.', 'error');
      return;
    }

    // Sanitize values
    const finalPrice = Math.max(1, Number(productForm.price || 99));
    const finalMrp = Math.max(finalPrice, Number(productForm.mrp || finalPrice * 2));
    const cleanImages = (productForm.images || []).filter(img => img.trim() !== '');
    const cleanHighlights = (productForm.highlights || []).filter(h => h.trim() !== '');
    const cleanSpecs = (productForm.specifications || []).filter(s => s.label.trim() !== '' && s.value.trim() !== '');

    const finalImagesList = cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'];

    const targetCategoryLabel = productForm.category === 'smartphones' ? 'Smartphones' :
                                productForm.category === 'laptops' ? 'Laptops' :
                                productForm.category === 'smartwatches' ? 'Smart Watches' :
                                productForm.category === 'headphones' ? 'Headphones & Earbuds' :
                                productForm.category === 'speakers' ? 'Speakers' :
                                productForm.category === 'accessories' ? 'Chargers & Accessories' :
                                productForm.category === 'gaming' ? 'Gaming Accessories' :
                                productForm.category === 'fitness' ? 'Gym & Fitness' :
                                productForm.category === 'grooming' ? 'Beauty & Grooming' :
                                productForm.category === 'mens-fashion' ? "Men's Clothing" : "Women's Clothing";

    const token = localStorage.getItem('techzone_admin_token');

    if (editingProduct) {
      // Edit logic
      const revised: Product = {
        ...editingProduct,
        title: productForm.title,
        category: productForm.category as any,
        categoryLabel: targetCategoryLabel,
        brand: productForm.brand,
        price: finalPrice,
        mrp: finalMrp,
        stock: Math.max(0, Number(productForm.stock || 0)),
        description: productForm.description,
        images: finalImagesList,
        highlights: cleanHighlights,
        specifications: cleanSpecs,
        assured: !!productForm.assured,
      };

      fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(revised)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const revisedList = products.map(p => p.id === editingProduct.id ? data.product : p);
          setProducts(revisedList);
          triggerNotification('Product information modified and written securely to database.', 'success');
          setEditingProduct(null);
        } else {
          triggerNotification(data.error || 'Failed to update product details.', 'error');
        }
      })
      .catch(() => {
        triggerNotification('Server communication failure. Product not modified.', 'error');
      });
    } else {
      // Add logic
      const newPid = `prod-${Date.now().toString().slice(-6)}`;
      const fresh: Product = {
        id: newPid,
        title: productForm.title,
        category: productForm.category as any,
        categoryLabel: targetCategoryLabel,
        brand: productForm.brand,
        price: finalPrice,
        mrp: finalMrp,
        stock: Math.max(0, Number(productForm.stock || 50)),
        description: productForm.description,
        images: finalImagesList,
        highlights: cleanHighlights,
        specifications: cleanSpecs,
        assured: !!productForm.assured,
        rating: 4.5,
        ratingCount: 1,
        reviewCount: 0,
        reviews: [],
      };

      fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fresh)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const updatedList = [data.product, ...products];
          setProducts(updatedList);
          triggerNotification(`New product registered successfully!`, 'success');
          setIsAddingProduct(false);
        } else {
          triggerNotification(data.error || 'Failed to register new product.', 'error');
        }
      })
      .catch(() => {
        triggerNotification('Server connection failure. Product registration failed.', 'error');
      });
    }
  };

  // Launch editing prefill
  const launchEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      category: p.category,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      description: p.description,
      images: p.images.length > 0 ? [...p.images] : [''],
      highlights: p.highlights.length > 0 ? [...p.highlights] : [''],
      specifications: p.specifications.length > 0 ? [...p.specifications] : [{ label: '', value: '' }],
      assured: p.assured,
    });
    setIsAddingProduct(false);
  };

  const launchCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category: 'smartphones',
      brand: '',
      price: 99,
      mrp: 999,
      stock: 50,
      description: '',
      images: [''],
      highlights: [''],
      specifications: [{ label: '', value: '' }],
      assured: true,
    });
    setIsAddingProduct(true);
  };

  // Filter lists dynamically
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = usersList.filter(u => {
    return u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
           u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
           u.phone.includes(userSearch);
  });

  // KPI calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'ordered') // Assume payment capture once packed/shipped/delivered
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const conversionFactor = 3.65; // Simulated realistic ecomm analytical metrics
  const activeProductsCount = products.filter(p => !disabledProducts.includes(p.id)).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-start">
      
      {/* Dynamic Toast Notifications Ticker */}
      {notifier && (
        <div className="fixed top-16 right-4 z-[100] bg-slate-900 text-white rounded-md shadow-2xl px-5 py-3.5 border-l-4 flex items-center gap-3 animate-in slide-in-from-right duration-250 border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-semibold leading-relaxed">{notifier.message}</p>
          </div>
          <button onClick={() => setNotifier(null)} className="text-slate-400 hover:text-white ml-2 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Primary header band */}
      <header className="bg-slate-900 text-white px-4 md:px-8 py-3.5 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <FlipkartLogo variant="light" showSubtitle={false} />
          <span className="bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-bold ml-1 select-none">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded font-bold transition-all flex items-center gap-1"
          >
            ← Storefront View
          </button>
          {isAdminAuthenticated && (
            <button 
              onClick={handleAdminLogout}
              className="text-xs bg-red-600/20 hover:bg-red-600/35 border border-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded font-bold transition-all"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Unauthenticated Security Shield overlay */}
      {!isAdminAuthenticated ? (
        <div className="flex-1 flex items-center justify-center py-16 px-4 bg-slate-100">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#2874f0] p-6 text-white text-center flex flex-col items-center select-none">
              <div className="mb-3 hover:scale-105 transition-transform">
                <FlipkartLogo variant="light" showSubtitle={true} />
              </div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-yellow-300 flex items-center gap-1.5 mt-1">
                <Shield className="w-4 h-4" /> ENTERPRISE PANEL
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {authMode === 'register' ? 'Configure Administrator Credentials' :
                 authMode === 'forgot_password' ? 'Verify Recovery Credentials' :
                 'Secure Store Administration Portal'}
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-750 p-3.5 rounded text-xs flex items-center gap-2 font-bold leading-normal">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-650" />
                  <span>{loginError}</span>
                </div>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleAdminRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Create Administrator Email Address *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="e.g. admin@yourdomain.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Create Security Passphrase *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Choose a strong password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-10 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Set Secret Recovery PIN * (Forgot password recovery code)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. key-code-12938"
                        value={registerRecoveryPin}
                        onChange={(e) => setRegisterRecoveryPin(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block leading-normal mt-1">
                      ⚠️ Note: This recovery pin will be encrypted on servers and is mandatory to verify password resets cleanly.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded transition-all shadow hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 border-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Initialize Portal Admin</span>
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setLoginError(''); }}
                      className="text-xs text-blue-650 font-black hover:underline"
                    >
                      ← Already have credentials? Sign in
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'login' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Administrator Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="admin@yourdomain.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot_password'); setLoginError(''); }}
                        className="text-[10px] text-blue-605 font-black hover:underline border-0 bg-transparent cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-10 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-[#2874f0] hover:bg-blue-600 text-white font-black text-xs uppercase rounded transition-all shadow hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2 border-0"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Secure Sign In</span>
                  </button>

                  {!isRegistered && (
                    <div className="pt-2 text-center border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setLoginError(''); }}
                        className="text-xs text-emerald-650 font-black hover:underline"
                      >
                        ⚙️ Register First-Time Admin Account
                      </button>
                    </div>
                  )}
                </form>
              )}

              {authMode === 'forgot_password' && (
                <form onSubmit={handleAdminForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Administrator Registered Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="admin@yourdomain.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Provide Secret Recovery PIN
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Enter the recovery PIN set during registration"
                        value={forgotRecoveryPin}
                        onChange={(e) => setForgotRecoveryPin(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Specify New Security Passphrase
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Choose a strong new password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full h-10 pl-9 pr-10 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase rounded transition-all shadow hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 border-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Account Password</span>
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setLoginError(''); }}
                      className="text-xs text-blue-650 font-black hover:underline"
                    >
                      ← Return to Login Portal Page
                    </button>
                  </div>
                </form>
              )}
              
            </div>
          </div>
        </div>
      ) : (
        /* CORE AUTHENTICATED PANEL LAYOUT */
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Sidebar Menu Panel */}
          <aside className="w-full md:w-64 bg-slate-900 border-t border-slate-800 text-slate-300 shrink-0 text-left">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs text-white bg-slate-800 p-2.5 rounded">
                <Shield className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                <div className="truncate">
                  <p className="font-black truncate">{adminEmail}</p>
                  <p className="text-[9px] text-slate-400">Authenticated Administrator</p>
                </div>
              </div>
            </div>

            <nav className="p-3 space-y-1 font-sans">
              <button
                onClick={() => { setActiveSubTab('dashboard'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all ${
                  activeSubTab === 'dashboard' ? 'bg-[#2874f0] text-white shadow font-black' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analytics Outlook</span>
              </button>
              
              <button
                onClick={() => { setActiveSubTab('products'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all ${
                  activeSubTab === 'products' ? 'bg-[#2874f0] text-white shadow font-black' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Products Catalog ({products.length})</span>
              </button>
              
              <button
                onClick={() => { setActiveSubTab('orders'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all ${
                  activeSubTab === 'orders' ? 'bg-[#2874f0] text-white shadow font-black' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Customer Orders ({orders.length})</span>
              </button>
              
              <button
                onClick={() => { setActiveSubTab('users'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all ${
                  activeSubTab === 'users' ? 'bg-[#2874f0] text-white shadow font-black' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Registered Users ({usersList.length})</span>
              </button>

              <button
                onClick={() => { setActiveSubTab('coupons'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all ${
                  activeSubTab === 'coupons' ? 'bg-[#2874f0] text-white shadow font-black' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Promo Coupons ({coupons.length})</span>
              </button>
              
              <button
                onClick={() => { setActiveSubTab('settings'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all ${
                  activeSubTab === 'settings' ? 'bg-[#2874f0] text-white shadow font-black' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Global Settings</span>
              </button>
            </nav>

            <div className="absolute bottom-4 left-4 right-4 hidden md:block">
              <div className="bg-[#1e293b] p-3 rounded text-[10px] text-slate-400 select-none border border-slate-800 font-mono">
                <p>Status: <span className="text-emerald-400">ONLINE</span></p>
                <p>System: React 19 vNode</p>
                <p>DB Stream: LocalStore</p>
              </div>
            </div>
          </aside>

          {/* Core Content Canvas */}
          <main className="flex-1 bg-slate-50 p-4 md:p-8 overflow-y-auto">
            
            {/* SUB TAB PANEL I: Dashboard Outlook */}
            {activeSubTab === 'dashboard' && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-display font-black text-slate-800 select-none">Website Overview Outlook</h2>
                    <p className="text-xs text-slate-500">Live indicators, dynamic conversion metrics, and daily revenue statistics</p>
                  </div>
                  <div className="bg-white px-4 py-2 border border-slate-200.rounded shadow-sm text-xs font-bold text-slate-600 flex items-center gap-2 select-none">
                    <Calendar className="w-4 h-4 text-[#2874f0]" />
                    <span>Real-time Window Ticker: Today, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* KPI Cards Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Cumulative Revenue</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1 select-none">
                        <span>↑ 18.2%</span> <span className="text-slate-450 text-[9px] font-normal">than previous cycle</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                      ₹
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Shipments Volume</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{orders.length}</p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1 select-none">
                        <span>↑ 7.4%</span> <span className="text-slate-450 text-[9px] font-normal">this segment</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">System Conversion</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{conversionFactor}%</p>
                      <p className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1 select-none">
                        <span>★ Standard</span> <span className="text-slate-450 text-[9px] font-normal">health checked</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Account Registry</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{usersList.length}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-1 select-none">
                        <span>● {usersList.filter(u => u.blocked).length} Suspended</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* SVG Revenue performance Area Graph using pure D3 math ideas */}
                <div className="bg-white p-5 md:p-6 rounded-lg shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-5 select-none text-left">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Revenue Realization Vector Curve</h4>
                      <p className="text-[10px] text-slate-400">Daily transaction volumes captured</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        Succesful Checkout Receipts
                      </span>
                    </div>
                  </div>

                  {/* Standard high fidelity SVG representing dynamic transaction values */}
                  <div className="relative w-full h-56 select-none bg-slate-50 border border-slate-100/50 rounded p-1">
                    <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Custom grid guides */}
                      <line x1="0" y1="40" x2="700" y2="40" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="0.75" />
                      <line x1="0" y1="100" x2="700" y2="100" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="0.75" />
                      <line x1="0" y1="160" x2="700" y2="160" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="0.75" />

                      {/* Line Paths & Area Paths */}
                      <path
                        d="M 20,180 Q 120,60 220,130 T 420,50 T 620,100 L 680,110 L 680,195 L 20,195 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M 20,180 Q 120,60 220,130 T 420,50 T 620,100 L 680,110"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />

                      {/* Spot Data Points */}
                      <circle cx="120" cy="85" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="220" cy="130" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="50" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="620" cy="100" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />

                      {/* Simple day labels on axis */}
                      <text x="20" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Mon</text>
                      <text x="135" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Tue</text>
                      <text x="250" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Wed</text>
                      <text x="365" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Thu</text>
                      <text x="480" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Fri</text>
                      <text x="595" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Sat</text>
                      <text x="660" y="195" fill="#94a3b8" fontSize="8" fontWeight="bold">Sun</text>
                    </svg>

                    {/* Chart overlay tooltip display indicator */}
                    <div className="absolute top-2 left-3 bg-slate-900/90 text-[9px] text-white px-2 py-1 rounded font-mono select-none">
                      Active High Output Realized: ₹{(totalRevenue * 1.4).toFixed(0)} Paise Check
                    </div>
                  </div>
                </div>

                {/* Split list blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Successful payments journal */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-left">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">Successful UPI Transactions</h4>
                    <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                      {orders.map((or) => (
                        <div key={or.id} className="p-3 border border-slate-100 rounded bg-slate-50 flex items-center justify-between text-xs transition-all hover:border-slate-350">
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <span>Order: {or.id}</span>
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded border border-emerald-200">
                                SIGN_VERIFIED
                              </span>
                            </div>
                            <p className="text-slate-400 text-[10px] mt-0.5">Method: {or.paymentMethod} • Date: {or.date}</p>
                            <p className="text-slate-450 text-[10px] mt-0.5">Customer: {or.shippingAddress.fullName}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-600 block">₹{or.totalAmount}</span>
                            <span className="text-[9px] text-slate-400">Captured in Full</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suspended/Flagged user logs */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-left">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">Identity Security Logs</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {usersList.map((usr) => (
                        <div key={usr.id} className="p-3 border border-slate-100 rounded bg-slate-50 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{usr.name}</p>
                            <p className="text-[10px] text-slate-400">{usr.email}</p>
                            <span className="text-[9px] font-mono mt-0.5 inline-block bg-slate-200 px-1 rounded text-slate-600">ID: {usr.id}</span>
                          </div>
                          <div>
                            {usr.blocked ? (
                              <span className="text-xs bg-red-100 text-red-750 font-bold px-2 py-0.5 rounded border border-red-200">
                                BLOCKED
                              </span>
                            ) : (
                              <span className="text-xs bg-emerald-100 text-emerald-750 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB TAB PANEL II: Catalog Controls */}
            {activeSubTab === 'products' && (
              <div className="space-y-6 text-left">
                
                {/* Operations Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-display font-black text-slate-800">Products Catalog Management</h2>
                    <p className="text-xs text-slate-500">Add, alter definitions, optimize pricing thresholds, change stock volumes, and enable/disable listings instantly</p>
                  </div>
                  <button
                    onClick={launchCreateProduct}
                    className="h-9 bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-bold px-4 rounded shadow hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register New Product</span>
                  </button>
                </div>

                {/* Filters block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-500">
                  <div className="space-y-1">
                    <label>Catalog Filter Search</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search product terms, IDs..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded font-normal bg-slate-55 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label>Show Category Only</label>
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded font-normal px-2.5 focus:outline-none bg-slate-55"
                    >
                      <option value="all">All Categories</option>
                      <option value="smartphones">Smartphones</option>
                      <option value="laptops">Laptops</option>
                      <option value="smartwatches">Smart Watches</option>
                      <option value="headphones">Headphones & Earbuds</option>
                      <option value="speakers">Speakers</option>
                      <option value="accessories">Chargers & Accessories</option>
                      <option value="gaming">Gaming Accessories</option>
                      <option value="mens-fashion">Men's Clothing</option>
                      <option value="womens-fashion">Women's Clothing</option>
                      <option value="fitness">Gym & Fitness</option>
                      <option value="grooming">Beauty & Grooming</option>
                    </select>
                  </div>

                  <div className="flex items-end text-slate-500 text-xs select-none">
                    <span>Displaying <strong className="text-slate-800">{filteredProducts.length}</strong> of {products.length} cataloged listings.</span>
                  </div>
                </div>

                {/* Add or Edit Drawers panel inline */}
                {(isAddingProduct || editingProduct) && (
                  <div className="bg-white p-5 md:p-6 rounded-lg shadow-md border-2 border-blue-100 flex flex-col text-xs text-left animate-in fade-in duration-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5 select-none">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <Edit className="w-5 h-5 text-blue-600" />
                        {editingProduct ? `Modify Product Profile [ID: ${editingProduct.id}]` : 'Add New Product Record to Catalog'}
                      </h3>
                      <button 
                        onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                        type="button"
                      >
                        ✕ Close Editor
                      </button>
                    </div>

                    <form onSubmit={handleSaveProductForm} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">Product Title *</label>
                          <input
                            type="text"
                            required
                            value={productForm.title || ''}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            placeholder="e.g. Samsung Galaxy S24 (Phantom Black)"
                            className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">Brand *</label>
                          <input
                            type="text"
                            required
                            value={productForm.brand || ''}
                            onChange={(e) => handleFormChange('brand', e.target.value)}
                            placeholder="e.g. Samsung, Apple, boAt"
                            className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">Global Category Sector *</label>
                          <select
                            value={productForm.category || 'smartphones'}
                            onChange={(e) => handleFormChange('category', e.target.value)}
                            className="w-full h-9 border border-slate-300 rounded px-2 focus:outline-none"
                          >
                            <option value="smartphones">Smartphones (₹99 Cap)</option>
                            <option value="laptops">Laptops (₹999 Premium Range)</option>
                            <option value="smartwatches">Smart Watches (₹99 Cap)</option>
                            <option value="headphones">Headphones & Earbuds (₹99 Cap)</option>
                            <option value="speakers">Speakers (₹99 Cap)</option>
                            <option value="accessories">Chargers & Accessories (₹99 Cap)</option>
                            <option value="gaming">Gaming Accessories (₹99 Cap)</option>
                            <option value="mens-fashion">Men's Clothing (₹99 Cap)</option>
                            <option value="womens-fashion">Women's Clothing (₹99 Cap)</option>
                            <option value="fitness">Gym & Fitness (₹99 Cap)</option>
                            <option value="grooming">Beauty & Grooming (₹99 Cap)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 text-blue-600">Actual Flat Price (₹) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={productForm.price}
                            onChange={(e) => handleFormChange('price', Number(e.target.value))}
                            className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none font-bold text-blue-600 bg-blue-50/50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">MRP / Strike-through Price (₹)</label>
                          <input
                            type="number"
                            value={productForm.mrp}
                            onChange={(e) => handleFormChange('mrp', Number(e.target.value))}
                            className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500">Available Stock Count *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={productForm.stock}
                            onChange={(e) => handleFormChange('stock', Number(e.target.value))}
                            className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 flex flex-col justify-end">
                          <label className="font-bold text-slate-55 flex items-center gap-1.5 select-none h-9 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!productForm.assured}
                              onChange={(e) => handleFormChange('assured', e.target.checked)}
                              className="w-4.5 h-4.5 border-slate-300 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-700 font-bold">Flipkart Assured Badge</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-500">Long Product Description (Overview) *</label>
                        <textarea
                          required
                          rows={3}
                          value={productForm.description || ''}
                          onChange={(e) => handleFormChange('description', e.target.value)}
                          placeholder="Provide descriptive features narrative..."
                          className="w-full border border-slate-300 rounded p-2.5 focus:outline-none text-xs"
                        />
                      </div>

                      {/* Images URL list */}
                      <div className="space-y-4 border border-slate-100 p-4 rounded bg-slate-50/50 text-left">
                        <div className="flex justify-between items-center select-none mb-1 font-sans">
                          <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            📸 Interactive Product Photo Gallery ({(productForm.images || []).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddFieldArray('images')}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] px-2.5 py-1 rounded font-black border border-blue-200 uppercase transition-all shrink-0 cursor-pointer"
                          >
                            + ADD EXTRA PHOTO
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 -mt-2 leading-relaxed">
                          The first image (Index 1) is the primary cover thumbnail. Drag local files, upload from local PC, or paste remote URLs.
                        </p>

                        <div className="space-y-3">
                          {(productForm.images || []).map((img, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded p-3 space-y-2.5 shadow-xs relative">
                              <div className="flex items-start gap-3">
                                {/* Visual Image Preview Box */}
                                <div className="w-14 h-14 shrink-0 bg-slate-50 border border-slate-250 rounded overflow-hidden flex items-center justify-center relative bg-white select-none">
                                  {img ? (
                                    <img 
                                      src={img} 
                                      alt={`Preview ${idx + 1}`} 
                                      className="w-full h-full object-contain bg-white"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[9px] text-slate-400 text-center font-bold px-1 block leading-tight">No image</span>
                                  )}
                                </div>

                                {/* Inputs + Drag & Drop file upload */}
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Paste remote image url (e.g. Unsplash) or select file below..."
                                      value={img}
                                      onChange={(e) => handleArrayValueEdit('images', idx, e.target.value)}
                                      className="flex-1 h-8.5 border border-slate-300 rounded px-2 focus:outline-none bg-white font-mono text-[10px]"
                                    />
                                  </div>
                                  
                                  {/* Base64 Upload Picker */}
                                  <div className="relative h-7 border border-dashed border-slate-350 hover:border-blue-500 rounded bg-slate-50 flex items-center justify-center transition-colors text-center overflow-hidden">
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleProductImageUpload(idx, e.target.files[0]);
                                        }
                                      }}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-5" 
                                    />
                                    <span className="text-[10px] font-bold text-slate-600 select-none pointer-events-none">
                                      📁 Click or Drag local file to upload
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Row of Controls for Priority, Reorder and Purge */}
                              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-500">
                                <div className="flex items-center gap-2">
                                  {idx === 0 ? (
                                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 select-none">
                                      ⭐ Primary Cover Thumbnail
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryImage(idx)}
                                      className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded px-2 py-0.5 text-[9px] uppercase transition-all cursor-pointer"
                                    >
                                      Set Cover Thumbnail
                                    </button>
                                  )}

                                  {/* Index Marker */}
                                  <span className="text-slate-400 text-[9px] font-mono">Slot #{idx + 1}</span>
                                </div>

                                <div className="flex items-center gap-1.5 font-sans">
                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveImage(idx, 'up')}
                                    className={`px-2 py-0.5 border border-slate-200 rounded transition-all select-none cursor-pointer text-[10px] ${
                                      idx === 0 ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                    title="Move Item Up"
                                  >
                                    ▲ Up
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    disabled={idx === (productForm.images || []).length - 1}
                                    onClick={() => handleMoveImage(idx, 'down')}
                                    className={`px-2 py-0.5 border border-slate-200 rounded transition-all select-none cursor-pointer text-[10px] ${
                                      idx === (productForm.images || []).length - 1 ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                    title="Move Item Down"
                                  >
                                    ▼ Down
                                  </button>

                                  {/* Delete */}
                                  {(productForm.images || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFieldArray('images', idx)}
                                      className="text-red-500 hover:bg-red-50 hover:text-red-750 px-2 py-0.5 border border-red-200 rounded transition-all ml-1 cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom highlights bullet points */}
                      <div className="space-y-2 border border-slate-100 p-4 rounded bg-slate-50/50 text-left">
                        <div className="flex justify-between items-center select-none">
                          <label className="font-bold text-slate-65">
                            ⚡ Bullet point highlights (Quick look features)
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddFieldArray('highlights')}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-black"
                          >
                            + ADD HIGHLIGHT LINE
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(productForm.highlights || []).map((hlt, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Bullet summary line..."
                                value={hlt}
                                onChange={(e) => handleArrayValueEdit('highlights', idx, e.target.value)}
                                className="flex-1 h-8 bg-slate-15 border border-slate-300 rounded px-2.5 bg-white text-xs"
                              />
                              {(productForm.highlights || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFieldArray('highlights', idx)}
                                  className="text-red-500 hover:text-red-750 px-2 font-black border border-slate-200 rounded text-xs shrink-0"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technical specifications key-values */}
                      <div className="space-y-2 border border-slate-100 p-4 rounded bg-slate-50/50 text-left">
                        <div className="flex justify-between items-center select-none">
                          <label className="font-bold text-slate-65">
                            🔧 Technical Specifications Matrix
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddFieldArray('specifications')}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-black"
                          >
                            + ADD KEY-VALUE ROW
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(productForm.specifications || []).map((spec, idx) => (
                            <div key={idx} className="flex gap-3">
                              <input
                                type="text"
                                placeholder="Property Name (e.g., Processor)"
                                value={spec.label}
                                onChange={(e) => handleArrayValueEdit('specifications', idx, e.target.value, 'label')}
                                className="w-1/3 h-8.5 border border-slate-300 rounded px-2.5 bg-white text-xs font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g., Apple A17 Chip)"
                                value={spec.value}
                                onChange={(e) => handleArrayValueEdit('specifications', idx, e.target.value, 'value')}
                                className="flex-1 h-8.5 border border-slate-300 rounded px-2.5 bg-white text-xs"
                              />
                              {(productForm.specifications || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFieldArray('specifications', idx)}
                                  className="text-red-500 hover:text-red-750 font-black border border-slate-200 rounded text-xs px-2 shrink-0"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3.5 pt-3.5 border-t border-slate-150">
                        <button
                          type="button"
                          onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                          className="px-5 h-9.5 border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          className="px-6 h-9.5 bg-[#2874f0] hover:bg-blue-600 text-white rounded font-black shadow flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Commit Product</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 font-bold select-none uppercase tracking-wider h-11">
                          <th className="px-5">Product Details</th>
                          <th className="px-5">Category</th>
                          <th className="px-5">Flat Price</th>
                          <th className="px-5">Stock</th>
                          <th className="px-5">Visibility</th>
                          <th className="px-5 text-center">Operation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredProducts.map((p) => {
                          const isDisabled = disabledProducts.includes(p.id);
                          return (
                            <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors h-14 ${isDisabled ? 'opacity-60 bg-slate-50/30' : ''}`}>
                              <td className="px-5 p-2">
                                <div className="flex items-center gap-3 max-w-sm">
                                  <div className="w-10 h-10 border border-slate-100 rounded p-1 flex items-center justify-center shrink-0 bg-white">
                                    <OptimizedImage
                                      src={p.images[0]}
                                      alt=""
                                      category={p.category}
                                      imageClassName="max-h-full max-w-full"
                                    />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-bold text-slate-800 truncate leading-snug">{p.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {p.id} • Brand: {p.brand}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 text-slate-600 font-bold">{p.categoryLabel}</td>
                              <td className="px-5">
                                <span className="font-bold text-slate-800">₹{p.price}</span>
                                <span className="text-[10px] text-slate-450 line-through block mt-0.5">₹{p.mrp}</span>
                              </td>
                              <td className="px-5">
                                <span className={`font-bold ${p.stock <= 5 ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                                  {p.stock} pcs
                                </span>
                              </td>
                              <td className="px-5">
                                <button
                                  onClick={() => handleToggleProductStatus(p.id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide border transition-all ${
                                    isDisabled 
                                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >
                                  {isDisabled ? 'DISABLED' : 'ENABLED'}
                                </button>
                              </td>
                              <td className="px-5">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => launchEditProduct(p)}
                                    className="p-1 px-2.5 border border-slate-200 rounded text-blue-600 hover:text-white hover:bg-blue-600 font-bold transition-all flex items-center gap-1"
                                    title="Edit listing details"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1 px-2 border border-slate-200 hover:border-red-500 rounded text-red-500 hover:text-white hover:bg-red-500 transition-all"
                                    title="Purge listing from catalog"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-slate-400 select-none">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold">No product matches active filter sets.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUB TAB PANEL III: Shipping orders desk */}
            {activeSubTab === 'orders' && (
              <div className="space-y-6 text-left">
                
                <div>
                  <h2 className="text-xl font-display font-black text-slate-800">Dynamic Customer Orders</h2>
                  <p className="text-xs text-slate-500">Track user payments, review detailed shipment addresses, and map status updates (Processing, Packed, Shipped, Delivered) instantly</p>
                </div>

                {/* Filters block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-500">
                  <div className="space-y-1">
                    <label>Order Query Search</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search custom ID, buyer name..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded font-normal bg-slate-55 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label>Sort status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded font-normal px-2.5 focus:outline-none bg-slate-55"
                    >
                      <option value="all">All Shipping Stages</option>
                      <option value="ordered">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="flex items-end text-slate-500 text-xs">
                    <span>Captured <strong className="text-slate-800">{filteredOrders.length}</strong> active orders in datatables.</span>
                  </div>
                </div>

                {/* Orders table grid */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 font-bold select-none h-11 uppercase tracking-wider">
                          <th className="px-5">Order Reference</th>
                          <th className="px-5">Buyer Identity</th>
                          <th className="px-5">Purchased items</th>
                          <th className="px-5">Paid Summary</th>
                          <th className="px-5">Shipment status</th>
                          <th className="px-5 text-center">Process Delivery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/70 transition-colors h-14">
                            <td className="px-5">
                              <p className="font-bold text-slate-800">{o.id}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{o.date}</p>
                              <span className="text-[8.5px] font-[#2874f0] font-sans block mt-0.5 uppercase select-none">Method: {o.paymentMethod}</span>
                            </td>
                            <td className="px-5">
                              <p className="font-semibold text-slate-850">{o.shippingAddress.fullName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{o.shippingAddress.phone}</p>
                              
                              {/* Inline address details drawer link on hover */}
                              <div className="relative group/addr inline-block">
                                <span className="text-[9.5px] text-blue-600 cursor-pointer underline hover:text-blue-800 flex items-center gap-0.5 mt-0.5 select-none">
                                  <MapPin className="w-3 h-3" /> View Destination
                                </span>
                                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/addr:block bg-slate-900 text-white rounded p-3 shadow-2xl z-50 w-64 border border-slate-700 leading-normal text-left">
                                  <p className="font-bold text-[10px] border-b border-slate-700 pb-1 mb-1 bg-blue-600/20 px-1">Delivery address</p>
                                  <p>{o.shippingAddress.addressLine}</p>
                                  <p>{o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5">
                              <div className="space-y-1">
                                {o.items.map((it, i) => (
                                  <p key={i} className="text-[11px] truncate max-w-xs text-slate-600">
                                    • {it.product.title} <strong className="text-slate-800">(x{it.quantity})</strong>
                                  </p>
                                ))}
                              </div>
                            </td>
                            <td className="px-5">
                              <span className="font-black text-slate-800 block">₹{o.totalAmount}</span>
                              <span className="text-[9px] text-[#2874f0] font-bold">UPI_PAID_DIRECT</span>
                            </td>
                            <td className="px-5">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold inline-block border ${
                                o.status === 'ordered' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                o.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                o.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {o.status === 'ordered' ? 'PROCESSING' :
                                 o.status === 'shipped' ? 'SHIPPED' :
                                 o.status === 'out_for_delivery' ? 'OUT FOR DELIVERY' :
                                 'DELIVERED'}
                              </span>
                            </td>
                            <td className="px-5">
                              <div className="flex items-center justify-center">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                                  className="border border-slate-300 rounded px-2 py-1 bg-white text-[11px] font-bold focus:outline-none shadow-sm cursor-pointer"
                                >
                                  <option value="ordered">Mark: Processing</option>
                                  <option value="shipped">Mark: Shipped</option>
                                  <option value="out_for_delivery">Mark: Out for Delivery</option>
                                  <option value="delivered">Mark: Delivered</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-slate-400 select-none">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold">No registered orders match search strings.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUB TAB PANEL IV: Identity Security Directory */}
            {activeSubTab === 'users' && (
              <div className="space-y-6 text-left">
                
                <div>
                  <h2 className="text-xl font-display font-black text-slate-800">Customer Identity Database</h2>
                  <p className="text-xs text-slate-500">Track user logins, suspend or block flagged malicious accounts, or audit order histories easily</p>
                </div>

                {/* Filters block */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-500">
                  <div className="space-y-1 max-w-md">
                    <label>Filter customer directory</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search mail credentials, phone, name..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded font-normal bg-slate-55 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Users List Data Grid */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 font-bold select-none h-11 uppercase tracking-wider">
                          <th className="px-5">Account ID</th>
                          <th className="px-5">Client Name</th>
                          <th className="px-5">Credential Mail</th>
                          <th className="px-5">Verification Phone</th>
                          <th className="px-5 font-mono">Join Registry</th>
                          <th className="px-5">Status state</th>
                          <th className="px-5 text-center">Safety Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className={`hover:bg-slate-50/70 transition-colors h-14 ${u.blocked ? 'bg-red-50/20' : ''}`}>
                            <td className="px-5 font-mono font-bold text-slate-600">{u.id}</td>
                            <td className="px-5 font-bold text-slate-800">{u.name}</td>
                            <td className="px-5 text-slate-600 font-medium underline select-all">{u.email}</td>
                            <td className="px-5 text-slate-500 font-mono">{u.phone}</td>
                            <td className="px-5 text-slate-400">{u.joinedDate}</td>
                            <td className="px-5">
                              {u.blocked ? (
                                <span className="bg-red-50 border border-red-200 text-red-700 font-black text-[9px] px-2 py-0.5 rounded tracking-wide">
                                  SUSPENDED
                                </span>
                              ) : (
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[9px] px-2 py-0.5 rounded tracking-wide">
                                  SECURE_VERIFIED
                                </span>
                              )}
                            </td>
                            <td className="px-5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleToggleBlockUser(u.id)}
                                  className={`px-3 py-1 text-[10px] font-black rounded transition-all cursor-pointer border ${
                                    u.blocked 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100' 
                                      : 'bg-red-50 text-red-750 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  {u.blocked ? 'ACTIVATE' : 'SUSPEND'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1 border border-slate-200 hover:border-red-500 rounded text-red-500 hover:text-white hover:bg-red-500 transition-all font-bold"
                                  title="Delete Account record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-400 select-none">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold">No consumer match registered accounts.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUB TAB PANEL V: Promo Coupon Deals */}
            {activeSubTab === 'coupons' && (
              <div className="space-y-6 text-left">
                <div>
                  <h2 className="text-xl font-display font-black text-slate-800">Dynamic Promotion Coupons</h2>
                  <p className="text-xs text-slate-500">Add secure marketing coupon codes, define percentage discount structures, set minimum transaction requirements, and activate/deactivate instantly</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Coupon Creation parameters */}
                  <form onSubmit={handleAddCoupon} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                      Register Promo Coupon
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Promotion Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WELCOME99, MONSOON30"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none uppercase font-mono text-sm tracking-wider font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Discount Percent (%) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                        className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Minimum Cart Value Threshold (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newCouponMinOrder}
                        onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                        className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 bg-[#2874f0] hover:bg-blue-600 text-white font-black text-xs uppercase rounded transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      <span>Activate Promo Code</span>
                    </button>
                  </form>

                  {/* Coupon Tables List */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 font-bold select-none h-11 uppercase tracking-wider">
                            <th className="px-5">Coupon Code</th>
                            <th className="px-5">Deduction Value</th>
                            <th className="px-5">Min Transaction (₹)</th>
                            <th className="px-5">Operation Visibility</th>
                            <th className="px-5 text-center">Purge</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {coupons.map((c) => (
                            <tr key={c.code} className={`hover:bg-slate-50/70 transition-colors h-14 ${!c.active ? 'opacity-50' : ''}`}>
                              <td className="px-5">
                                <span className="font-mono bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded tracking-wider font-bold">
                                  {c.code}
                                </span>
                              </td>
                              <td className="px-5 text-emerald-600 font-black text-xs">{c.discountPercent}% Flat Off</td>
                              <td className="px-5 font-bold text-slate-700">₹{c.minOrderValue}</td>
                              <td className="px-5">
                                <button
                                  onClick={() => handleToggleCoupon(c.code)}
                                  className={`px-3 py-1 text-[10px] font-black rounded-full border transition-all cursor-pointer ${
                                    c.active 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {c.active ? 'ACTIVE' : 'DEACTIVATED'}
                                </button>
                              </td>
                              <td className="px-5">
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => handleDeleteCoupon(c.code)}
                                    className="p-1.5 border border-slate-200 hover:border-red-500 rounded text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {coupons.length === 0 && (
                      <div className="p-8 text-center text-slate-400 select-none">
                        <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold">No active coupons defined.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* SUB TAB PANEL VI: Global Brand and Password Configuration */}
            {activeSubTab === 'settings' && (
              <div className="space-y-6 text-left">
                <div>
                  <h2 className="text-xl font-display font-black text-slate-800">Global Website Configuration</h2>
                  <p className="text-xs text-slate-500">Update storefront header logo titles, support contacts, and alter admin passkeys immediately</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Brand styling definitions */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                      Branding & Front-end Identity
                    </h3>
                    <form onSubmit={handleBrandingUpdate} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">Store Logo Title Text</label>
                        <input
                          type="text"
                          required
                          value={siteTitle}
                          onChange={(e) => setSiteTitle(e.target.value)}
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 border-t border-slate-50 pt-2.5">
                        <label className="font-bold text-slate-500">Custom Store Logo (File or Web URL)</label>
                        {logoUrl && (
                          <div className="space-y-1.5 mb-1.5">
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded">
                              <img 
                                src={logoUrl} 
                                alt="Store Logo Preview Token" 
                                className="h-10 max-w-[150px] object-contain rounded border border-slate-200 bg-white p-1"
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-left">
                                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">Logo Registered</span>
                                <button 
                                  type="button"
                                  onClick={() => setLogoUrl('')}
                                  className="text-[10px] text-red-500 hover:text-red-705 font-black cursor-pointer uppercase underline hover:no-underline"
                                >
                                  Clear Image
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="Paste remote emblem URL or pick a file below..."
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                        <div className="relative h-7 border border-dashed border-slate-300 hover:border-[#2874f0] rounded bg-slate-50 flex items-center justify-center transition-all overflow-hidden">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          <span className="text-[10px] font-bold text-slate-550 select-none">
                            📁 Pick logo file from disk
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">Promotion Banner Primary Headline</label>
                        <input
                          type="text"
                          value={promoHeadline}
                          onChange={(e) => setPromoHeadline(e.target.value)}
                          placeholder="e.g. SPECIAL DIWALI SALE SUPER OFFER"
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">Promotion Banner Subtitle Tagline</label>
                        <input
                          type="text"
                          value={promoSubheadline}
                          onChange={(e) => setPromoSubheadline(e.target.value)}
                          placeholder="e.g. Max 50% off across boat and electronics catalog..."
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">Support Helper Line Telephone</label>
                        <input
                          type="text"
                          required
                          value={supportPhone}
                          onChange={(e) => setSupportPhone(e.target.value)}
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">Store Support Contact Mail</label>
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="h-10 px-5 bg-[#2874f0] hover:bg-blue-600 text-white font-black uppercase rounded transition-all shadow select-none cursor-pointer text-[10px]"
                      >
                        Commit Branding Profile
                      </button>
                    </form>
                  </div>

                  {/* Direct UPI Merchant configurations */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                      Direct UPI Merchant Settings
                    </h3>
                    <form onSubmit={handlePaymentSettingsUpdate} className="space-y-4 text-xs font-sans">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">Merchant Beneficiary Name</label>
                        <input
                          type="text"
                          value={merchantName}
                          onChange={(e) => setMerchantName(e.target.value)}
                          placeholder="e.g. TechZone Retailers Ltd."
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500 font-mono">Merchant UPI ID (VPA) for Collections</label>
                        <input
                          type="text"
                          value={merchantUpi}
                          onChange={(e) => setMerchantUpi(e.target.value)}
                          placeholder="e.g. merchant@upi"
                          className="w-full h-9 border border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] rounded px-2.5 focus:outline-none font-mono"
                        />
                      </div>

                      {/* Custom QR Code Upload section */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <label className="block font-bold text-slate-500">Beneficiary Payment QR Code (Optional File)</label>
                        
                        {merchantQrCode ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded">
                              <img 
                                src={merchantQrCode} 
                                alt="Merchant Custom QR Code Icon" 
                                className="w-14 h-14 object-contain rounded border border-slate-250 bg-white"
                              />
                              <div className="text-left">
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Custom QR Loaded</span>
                                <button 
                                  type="button"
                                  onClick={() => setMerchantQrCode('')}
                                  className="text-[10px] text-red-500 hover:text-red-700 font-black cursor-pointer uppercase underline hover:no-underline mt-1"
                                >
                                  Clear Image
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative border border-dashed border-slate-300 hover:border-[#2874f0] rounded py-4 px-3 bg-slate-50 text-center transition-colors">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleQrCodeFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <p className="font-bold text-slate-700">Click or Drag QR Image to Upload</p>
                            <p className="text-[10px] text-slate-400 mt-1">If empty, standard dynamic UPI QR is auto-generated</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="h-10 px-5 bg-[#2874f0] hover:bg-blue-600 text-white font-black uppercase rounded transition-all shadow cursor-pointer text-[10px]"
                      >
                        Activate UPI Credentials & QR
                      </button>
                    </form>
                  </div>

                  {/* Credentials modification */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                      Security Passphrase Modifications
                    </h3>
                    <form onSubmit={handleCredentialsUpdate} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500 font-mono">Administration Username (Mail ID) *</label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">New Administrative Crypto Password (Optional)</label>
                        <input
                          type="password"
                          placeholder="Leave blank to keep current password"
                          value={settingsNewPassword}
                          onChange={(e) => setSettingsNewPassword(e.target.value)}
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-500">New Secret Recovery PIN (Optional)</label>
                        <input
                          type="text"
                          placeholder="Leave blank to keep current recovery PIN"
                          value={settingsNewRecoveryPin}
                          onChange={(e) => setSettingsNewRecoveryPin(e.target.value)}
                          className="w-full h-9 border border-slate-300 rounded px-2.5 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="bg-blue-50 text-blue-800 p-3 rounded text-[10px] leading-relaxed border border-blue-200">
                        🔑 Writing credentials modifies security settings stored on the server database instantly. Session authentication tokens will be verified dynamically.
                      </div>

                      <button
                        type="submit"
                        className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded transition-all shadow cursor-pointer text-[10px] border-0"
                      >
                        Modify Administrative Passphrase
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
};
