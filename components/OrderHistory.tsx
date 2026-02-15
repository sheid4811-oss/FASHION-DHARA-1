
import React from 'react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onNavigate: (page: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
          {orders.length} Records
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-8 text-lg">You haven't placed any orders yet.</p>
          <button 
            onClick={() => onNavigate('home')}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-8 md:flex items-start justify-between bg-gray-50/30">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">Order #{order.id.toUpperCase()}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-gray-900">${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full aspect-square object-cover rounded-xl border border-gray-100 shadow-sm"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center transition-colors">
                    Download Invoice
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
