import React, { useState } from 'react';
import { ClipboardList, Calendar, MapPin, CheckCircle, Package, Truck, Smile, Star, ArrowRight, TrendingUp } from 'lucide-react';
import { Order, Product } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface OrdersViewProps {
  orders: Order[];
  onAdvanceOrderStatus: (orderId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onAdvanceOrderStatus,
  onSelectProduct,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return 0;
      case 'shipped': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardList className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-800">No Orders Found!</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          You have not placed any orders yet. Put some premium electronic gadgets into your cart and experience secure delivery simulation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 py-6 text-left">
      <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" />
        My Registered Orders ({orders.length})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Orders list selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 font-semibold flex items-center gap-2 leading-snug">
            <TrendingUp className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            <span>Select below to track individual parcel steps and test status metrics!</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100 shadow-sm max-h-[500px] overflow-y-auto">
            {orders.map((o) => {
              const isActive = o.id === selectedOrderId;
              const stepCount = getStepIndex(o.status) + 1;

              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`p-4 cursor-pointer text-left transition-all ${
                    isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-slate-800">#{o.id}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ordered: {o.date}</span>
                  </div>

                  <div className="text-xs text-slate-600 font-bold mt-2 truncate">
                    {o.items.length} Product{o.items.length > 1 ? 's' : ''} • ₹{o.totalAmount.toLocaleString('en-IN')}
                  </div>

                  {/* Delivery bar preview */}
                  <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${o.status === 'delivered' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${(stepCount / 4) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Hand: Detailed Tracking Status Screen (8 Cols) */}
        {activeOrder && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Flipkart-style Tracking Banner */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-400 font-mono">ORDER SPECIFICATION ID: #{activeOrder.id}</h3>
                  <p className="text-slate-800 font-semibold text-xs mt-1">Paid via: <strong className="text-blue-600">{activeOrder.paymentMethod} Payment</strong></p>
                </div>
                
                {/* Advanced Status Simulator Control Panel */}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">SIMULATION TOOLBOX</div>
                    <div className="text-[10px] text-amber-700 font-sans">Toggle status cycle to test layout changes:</div>
                  </div>
                  <button
                    onClick={() => onAdvanceOrderStatus(activeOrder.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded transition-all flex items-center gap-1 active:scale-95"
                    disabled={activeOrder.status === 'delivered'}
                  >
                    <span>Advance Shipment →</span>
                  </button>
                </div>
              </div>

              {/* Flipkart-inspired Steps Layout circles */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-8">Shipping Timeline Track</h4>
                
                <div className="relative flex justify-between">
                  {/* Gray background progress bar */}
                  <div className="absolute top-3.5 left-8 right-8 h-1 bg-slate-100 -z-10" />
                  
                  {/* Colored progress bar layer */}
                  <div 
                    className="absolute top-3.5 left-8 h-1 bg-blue-600 -z-10 transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${(getStepIndex(activeOrder.status) / 3) * 82}%` 
                    }}
                  />

                  {/* 4 Steps circles */}
                  {[
                    { key: 'ordered', label: 'Ordered Placed', desc: 'Aman Sharma confirmed parcel details.', icon: Package },
                    { key: 'shipped', label: 'Shipped Out', desc: 'Item handed over to logistics hub.', icon: HelpCircle },
                    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Currier partner near Bangalore.', icon: Truck },
                    { key: 'delivered', label: 'Delivered Safe', desc: 'Handed directly to recipient.', icon: Smile }
                  ].map((step, idx) => {
                    const currentIdx = getStepIndex(activeOrder.status);
                    const isDone = idx <= currentIdx;
                    const isActive = idx === currentIdx;
                    const StepIcon = step.key === 'shipped' ? Package : step.key === 'out_for_delivery' ? Truck : step.key === 'delivered' ? CheckCircle : Package;

                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 text-center relative px-2">
                        {/* Circle Indicator */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-400'
                        } ${isActive ? 'ring-4 ring-blue-100 scale-110' : ''}`}>
                          <StepIcon className="w-4 h-4" />
                        </div>

                        {/* Title text */}
                        <div className={`mt-2 font-bold text-xs ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                        </div>

                        {/* Tiny summary below */}
                        <p className="hidden md:block mt-1 text-[10px] text-slate-400 max-w-[120px] leading-snug">
                          {isDone ? step.desc : 'Scheduled'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Address Details & Delivery info boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded p-4 text-left">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  SHIPPING COORDINATES
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800">{activeOrder.shippingAddress.fullName}</div>
                  <div className="text-slate-500">{activeOrder.shippingAddress.addressLine}</div>
                  <div className="text-slate-500">
                    {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - <span className="font-mono font-semibold">{activeOrder.shippingAddress.pincode}</span>
                  </div>
                  <div className="text-slate-500 pt-1">Phone: {activeOrder.shippingAddress.phone}</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 text-left">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  INVOICE PAYMENT RECEIPT
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Items Gross Amount</span>
                    <span className="font-medium text-slate-800">₹{(activeOrder.totalAmount - 29).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Packaging Fee (Secure and box)</span>
                    <span className="font-medium text-slate-800">₹29</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-slate-200">
                    <span className="font-bold text-slate-800">Total Deducted Pay</span>
                    <span className="font-extrabold text-blue-600">₹{activeOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List Ordered items inside this shipment */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 text-left space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                Products In This Shipment
              </h4>
              
              <div className="divide-y divide-slate-100">
                {activeOrder.items.map((item) => (
                  <div 
                    key={item.product.id} 
                    onClick={() => onSelectProduct(item.product)}
                    className="py-3 last:pb-0 first:pt-0 flex gap-4 items-center cursor-pointer hover:bg-slate-50/50 rounded transition-colors pr-2"
                  >
                    <img 
                      src={item.product.images[0]} 
                      alt="" 
                      className="w-12 h-12 object-contain bg-slate-50 border border-slate-100 rounded p-1 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-800 text-sm hover:text-blue-600 truncate">
                        {item.product.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Brand: {item.product.brand} • Ordered Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-800 font-extrabold text-sm">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        (₹{item.product.price.toLocaleString('en-IN')} each)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

// Help helper icon for step circle fallback
const HelpCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
