
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  cartCount: number;
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, user, onNavigate, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-indigo-600 tracking-tight"
            >
              NovaShop
            </button>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
              <button onClick={() => onNavigate('home')} className="hover:text-indigo-600 transition-colors">Shop</button>
              {user && (
                <button onClick={() => onNavigate('orders')} className="hover:text-indigo-600 transition-colors">Orders</button>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-600 transition-colors">Admin</button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <button 
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900 leading-tight">{user.name}</span>
                  <button onClick={onLogout} className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-red-500 transition-colors">Logout</button>
                </div>
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
