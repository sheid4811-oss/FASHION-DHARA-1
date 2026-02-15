
import React from 'react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onNavigate: (page: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 animate-in">
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-5xl font-black text-gray-900 uppercase tracking-[0.3em]">Purchase Portfolio</h1>
        <div className="flex items-center space-x-4">
           <span className="text-[11px] font-black text-amber-600 uppercase tracking-[0.4em] bg-amber-50 px-6 py-2.5 rounded-full border border-amber-100 shadow-sm">
             {orders.length} Verified Records
           </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[4rem] border border-gray-100 shadow-2xl">
          <div className="w-32 h-32 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 text-amber-200 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-2xl font-medium text-gray-400 mb-12 italic">"Your acquisition history is currently waiting to be established."</p>
          <button 
            onClick={() => onNavigate('home')}
            className="px-16 py-7 gold-bg text-black rounded-[3.5rem] font-black uppercase tracking-[0.4em] hover:brightness-110 transition-all shadow-2xl shadow-amber-500/20 active:scale-95 text-[11px]"
          >
            Examine New Collections
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[4rem] shadow-xl border border-gray-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:-translate-y-1">
              <div className="p-12 md:flex items-start justify-between bg-zinc-950 text-white">
                <div className="mb-8 md:mb-0">
                  <div className="flex items-center space-x-6 mb-4">
                    <span className="text-sm font-black text-amber-500 uppercase tracking-[0.4em] border border-amber-500/30 px-5 py-1.5 rounded-full">#RECORD_{order.id.toUpperCase()}</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border ${
                       order.status === 'completed' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' : 
                       'bg-amber-900/40 text-amber-400 border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em]">Verified on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3">Portfolio Value</p>
                  <p className="text-5xl font-black gold-gradient tracking-tighter">${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-12 bg-white">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 mb-12">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full aspect-[3/4] overflow-hidden rounded-[1.5rem] border border-gray-100 shadow-md transition-transform group-hover:scale-105">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      {item.quantity > 1 && (
                        <span className="absolute -top-3 -right-3 gold-bg text-black text-[11px] font-black w-8 h-8 flex items-center justify-center rounded-2xl shadow-xl border-2 border-white">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between pt-12 border-t border-gray-50 gap-8">
                  <div className="flex items-center space-x-8">
                     <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Logistics Unit</span>
                       <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{order.courier?.toUpperCase() || 'INTERNAL'}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Channel</span>
                       <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{order.paymentMethod?.toUpperCase() || 'CREDIT'}</span>
                     </div>
                  </div>
                  <button className="px-10 py-5 bg-zinc-900 text-amber-500 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center shadow-xl">
                    Download Official Record
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
