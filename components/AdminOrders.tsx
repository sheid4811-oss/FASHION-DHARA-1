
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Gross Revenue</div>
          <div className="text-3xl font-black text-gray-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Pending Fulfillment</div>
          <div className="text-3xl font-black text-gray-900">{pendingCount}</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Active Shipments</div>
          <div className="text-3xl font-black text-gray-900">{shippedCount}</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-3">Completed Cycles</div>
          <div className="text-3xl font-black text-gray-900">{completedCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-black text-gray-900">Live Logistics Feed</h2>
            <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {filteredOrders.length} Records
            </div>
          </div>
          
          <div className="flex bg-gray-50 rounded-xl p-1">
            {(['all', 'pending', 'shipped', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6 text-left">Order & Gateway</th>
                <th className="px-10 py-6 text-left">Receiver & Courier</th>
                <th className="px-10 py-6 text-left">Logistic Actions</th>
                <th className="px-10 py-6 text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="text-gray-300 font-black text-xl mb-2 uppercase tracking-widest">Zero Data Points</div>
                    <p className="text-gray-400 text-sm">No logistics matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-indigo-50/5 transition-colors align-top">
                    <td className="px-10 py-8">
                      <div className="font-mono text-xs text-indigo-600 font-black mb-1">#{order.id}</div>
                      <div className="text-[10px] text-gray-400 font-bold mb-3">{new Date(order.createdAt).toLocaleString()}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-gray-900 text-white px-2.5 py-1 rounded-lg">
                        {order.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-sm font-black text-gray-900 mb-1">{order.customerName}</div>
                      <div className="text-xs text-indigo-500 font-black mb-3">{order.phoneNumber}</div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Courier:</span>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase">
                          {COURIER_SERVICES.find(c => c.id === order.courier)?.name || order.courier}
                        </span>
                      </div>
                      {order.courierTrackingId && (
                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block uppercase tracking-widest">
                          Tracking: {order.courierTrackingId}
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col space-y-3">
                        <div className="relative group inline-block">
                          <select 
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border-none focus:ring-4 focus:ring-indigo-100 cursor-pointer transition-all pr-10 appearance-none w-full ${
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            <option value="pending">Reviewing</option>
                            <option value="shipped">Dispatched</option>
                            <option value="completed">Delivered</option>
                          </select>
                        </div>
                        
                        {!order.courierTrackingId && order.status !== 'completed' && (
                          <button 
                            onClick={() => handleSync(order.id)}
                            disabled={syncingId === order.id}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {syncingId === order.id ? (
                               <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : null}
                            <span>Sync {COURIER_SERVICES.find(c => c.id === order.courier)?.name.split(' ')[0]} API</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="text-xl font-black text-gray-900 mb-1">${order.total.toFixed(2)}</div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{order.items.length} units</div>
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
