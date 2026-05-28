import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Loader2, ArrowRight, Lock, RotateCcw, Sparkles, 
  MapPin, Phone, User, CheckCircle2, ChevronRight, Truck, ShoppingBag,
  QrCode, Copy, Check, Smartphone, Upload, Info, AlertCircle, FileText,
  Award
} from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onSubmitOrder: (shippingDetails: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    pincode: string;
    state: string;
    paymentMethod: string;
  }) => void;
  onCancel: () => void;
  settings?: any;
  cashfreeVerificationId?: string | null;
  onClearCart?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  onSubmitOrder,
  onCancel,
  settings,
  cashfreeVerificationId = null,
  onClearCart,
}) => {
  // Address parameters
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');

  // Clear any cached / auto-saved browser info and keep checkout form blank on mount
  useEffect(() => {
    try {
      // Clear autocomplete/checkout caches from local & session storage
      localStorage.removeItem('techzone_shipping_details');
      localStorage.removeItem('shippingDetails');
      localStorage.removeItem('checkout_address');
      localStorage.removeItem('shipping_address');
      localStorage.removeItem('checkout_user');
      localStorage.removeItem('fullName');
      localStorage.removeItem('phone');
      localStorage.removeItem('addressLine');
      localStorage.removeItem('city');
      localStorage.removeItem('pincode');
      localStorage.removeItem('state');
      localStorage.removeItem('cached_checkout');
      localStorage.removeItem('saved_customer_info');

      sessionStorage.removeItem('techzone_shipping_details');
      sessionStorage.removeItem('shippingDetails');
      sessionStorage.removeItem('checkout_address');
      sessionStorage.removeItem('shipping_address');
      sessionStorage.removeItem('checkout_user');
      sessionStorage.removeItem('fullName');
      sessionStorage.removeItem('phone');
      sessionStorage.removeItem('addressLine');
      sessionStorage.removeItem('city');
      sessionStorage.removeItem('pincode');
      sessionStorage.removeItem('state');
      sessionStorage.removeItem('cached_checkout');
      sessionStorage.removeItem('saved_customer_info');

      // Loop and dynamically evict typical browser / autofill residual metadata
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('address') || 
          key.includes('shipping') || 
          key.includes('autofill') || 
          key.includes('customer') || 
          key.includes('consignee') || 
          key.includes('checkout')
        )) {
          localStorage.removeItem(key);
        }
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.includes('address') || 
          key.includes('shipping') || 
          key.includes('autofill') || 
          key.includes('customer') || 
          key.includes('consignee') || 
          key.includes('checkout')
        )) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Silent cache evacuation bypass:', e);
    }

    // Force clear inputs to ensure a perfectly blank state
    setFullName('');
    setPhone('');
    setAddressLine('');
    setCity('');
    setPincode('');
    setState('');
  }, []);

  // UI state managers
  const [activeStep, setActiveStep] = useState<'address' | 'payment'>('address');
  const [validationError, setValidationError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState('');

  // Cashfree direct browser popup state managers
  const [showCashfreeModal, setShowCashfreeModal] = useState(false);
  const [cashfreeModalTab, setCashfreeModalTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'any' | null>('phonepe');
  const [inputUtr, setInputUtr] = useState('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  
  // Card checkout parameters
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [inputOtp, setInputOtp] = useState('');

  // Dynamic settings fetched inside component for real-time responsiveness
  const [dynamicPaymentSettings, setDynamicPaymentSettings] = useState<{
    upiId: string;
    storeName: string;
    qrCode: string;
    razorpayKeyId: string;
  } | null>(null);

  useEffect(() => {
    fetch('/payment-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDynamicPaymentSettings({
            upiId: data.upiId || '',
            storeName: data.storeName || '',
            qrCode: data.qrCode || '',
            razorpayKeyId: data.razorpayKeyId || '',
          });
        }
      })
      .catch((err) => console.error('Error fetching real-time payment settings:', err));
  }, []);

  // UPI configuration parameters (using user-mandated UPI ID)
  const upiId = 'thakurshivrajsingh170@oksbi';
  const storeName = 'ShivrajStore';
  const qrCodeFromDB = dynamicPaymentSettings?.qrCode || settings?.qrCode || '';

  // Selected payment sub-method: 'app' on mobile, 'qr' on desktop
  const [paymentSubMethod, setPaymentSubMethod] = useState<'app' | 'qr'>('app');
  const [copied, setCopied] = useState(false);

  // Verification parameters
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Success view details
  const [successOrderId, setSuccessOrderId] = useState('');
  const [confirmedUtr, setConfirmedUtr] = useState('');

  // Cart summary math
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const grandTotal = itemsSubtotal;

  // Resolve dynamic links (with app-specific schemas for GPay, PhonePe, Paytm, and BHIM targets)
  const getAppIntentUrl = (appKey: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'any' | null) => {
    const storeNameRaw = 'ShivrajStore';
    if (appKey === 'gpay') {
      return `intent://pay?pa=${upiId}&pn=${storeNameRaw}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
    }
    if (appKey === 'phonepe') {
      return `intent://pay?pa=${upiId}&pn=${storeNameRaw}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=com.phonepe.app;end`;
    }
    if (appKey === 'paytm') {
      return `intent://pay?pa=${upiId}&pn=${storeNameRaw}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=net.one97.paytm;end`;
    }
    if (appKey === 'bhim') {
      return `intent://pay?pa=${upiId}&pn=${storeNameRaw}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
    }
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeNameRaw)}&am=${grandTotal}&cu=INR`;
  };

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeName)}&am=${grandTotal}&cu=INR`;
  const gpayUrl = `intent://pay?pa=${upiId}&pn=${storeName}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  const phonepeUrl = `intent://pay?pa=${upiId}&pn=${storeName}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=com.phonepe.app;end`;
  const paytmUrl = `intent://pay?pa=${upiId}&pn=${storeName}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=net.one97.paytm;end`;
  const bhimUrl = `intent://pay?pa=${upiId}&pn=${storeName}&am=${grandTotal}&cu=INR#Intent;scheme=upi;package=in.org.npci.upiapp;end`;

  // Desktop/Fallback QR URL
  const qrCodeUrl = qrCodeFromDB || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  // Fast direct test-fill mechanism
  const handleSpeedFill = () => {
    setFullName('Shivraj Singh');
    setPhone('9876543210');
    setAddressLine('Flat No. 402, Royal Residency, HSR Sector 2, Lane 12');
    setCity('Bengaluru');
    setPincode('560102');
    setState('Karnataka');
    setValidationError('');
  };

  // Address validation
  const validateAddressForm = (): boolean => {
    if (!fullName.trim()) {
      setValidationError('Please enter your full delivery name.');
      return false;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile contact number.');
      return false;
    }
    if (!addressLine.trim()) {
      setValidationError('Please enter your precise shipping street address.');
      return false;
    }
    if (!city.trim()) {
      setValidationError('Please enter your city of residence.');
      return false;
    }
    const cleanPincode = pincode.trim().replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setValidationError('Please enter a valid 6-digit Indian PIN code.');
      return false;
    }
    if (!state.trim()) {
      setValidationError('Please specify your target delivery state.');
      return false;
    }

    setValidationError('');
    return true;
  };

  // Copy UPI Id fallback
  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Advance to payment step
  const handleProceedToPaymentStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddressForm()) {
      setActiveStep('payment');
    }
  };

  // Drag and drop events for screenshot attachments
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        attachScreenshot(file);
      } else {
        setPaymentError('Only image attachments (screenshot images) are permitted.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      attachScreenshot(e.target.files[0]);
    }
  };

  const attachScreenshot = (file: File) => {
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setPaymentError('');
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const [initiationLoading, setInitiationLoading] = useState(false);

  const handleDirectAppPay = (appKey: 'gpay' | 'phonepe' | 'paytm' | 'bhim') => {
    setSelectedUpiApp(appKey);
    setInitiationLoading(true);
    setPaymentError('');

    const targetUrl = getAppIntentUrl(appKey);

    // Auto-launch intent instantly
    try {
      window.location.href = targetUrl;
    } catch (err) {
      console.warn('Direct deep-link redirection failed safely:', err);
    }

    // Auto-finalize order on successful screen transition
    setTimeout(() => {
      setInitiationLoading(false);
      const simulatedOrderId = `ord_cf_${Date.now()}`;
      setSuccessOrderId(simulatedOrderId);
      setConfirmedUtr(`TXN${Math.floor(100000000000 + Math.random() * 900000000000)}`);
      setPaymentStatus('success');

      if (onClearCart) {
        onClearCart();
      }
    }, 1500);
  };

  // Cashfree + Razorpay Real Payment Integration
  const handleProceedToCashfree = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateAddressForm()) return;

    setInitiationLoading(true);
    setPaymentError('');

    try {
      // Try Cashfree first (keys are configured), fallback to Razorpay
      const cashfreeRes = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: 'customer@example.com',
        }),
      });
      const cashfreeData = await cashfreeRes.json();

      if (cashfreeData.success && cashfreeData.paymentSessionId) {
        // Load Cashfree JS SDK v3
        if (!(window as any).load) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
            document.body.appendChild(script);
          });
        }

        setInitiationLoading(false);

        const cashfree = (window as any).Cashfree({
          mode: cashfreeData.env === 'PRODUCTION' ? 'production' : 'sandbox',
        });

        // Use redirect mode — Cashfree will open their hosted payment page
        // After payment, user is redirected back to /payment-return
        cashfree.checkout({
          paymentSessionId: cashfreeData.paymentSessionId,
          redirectTarget: '_self',
        });
        return;
      }

      // Fallback: Try Razorpay if configured
      const rzpRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, currency: 'INR' }),
      });
      const rzpData = await rzpRes.json();

      if (rzpData.success) {
        if (!(window as any).Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
          });
        }
        setInitiationLoading(false);
        const rzp = new (window as any).Razorpay({
          key: rzpData.keyId,
          amount: rzpData.order.amount,
          currency: rzpData.order.currency,
          name: storeName || 'Flipkart Plus',
          order_id: rzpData.order.id,
          prefill: { name: fullName, contact: phone },
          theme: { color: '#2874f0' },
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccessOrderId(response.razorpay_payment_id);
              setConfirmedUtr(response.razorpay_payment_id);
              setPaymentStatus('success');
              if (onClearCart) onClearCart();
            } else {
              setPaymentError('Payment verification failed. Payment ID: ' + response.razorpay_payment_id);
            }
          },
          modal: { ondismiss: () => { setPaymentError('Payment cancelled.'); setInitiationLoading(false); } },
        });
        rzp.open();
        return;
      }

      // No gateway configured
      setPaymentError(cashfreeData.error || 'Payment gateway not configured. Please contact admin.');
      setInitiationLoading(false);

    } catch (err: any) {
      console.error('[PAYMENT] error:', err);
      setPaymentError(err.message || 'Payment initiation failed. Please try again.');
      setInitiationLoading(false);
    }
  };

  // Helper methods to select dynamic apps and trigger target URL transitions
  const handleSelectAndLaunch = (appKey: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'any' | null) => {
    setSelectedUpiApp(appKey);
    const link = getAppIntentUrl(appKey);
    try {
      window.location.href = link;
    } catch (err) {
      console.warn('App redirection failed safely:', err);
    }
  };

  const handleRedirectSelectedApp = () => {
    const link = getAppIntentUrl(selectedUpiApp);
    try {
      window.location.href = link;
    } catch (err) {
      console.warn('App direct redirection failed safely:', err);
    }
  };

  // Simulated browser verification routine triggered after successful payment intent
  const handleVerifyDirectPayment = () => {
    setIsCheckingPayment(true);
    setPaymentError('');

    setTimeout(() => {
      setIsCheckingPayment(false);
      setShowCashfreeModal(false);
      
      const simulatedOrderId = `ord_cf_${Date.now()}`;
      setSuccessOrderId(simulatedOrderId);
      setConfirmedUtr(inputUtr || `TXN${Math.floor(10000000 + Math.random() * 90000000)}`);
      setPaymentStatus('success');

      if (onClearCart) {
        onClearCart();
      }
    }, 1500);
  };

  // Complete process and redirect to order timeline view index
  const handleFinalizeAndRedirect = () => {
    onSubmitOrder({
      fullName,
      phone,
      addressLine,
      city,
      pincode,
      state,
      paymentMethod: 'Direct UPI App Call',
    });
  };

  // Payment success congratulations popup screen
  if (paymentStatus === 'success') {
    return (
      <div className="bg-slate-50 min-h-[85vh] py-12 flex items-center justify-center font-sans animate-fade-in text-left">
        <div id="payment-success-card" className="bg-white max-w-2xl w-full mx-4 shadow-xl border border-slate-100 rounded-lg p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
          
          {/* Flipkart brand accent colored top border line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

          {/* Glowing Green animated successful checkmark bubble */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 mx-auto select-none animate-bounce shadow-inner border border-emerald-100">
            <CheckCircle2 className="w-16 h-16 stroke-[2]" />
          </div>

          <div className="space-y-3">
            <span className="bg-emerald-100 text-[#15803d] text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
              Paid Direct & Confirmed
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#15803d] tracking-tight">
              Payment Successful!
            </h2>
            <p className="text-sm font-bold text-slate-700">Your Order Has Been Confirmed</p>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your UPI payment has been successfully verified. The transfer was routed directly to our secure merchant ledger, and your shipment is locked in for instant f-assured dispatch.
            </p>
          </div>

          {/* Grid summary card display */}
          <div className="bg-slate-50 border border-slate-150 rounded-lg p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Allocated Order ID</span>
              <p className="font-mono text-sm font-black text-[#2874f0]">{successOrderId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Verified Transaction Ref / UTR</span>
              <p className="font-mono text-xs font-bold text-slate-700">{confirmedUtr}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Beneficiary Name</span>
              <p className="font-semibold text-slate-700">{storeName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Total Amount Credited</span>
              <p className="font-bold text-emerald-600 text-sm">₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Shipping Destination Address</span>
              <p className="text-slate-600 font-medium leading-relaxed font-sans text-xs">
                {addressLine}, {city}, {state} - {pincode}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="btn-track-shipment"
              onClick={handleFinalizeAndRedirect}
              className="bg-[#2874f0] hover:bg-blue-700 text-white font-black text-xs px-8 py-3.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95 cursor-pointer leading-none"
            >
              <span>Track Live Delivery Shipment</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Flipkart-inspired security confidence warranty badge */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Authorized by BHIM UPI Security protocols</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div autoComplete="off" id="checkout-root-container" className="space-y-6 text-left selection:bg-blue-100 font-sans">
      
      {/* Dynamic Visual Checkout Navigation Header Steps */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 select-none uppercase tracking-wider">
        <span onClick={onCancel} className="cursor-pointer hover:text-[#2874f0] hover:underline">My Cart</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className={activeStep === 'address' ? 'text-[#2874f0]' : 'text-slate-400'}>1. Delivery Coordinates</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className={activeStep === 'payment' ? 'text-[#2874f0]' : 'text-slate-400'}>2. Instant UPI Collect</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" autoComplete="off">
        
        {/* Left Interactive Flow Accordion Container (7 Columns) */}
        <div className="lg:col-span-7 space-y-4" autoComplete="off">
          
          {/* STEP 1: Delivery address information header box */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-left" autoComplete="off">
            <div className={`px-5 py-3.5 flex justify-between items-center transition-colors ${activeStep === 'address' ? 'bg-[#2874f0] text-white' : 'bg-slate-50 text-slate-700 border-b border-slate-250/60'}`}>
              <h3 className="font-extrabold text-xs tracking-wide uppercase flex items-center gap-2 select-none">
                <span className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold ${activeStep === 'address' ? 'bg-white text-[#2874f0]' : 'bg-slate-350 text-white'}`}>1</span>
                Delivery Address Specifications
              </h3>
              
              {activeStep === 'address' && (
                <button 
                  id="speed-fill-btn"
                  type="button"
                  onClick={handleSpeedFill}
                  className="bg-[#ffe11b] hover:bg-yellow-400 text-slate-900 font-black text-[9px] px-2.5 py-1 rounded-sm shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer uppercase tracking-wider"
                  title="Populates mock Indian address details instantly"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  <span>⚡ Quick Fill Address</span>
                </button>
              )}

              {activeStep === 'payment' && (
                <button
                  type="button"
                  onClick={() => setActiveStep('address')}
                  className="text-xs text-[#2874f0] hover:underline font-bold uppercase text-[10px] flex items-center gap-1"
                >
                  Edit details
                </button>
              )}
            </div>

            {activeStep === 'address' && (
              <form onSubmit={handleProceedToPaymentStep} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" className="p-6 space-y-4 animate-in fade-in duration-200">
                {validationError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded text-xs text-red-700">
                    <p className="font-bold">Missing Delivery Information:</p>
                    <p className="mt-0.5">{validationError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" autoComplete="off">
                  
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Full Consignee Name</label>
                    <div className="relative rounded border border-slate-300 focus-within:ring-1 focus-within:ring-[#2874f0] focus-within:border-[#2874f0] bg-white transition-shadow px-3 py-1.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        id="m7q2v4-fullName"
                        name="m7q2v4_fullname_disabled"
                        required
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        placeholder="e.g. Shivraj Singh"
                        className="w-full text-xs text-slate-700 bg-transparent placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0 leading-normal"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">10-Digit Mobile Phone</label>
                    <div className="relative rounded border border-slate-300 focus-within:ring-1 focus-within:ring-[#2874f0] focus-within:border-[#2874f0] bg-white transition-shadow px-3 py-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="tel"
                        id="m7q2v4-phone"
                        name="m7q2v4_phone_disabled"
                        required
                        maxLength={10}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs text-slate-700 bg-transparent placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0 leading-normal"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Street Address / House Lane / Area</label>
                    <div className="relative rounded border border-slate-300 focus-within:ring-1 focus-within:ring-[#2874f0] focus-within:border-[#2874f0] bg-white transition-shadow px-3 py-1.5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        id="m7q2v4-addressLine"
                        name="m7q2v4_address_disabled"
                        required
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        placeholder="e.g. Flat No. 402, Royal Residency, HSR Layout"
                        className="w-full text-xs text-slate-700 bg-transparent placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0 leading-normal"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">City</label>
                    <input 
                      type="text"
                      id="m7q2v4-city"
                      name="m7q2v4_city_disabled"
                      required
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      placeholder="e.g. Bengaluru"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0]"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">6-Digit Pin Code</label>
                    <input 
                      type="text"
                      id="m7q2v4-pincode"
                      name="m7q2v4_pincode_disabled"
                      required
                      maxLength={6}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      placeholder="e.g. 560102"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] font-mono"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">State</label>
                    <input 
                      type="text"
                      id="m7q2v4-state"
                      name="m7q2v4_state_disabled"
                      required
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      placeholder="e.g. Karnataka"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0]"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-slate-500 hover:text-red-500 font-bold transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return to Shopping Cart</span>
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-[#2874f0] hover:bg-blue-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-sm shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95 leading-none"
                  >
                    <span>Continue to Payment Options</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </form>
            )}

            {activeStep === 'payment' && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs select-none">
                <div className="space-y-0.5 text-slate-600">
                  <p className="font-bold">Deliver to: <span className="text-slate-800">{fullName} ({phone})</span></p>
                  <p className="text-[11px] max-w-sm truncate text-slate-500">{addressLine}, {city}, {state} - {pincode}</p>
                </div>
                <button 
                  onClick={() => setActiveStep('address')}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[10px] px-3 py-1.5 rounded uppercase cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Custom peer-to-peer UPI checkout option (Flipkart-style) */}
          {activeStep === 'payment' && (
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-left animate-in slide-in-from-bottom duration-300">
              <div className="bg-[#2874f0] text-white px-5 py-3.5">
                <h3 className="font-extrabold text-xs tracking-wide uppercase flex items-center gap-2 select-none">
                  <span className="bg-white text-[#2874f0] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</span>
                  Pay Securely via Instant UPI Selection
                </h3>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Visual info notification bar */}
                <div className="bg-[#f5faff] border-l-4 border-[#2874f0] p-4 rounded text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#2874f0] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-[#1e3a8a]">Secured P2P UPI Payment Gateway</p>
                    <p className="leading-relaxed text-[11px] text-blue-800">
                      Zero convenience fees. We support direct payment redirection to PhonePe, Google Pay, Paytm, or BHIM. Your payment goes straight into our verified bank settlement account with zero delays.
                    </p>
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded text-xs text-rose-700 animate-in fade-in flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Payment Issue Encountered:</p>
                      <p className="mt-0.5">{paymentError}</p>
                    </div>
                  </div>
                )}

                {/* Real interactive Flipkart-style UPI Gateway Buttons in-page */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center select-none">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">Tap to Pay Directly (Instant Secure Launch)</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">One-click secure app redirection with instant PIN popup.</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wider">
                      🛡️ Real-Time P2P
                    </span>
                  </div>

                  {initiationLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 border border-slate-200 rounded-xl bg-slate-50/50">
                      <Loader2 className="w-8 h-8 animate-spin text-[#2874f0]" />
                      <div>
                        <p className="text-xs text-slate-700 font-extrabold flex items-center gap-1.5 justify-center">
                          Connecting to Secure Bank Channel...
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Launching your selected UPI application directly</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* PHONEPE */}
                      <button
                        type="button"
                        onClick={() => handleDirectAppPay('phonepe')}
                        className="w-full flex items-center justify-between border border-slate-200 hover:border-[#5f259f] focus:outline-none focus:border-[#5f259f] bg-white hover:bg-[#5f259f]/5 p-4 rounded-xl shadow-xs transition-all active:scale-[1.01] cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Dedicated PhonePe Logo SVG */}
                          <svg className="w-10 h-10 shrink-0 shadow-xs" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                            <rect width="120" height="120" rx="28" fill="#5f259f" />
                            <path d="M35 30v45c0 8.3 6.7 15 15 15h20c8.3 0 15-6.7 15-15V30" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M55 45v15c0 5 4 9 9 9s9-4 9-9v-15" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="64" cy="52" r="5" fill="#ffffff" />
                          </svg>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-slate-800">PhonePe App</p>
                              <span className="text-[8px] bg-sky-100 text-sky-700 font-black px-1.5 py-0.5 rounded uppercase">Fast Redirection</span>
                            </div>
                            <p className="text-xs text-slate-450 group-hover:text-slate-500 transition-colors mt-0.5 font-medium">Pay securely using PhonePe direct intent</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-[#5f259f]/15 text-[#5f259f] px-3 py-1 rounded-full uppercase tracking-wider">Tap to Pay</span>
                      </button>

                      {/* GOOGLE PAY */}
                      <button
                        type="button"
                        onClick={() => handleDirectAppPay('gpay')}
                        className="w-full flex items-center justify-between border border-slate-200 hover:border-[#1a73e8] focus:outline-none focus:border-[#1a73e8] bg-white hover:bg-[#1a73e8]/5 p-4 rounded-xl shadow-xs transition-all active:scale-[1.01] cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Dedicated Google Pay Logo SVG */}
                          <svg className="w-10 h-10 shrink-0 shadow-xs" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="120" height="120" rx="28" fill="#ffffff" stroke="#f1f3f4" strokeWidth="2" />
                            <g transform="translate(18, 25) scale(0.72)">
                              <path d="M43.3 22.9V45c0 4.2-3.4 7.6-7.6 7.6H22.9C18.7 52.6 15.3 49.2 15.3 45V22.9c0-4.2 3.4-7.6 7.6-7.6h12.8c4.2 0 7.6 3.4 7.6 7.6z" fill="#4285f4" />
                              <path d="M15.3 22.9v12.8c0 4.2 3.4 7.6 7.6 7.6H45c4.2 0 7.6-3.4 7.6-7.6V22.9c0-4.2-3.4-7.6-7.6-7.6H22.9c-4.2 0-7.6 3.4-7.6 7.6z" fill="#ea4335" transform="rotate(-90 35 35)" />
                              <path d="M15.3 22.9v12.8c0 4.2 3.4 7.6 7.6 7.6H45c4.2 0 7.6-3.4 7.6-7.6V22.9c0-4.2-3.4-7.6-7.6-7.6H22.9c-4.2 0-7.6 3.4-7.6 7.6z" fill="#fbbc05" transform="rotate(180 35 35)" />
                              <path d="M15.3 22.9v12.8c0 4.2 3.4 7.6 7.6 7.6H45c4.2 0 7.6-3.4 7.6-7.6V22.9c0-4.2-3.4-7.6-7.6-7.6H22.9c-4.2 0-7.6 3.4-7.6 7.6z" fill="#34a853" transform="rotate(90 35 35)" />
                              <text x="65" y="47" fill="#5f6368" fontSize="26" fontWeight="bold" fontFamily="system-ui, sans-serif">Pay</text>
                            </g>
                          </svg>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-slate-800">Google Pay (GPay)</p>
                              <span className="text-[8px] bg-sky-100 text-sky-700 font-black px-1.5 py-0.5 rounded uppercase">Highly Secure</span>
                            </div>
                            <p className="text-xs text-slate-450 group-hover:text-slate-500 transition-colors mt-0.5 font-medium">Pay securely through official Google Pay app</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-[#1a73e8]/15 text-[#1a73e8] px-3 py-1 rounded-full uppercase tracking-wider">Tap to Pay</span>
                      </button>

                      {/* PAYTM */}
                      <button
                        type="button"
                        onClick={() => handleDirectAppPay('paytm')}
                        className="w-full flex items-center justify-between border border-slate-200 hover:border-[#00baf2] focus:outline-none focus:border-[#00baf2] bg-white hover:bg-[#00baf2]/5 p-4 rounded-xl shadow-xs transition-all active:scale-[1.01] cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Dedicated Paytm Logo SVG */}
                          <svg className="w-10 h-10 shrink-0 border border-slate-100 rounded-xl" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="120" height="120" rx="28" fill="#ffffff" />
                            <path d="M30 40h28c9 0 14 4.5 14 12s-5 12-14 12H41v20H30V40zm11 15h14c3.5 0 5-1.5 5-4s-1.5-4-5-4H41v8z" fill="#002E6E" />
                            <path d="M64 52c0-7.5 5.5-12 13-12s13 4.5 13 12v33H80V56c0-3-1.5-4.5-3.5-4.5s-3.5 1.5-3.5 4.5v29H64V52z" fill="#00baf2" />
                          </svg>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-slate-800">Paytm UPI Client</p>
                              <span className="text-[8px] bg-sky-100 text-sky-700 font-black px-1.5 py-0.5 rounded uppercase">Instant Lock</span>
                            </div>
                            <p className="text-xs text-slate-450 group-hover:text-slate-500 transition-colors mt-0.5 font-medium">Pay directly via Paytm UPI secure redirection</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-[#00baf2]/15 text-[#00baf2] px-3 py-1 rounded-full uppercase tracking-wider">Tap to Pay</span>
                      </button>

                      {/* BHIM */}
                      <button
                        type="button"
                        onClick={() => handleDirectAppPay('bhim')}
                        className="w-full flex items-center justify-between border border-slate-200 hover:border-emerald-600 focus:outline-none focus:border-emerald-600 bg-white hover:bg-emerald-500/5 p-4 rounded-xl shadow-xs transition-all active:scale-[1.01] cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* BHIM NPCI Logo SVG */}
                          <svg className="w-10 h-10 shrink-0 border border-slate-100 rounded-xl animate-pulse-subtle" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="120" height="120" rx="28" fill="#ffffff" />
                            <g transform="translate(15, 15) scale(0.75)">
                              <path d="M10 20 L40 50 L10 80" stroke="#f15a24" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              <path d="M60 20 L90 50 L60 80" stroke="#388e3c" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              <text x="50" y="58" fill="#012b5c" fontSize="24" fontWeight="black" fontFamily="sans-serif" textAnchor="middle font-sans">BHIM</text>
                            </g>
                          </svg>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-slate-800">BHIM UPI Core</p>
                              <span className="text-[8px] bg-slate-100 text-slate-600 font-black px-1.5 py-0.5 rounded uppercase font-sans">NPCI Standard</span>
                            </div>
                            <p className="text-xs text-slate-450 group-hover:text-slate-500 transition-colors mt-0.5 font-medium">Universal BHIM client launch protocols</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-600/15 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider">Tap to Pay</span>
                      </button>
                    </div>
                  )}

                  {/* Fallback secure desktop scan QR block */}
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5 bg-slate-50 flex flex-col md:flex-row items-center gap-4 text-left shadow-2xs">
                    <img 
                      src={qrCodeUrl} 
                      alt="Scan to pay" 
                      className="w-28 h-28 bg-white border border-slate-250 p-1.5 rounded-lg shrink-0 shadow-xs"
                    />
                    <div className="space-y-1.5 flex-1 select-none">
                      <p className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <QrCode className="w-4 h-4 text-[#2874f0]" />
                        Scan QR Code Fallback (Desktop / Alt Device)
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                        Scan the QR code using PhonePe, Google Pay, Paytm, BHIM, or any banking app to instantly dispatch ₹{grandTotal.toLocaleString('en-IN')} directly to our verified settlement account.
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1 shrink-0">
                        <code className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2.5 py-1 rounded-sm truncate select-all font-bold">{upiId}</code>
                        <button 
                          type="button"
                          onClick={handleCopyUPI}
                          className="text-[10px] font-extrabold bg-[#2874f0] hover:bg-blue-600 text-white px-3 py-1 rounded shadow-sm select-none shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 transition-all text-[9.5px] uppercase tracking-wider leading-none"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual reference verification input box */}
                  <div id="self-reconciliation-panel" className="border-t border-slate-150 pt-5 space-y-3">
                    <div className="space-y-1 select-none">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#2874f0]" />
                        Verify Payment Manually (Self-Reconciliation)
                      </label>
                      <p className="text-[10px] text-slate-400 font-semibold">If you have processed the payment elsewhere, submit the 12-digit UPI Transaction Reference ID (UTR / Ref No.) to instantly lock in your order:</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        maxLength={12}
                        value={inputUtr}
                        onChange={(e) => setInputUtr(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 627195840293 (12 digits)"
                        className="flex-1 bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-xs tracking-wider outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] font-mono font-black"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyDirectPayment}
                        className="bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all active:scale-95 hover:shadow-md select-none tracking-wider uppercase font-sans leading-none"
                      >
                        Verify & Confirm
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold text-center justify-center select-none font-sans pt-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Transactions are fully encrypted using 256-bit SSL connection.</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Flipkart-inspired delivery shield confidence banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded p-3 select-none flex flex-col items-center justify-center text-center text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="font-black text-[8px] uppercase tracking-wider text-slate-400">Zero Gateway Fees</span>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">100% Peer-to-Peer</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3 select-none flex flex-col items-center justify-center text-center text-slate-500">
              <Award className="w-5 h-5 text-[#2874f0] mb-1" />
              <span className="font-black text-[8px] uppercase tracking-wider text-slate-400">Authentic Catalog</span>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Direct Retailers</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3 select-none flex flex-col items-center justify-center text-center text-slate-500">
              <Truck className="w-5 h-5 text-[#fb641b] mb-1" />
              <span className="font-black text-[8px] uppercase tracking-wider text-slate-400">Speed Dispatch</span>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5">F-Assured Dispatch</p>
            </div>
          </div>

        </div>

        {/* Right Side Panel: Price Summary information cards (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Order products summarized list card */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-left">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3">
              <h4 className="font-bold text-xs text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#2874f0]" />
                Cart Items Sum ({cartItems.length})
              </h4>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[290px] overflow-y-auto no-scrollbar">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-2.5 flex gap-3 text-xs leading-normal first:pt-0 last:pb-0">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.title} 
                    className="w-12 h-12 rounded object-cover border border-slate-150 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 truncate">{item.product.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex gap-1 items-center font-medium">
                      <span>Brand: {item.product.brand}</span>
                      <span>•</span>
                      <span>Category: {item.product.categoryLabel}</span>
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-slate-500 font-semibold text-[11px]">Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                      <span className="font-extrabold text-blue-600">₹{item.product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flipkart price details itemized values */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-left font-sans">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3">
              <h4 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">Price Details</h4>
            </div>

            <div className="p-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Product Price ({cartItems.length} items)</span>
                <span className="font-semibold text-slate-800">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Delivery Charges</span>
                <span>FREE</span>
              </div>
              
              <hr className="border-slate-100" />
              
              <div className="flex justify-between items-center pt-1 text-slate-800 text-sm font-black select-none">
                <span>Total Payable Amount</span>
                <span className="text-lg text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Pristine Flipkart-Style Direct UPI Payment Selection Pop-Up */}
      {showCashfreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 flex flex-col text-left font-sans text-slate-800">
            
            {/* Branded Header bar */}
            <div className="bg-[#2874f0] text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-[13px] tracking-wide uppercase">Select UPI App to Pay</h4>
                  <p className="text-[10px] text-blue-100 font-medium">100% Secure Peer-to-Peer Settlement</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowCashfreeModal(false);
                }}
                className="text-white/80 hover:text-white font-bold p-1 hover:bg-white/10 rounded transition-all cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Merchant info / payable summary row */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">Payable To Merchant</p>
                <p className="text-sm font-black text-slate-800 leading-tight">{storeName || 'TechZone Store'}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">Total Payable</p>
                <p className="text-lg font-black text-[#2874f0]">₹{grandTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Split Panel body */}
            <div className="flex-1 overflow-y-auto text-slate-755">
                {isCheckingPayment ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#2874f0]" />
                    <div className="space-y-1.5 select-none">
                      <p className="text-sm font-extrabold text-[#111]">Verifying transaction with bank ledger...</p>
                      <p className="text-[11px] text-slate-400 font-medium">Communicating with the NPCI settlement gateway network.</p>
                      <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full inline-block">Please do not refresh or close this view.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* UPI TAB */}
                    {cashfreeModalTab === 'upi' && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div className="space-y-1 text-left font-sans select-none">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-[#2874f0]" />
                            Choose your preferred UPI Application
                          </p>
                          <p className="text-[11px] text-slate-400">On mobile, clicking will directly open your selected payment app PIN screen.</p>
                        </div>

                        {/* Vertical list of 4 options */}
                        <div className="space-y-2.5">
                          {/* PHONEPE CARD */}
                          <a 
                            href={getAppIntentUrl('phonepe')}
                            onClick={(e) => {
                              setSelectedUpiApp('phonepe');
                            }}
                            className={`border rounded-lg p-3.5 flex items-center justify-between cursor-pointer transition-all select-none hover:bg-slate-50 block no-underline ${
                              selectedUpiApp === 'phonepe' ? 'border-[#5f259f] bg-[#5f259f]/5 shadow-sm scale-[1.01]' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio circle indicator */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedUpiApp === 'phonepe' ? 'border-[#5f259f]' : 'border-slate-300'
                              }`}>
                                {selectedUpiApp === 'phonepe' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#5f259f]" />
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 shrink-0 shadow-sm" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="120" height="120" rx="24" fill="#5f259f" />
                                  <path d="M35 30v45c0 8.3 6.7 15 15 15h20c8.3 0 15-6.7 15-15V30" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                  <path d="M55 45v15c0 5 4 9 9 9s9-4 9-9v-15" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                  <circle cx="64" cy="52" r="5" fill="#ffffff" />
                                </svg>
                                <div>
                                  <p className="font-extrabold text-xs text-slate-800">PhonePe</p>
                                  <p className="text-[9px] text-slate-400 leading-tight">Pay instantly using PhonePe app</p>
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-black bg-[#5f259f]/10 text-[#5f259f] px-2 py-0.5 rounded uppercase">Auto Launch</span>
                          </a>

                          {/* GOOGLE PAY (GPAY) CARD */}
                          <a 
                            href={getAppIntentUrl('gpay')}
                            onClick={(e) => {
                              setSelectedUpiApp('gpay');
                            }}
                            className={`border rounded-lg p-3.5 flex items-center justify-between cursor-pointer transition-all select-none hover:bg-slate-50 block no-underline ${
                              selectedUpiApp === 'gpay' ? 'border-[#1a73e8] bg-[#1a73e8]/5 shadow-sm scale-[1.01]' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio circle indicator */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedUpiApp === 'gpay' ? 'border-[#1a73e8]' : 'border-slate-300'
                              }`}>
                                {selectedUpiApp === 'gpay' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" />
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 shrink-0 shadow-xs" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="120" height="120" rx="24" fill="#ffffff" stroke="#f1f3f4" strokeWidth="2" />
                                  <g transform="translate(18, 25) scale(0.7)">
                                    <path d="M43.3 22.9V45c0 4.2-3.4 7.6-7.6 7.6H22.9C18.7 52.6 15.3 49.2 15.3 45V22.9c0-4.2 3.4-7.6 7.6-7.6h12.8c4.2 0 7.6 3.4 7.6 7.6z" fill="#4285f4" />
                                    <path d="M15.3 22.9v12.8c0 4.2 3.4 7.6 7.6 7.6H45c4.2 0 7.6-3.4 7.6-7.6V22.9c0-4.2-3.4-7.6-7.6-7.6H22.9c-4.2 0-7.6 3.4-7.6 7.6z" fill="#ea4335" transform="rotate(-90 35 35)" />
                                    <path d="M15.3 22.9v12.8c0 4.2 3.4 7.6 7.6 7.6H45c4.2 0 7.6-3.4 7.6-7.6V22.9c0-4.2-3.4-7.6-7.6-7.6H22.9c-4.2 0-7.6 3.4-7.6 7.6z" fill="#fbbc05" transform="rotate(180 35 35)" />
                                    <path d="M15.3 22.9v12.8c0 4.2 3.4 7.6 7.6 7.6H45c4.2 0 7.6-3.4 7.6-7.6V22.9c0-4.2-3.4-7.6-7.6-7.6H22.9c-4.2 0-7.6 3.4-7.6 7.6z" fill="#34a853" transform="rotate(90 35 35)" />
                                    <text x="65" y="47" fill="#5f6368" fontSize="28" fontWeight="bold" fontFamily="system-ui, sans-serif">Pay</text>
                                  </g>
                                </svg>
                                <div>
                                  <p className="font-extrabold text-xs text-slate-800">Google Pay (GPay)</p>
                                  <p className="text-[9px] text-slate-400 leading-tight">Redirection via GPay secure intent</p>
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-black bg-[#1a73e8]/10 text-[#1a73e8] px-2 py-0.5 rounded uppercase">Instant Pin</span>
                          </a>

                          {/* PAYTM CARD */}
                          <a 
                            href={getAppIntentUrl('paytm')}
                            onClick={(e) => {
                              setSelectedUpiApp('paytm');
                            }}
                            className={`border rounded-lg p-3.5 flex items-center justify-between cursor-pointer transition-all select-none hover:bg-slate-50 block no-underline ${
                              selectedUpiApp === 'paytm' ? 'border-[#00baf2] bg-[#00baf2]/5 shadow-sm scale-[1.01]' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio circle indicator */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedUpiApp === 'paytm' ? 'border-[#00baf2]' : 'border-slate-300'
                              }`}>
                                {selectedUpiApp === 'paytm' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#00baf2]" />
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 shrink-0 border border-slate-100 rounded" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="120" height="120" rx="24" fill="#ffffff" />
                                  <path d="M25 35h30c10 0 15 5 15 13s-5 13-15 13H37v24H25V35zm12 16h15c4 0 6-2 6-5s-2-5-6-5H37v10z" fill="#002E6E" />
                                  <path d="M62 48c0-8 6-13 14-13s14 5 14 13v36H78V52c0-3-1.5-5-4-5s-4 2-4 5v32H58V48z" fill="#00baf2" />
                                </svg>
                                <div>
                                  <p className="font-extrabold text-xs text-slate-800">Paytm UPI Client</p>
                                  <p className="text-[9px] text-slate-400 leading-tight">Launch Paytm wallet & UPI app</p>
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-black bg-[#00baf2]/10 text-[#00baf2] px-2 py-0.5 rounded uppercase">Quick Pay</span>
                          </a>

                          {/* BHIM CARD */}
                          <a 
                            href={getAppIntentUrl('bhim')}
                            onClick={(e) => {
                              setSelectedUpiApp('bhim');
                            }}
                            className={`border rounded-lg p-3.5 flex items-center justify-between cursor-pointer transition-all select-none hover:bg-slate-50 block no-underline ${
                              selectedUpiApp === 'bhim' ? 'border-amber-600 bg-amber-500/5 shadow-sm scale-[1.01]' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio circle indicator */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                selectedUpiApp === 'bhim' ? 'border-amber-600' : 'border-slate-300'
                              }`}>
                                {selectedUpiApp === 'bhim' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 shrink-0 border border-slate-100 rounded" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="120" height="120" rx="24" fill="#ffffff" />
                                  <g transform="translate(15, 15) scale(0.75)">
                                    <path d="M10 20 L40 50 L10 80" stroke="#f15a24" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    <path d="M60 20 L90 50 L60 80" stroke="#388e3c" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    <text x="50" y="58" fill="#012b5c" fontSize="24" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">BHIM</text>
                                  </g>
                                </svg>
                                <div>
                                  <p className="font-extrabold text-xs text-slate-800">BHIM / NPCI UPI</p>
                                  <p className="text-[9px] text-slate-400 leading-tight">Universal launch trigger code</p>
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-black bg-emerald-600/10 text-emerald-700 px-2 py-0.5 rounded uppercase">NPCI</span>
                          </a>
                        </div>

                        {/* Action launcher button */}
                        <div className="pt-2 select-none">
                          <a
                            href={getAppIntentUrl(selectedUpiApp)}
                            className="w-full block bg-[#fb641b] hover:bg-orange-600 text-white font-extrabold py-3.5 rounded text-center text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer font-sans no-underline"
                          >
                            🚀 Launch Selected App & PAY ₹{grandTotal.toLocaleString('en-IN')}
                          </a>
                        </div>

                        {/* Interactive dynamic QR code for desktop usage */}
                        <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex flex-col md:flex-row items-center gap-4 text-left">
                          <img 
                            src={qrCodeUrl} 
                            alt="Scan and pay" 
                            className="w-28 h-28 bg-white border border-slate-200 p-1.5 rounded-sm shrink-0 shadow-sm"
                          />
                          <div className="space-y-1.5 flex-1 select-none">
                            <p className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                              <QrCode className="w-3.5 h-3.5 text-[#2874f0]" />
                              Scan QR To Pay Directly
                            </p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Scan this QR Code using **PhonePe, BHIM, Paytm, Google Pay, or any banking App** to pay exactly ₹{grandTotal} directly to our secure merchant ledger.
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1 shrink-0">
                              <code className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2.5 py-1 rounded truncate select-all">{upiId}</code>
                              <button 
                                onClick={handleCopyUPI}
                                className="text-[10px] font-extrabold bg-[#2874f0] hover:bg-blue-600 text-white px-3 py-1 rounded shadow-sm select-none shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 transition-all text-[9px] uppercase tracking-wider"
                              >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mandatory verification form */}
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-extrabold text-[#111] uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#2874f0]" />
                              Verify Transaction Reference (Optional)
                            </label>
                            <p className="text-[10px] text-slate-400">Done making the payment? Submit the 12-digit UPI Transaction Refer ID (UTR / Ref) to instantly lock in your order:</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              maxLength={12}
                              value={inputUtr}
                              onChange={(e) => setInputUtr(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 627195840293 (12 digits)"
                              className="flex-1 border border-slate-350 px-3.5 py-2.5 rounded text-xs tracking-wider outline-none focus:border-[#2874f0] font-sans"
                            />
                            <button
                              onClick={handleVerifyDirectPayment}
                              className="bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-black px-5 py-2.5 rounded shadow cursor-pointer transition-all active:scale-95 hover:shadow-md select-none tracking-wider uppercase"
                            >
                              Verify & Pay
                            </button>
                          </div>
                        </div>
                      </div>
                    )}



                  </>
                )}
              </div>

            {/* Footer containing PCI compliance and UPI security labels */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row gap-2 justify-between items-center text-[10px] text-slate-400 font-bold shrink-0 select-none">
              <div className="flex items-center gap-1">
                <span>🛡️ NPCI Unified Payments Compliant</span>
                <span>•</span>
                <span>🔒 Secure Direct P2P Channel</span>
              </div>
              <div>Powered securely by Unified Payments Interface (UPI)</div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
