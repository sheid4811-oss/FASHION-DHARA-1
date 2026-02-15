
import React, { useState } from 'react';
import { Order, CourierService } from '../types';
import { COURIER_SERVICES } from '../constants';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onSyncCourier: (orderId: string) => Promise<void>;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus, onSyncCourier }) => {
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await onSyncCourier(id);
    setSyncingId(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:border-amber-500/20 transition-all">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">API REVENUE RESOURCE</div>
          <div className="text-4xl font-black text-gray-900 tracking-tighter">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:border-amber-500/20 transition-all">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">BACKEND PENDING</div>
          <div className="text-4xl font-black text-gray-900 tracking-tighter">{pendingCount}</div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:border-amber-500/20 transition-all">
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">NODE.JS ACTIVE</div>
          <div className="text-4xl font-black text-gray-900 tracking-tighter">{shippedCount}</div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:border-amber-500/20 transition-all">
          <div className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-4">SYSTEM COMPLETED</div>
          <div className="text-4xl font-black text-gray-900 tracking-tighter">{completedCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-12 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-widest">Transaction Log</h2>
            <div className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-200">
              API CONNECTED
            </div>
          </div>
          
          <div className="flex bg-zinc-50 rounded-2xl p-1.5 border border-gray-100">
            {(['all', 'pending', 'shipped', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-black text-amber-500 shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-950 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
              <tr>
                <th className="px-12 py-8 text-left">Gateway Request</th>
                <th className="px-12 py-8 text-left">Recipient Portfolio</th>
                <th className="px-12 py-8 text-left">Backend Actions</th>
                <th className="px-12 py-8 text-right">Resource Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-12 py-32 text-center text-gray-300 font-black text-2xl uppercase tracking-[0.4em] opacity-40">Zero Database Hits</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-amber-50/10 transition-colors align-top">
                    <td className="px-12 py-10">
                      <div className="font-mono text-sm text-amber-600 font-black mb-2">#REQ_{order.id}</div>
                      <div className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-white px-3 py-1.5 rounded-xl border border-white/10">
                        METHOD: {order.paymentMethod?.toUpperCase() || 'COD'}
                      </span>
                    </td>
                    <td className="px-12 py-10">
                      <div className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">{order.customerName}</div>
                      <div className="text-xs text-amber-500 font-black mb-4">{order.phoneNumber}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{COURIER_SERVICES.find(c => c.id === order.courier)?.name}</div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex flex-col space-y-4">
                        <div className="relative">
                          <select 
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                            className={`text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl border-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer transition-all pr-12 appearance-none w-full ${
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            <option value="pending">API_REVIEW</option>
                            <option value="shipped">API_DISPATCH</option>
                            <option value="completed">API_FULFILLED</option>
                          </select>
                        </div>
                        
                        {!order.courierTrackingId && order.status !== 'completed' && (
                          <button 
                            onClick={() => handleSync(order.id)}
                            disabled={syncingId === order.id}
                            className="w-full bg-zinc-900 text-amber-500 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-lg"
                          >
                            {syncingId === order.id && <svg className="animate-spin h-3 w-3 text-amber-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            <span>TRIGGER BACKEND SYNC</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="text-3xl font-black text-gray-900 tracking-tighter mb-1">${order.total.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">RESOURCE_QTY: {order.items.length}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
