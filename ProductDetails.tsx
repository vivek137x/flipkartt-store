import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: () => void;
  onBrowseProducts: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onBrowseProducts,
}) => {
  // Calculations
  const totalMrp = cartItems.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalDiscountPrice = cartItems.reduce((acc, item) => acc + (item.product.mrp - item.product.price) * item.quantity, 0);
  const totalAmount = totalMrp - totalDiscountPrice;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const savings = totalDiscountPrice;

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-800">Your Cart is Empty!</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          Add some gadgets and electronic accessories to make your life smarter and work faster.
        </p>
        <button
          onClick={onBrowseProducts}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded shadow hover:shadow-lg transition-all"
        >
          Explore Electronics Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 py-6">
      <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-blue-600" />
        Shopping Cart ({totalItemCount} items)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Cart Items List (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100">
            {cartItems.map((item) => {
              const discountPercent = Math.round(
                ((item.product.mrp - item.product.price) / item.product.mrp) * 100
              );

              return (
                <div key={item.product.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  
                  {/* Photo */}
                  <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded p-2 flex items-center justify-center shrink-0 mx-auto sm:mx-0 overflow-hidden relative">
                    <OptimizedImage 
                      src={item.product.images[0]} 
                      alt={item.product.title} 
                      category={item.product.category}
                      imageClassName="max-h-full max-w-full" 
                      objectFit="contain"
                    />
                  </div>

                  {/* Info Column */}
                  <div className="flex-grow text-left space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.product.brand}</span>
                      {item.product.assured && (
                        <span className="bg-blue-50 text-blue-600 font-extrabold text-[8px] px-1 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                          f-Assured
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-slate-805 text-sm md:text-base leading-snug hover:text-blue-600 cursor-pointer">
                      {item.product.title}
                    </h3>
                    <div className="text-xs text-slate-400">Seller: Flipkart Assured Retailer</div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 pt-1.5">
                      <span className="text-slate-900 font-bold text-base">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                      {item.product.mrp > item.product.price && (
                        <>
                          <span className="text-slate-400 line-through text-xs">
                            ₹{item.product.mrp.toLocaleString('en-IN')}
                          </span>
                          <span className="text-emerald-600 font-bold text-xs">
                            {discountPercent}% Off
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity Actions & Remove button */}
                  <div className="flex sm:flex-col items-center justify-between gap-4 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 h-8 w-8 flex items-center justify-center border-r border-slate-200 transition-colors"
                        disabled={item.quantity <= 1}
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-slate-800 bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 h-8 w-8 flex items-center justify-center border-l border-slate-200 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 py-1 px-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>REMOVE</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Secure Payment / Safe Shipping Assurance Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm text-left flex gap-3.5 items-center">
            <ShieldCheck className="w-10 h-10 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">Safe and Secure Payments</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                100% Payment Protection. Secured using SSL certificates, encrypted network protocol parameters, and safe gateway interfaces.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Invoice Break-up Panel (4 Columns) */}
        <div className="lg:col-span-4 block">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 text-left space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
              PRICE DETAILS & BREAKUP
            </h3>

            {/* Bill Info rows */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Product Price ({totalItemCount} items)</span>
                <span>₹{totalMrp.toLocaleString('en-IN')}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Product Discount</span>
                  <span className="text-emerald-600 font-medium">- ₹{savings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <hr className="border-slate-100" />

              <div className="flex justify-between text-slate-800 font-extrabold text-base pt-1">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Discount Promo Info Card */}
            {savings > 0 && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-sm text-xs font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>You will save ₹{savings.toLocaleString('en-IN')} on this order! Just smart prices.</span>
              </div>
            )}

            {/* Proceed to checkout action button */}
            <button
              onClick={onPlaceOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm py-3 px-4 rounded shadow-md group active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>PROCEED TO CHECKOUT</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
