
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
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 gold-bg rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">FD</div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xl font-black text-white tracking-widest uppercase">FASHION</span>
                <span className="text-sm font-black gold-gradient tracking-[0.2em] uppercase">DHARA</span>
              </div>
            </button>
            <div className="hidden lg:flex space-x-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <button onClick={() => onNavigate('home')} className="hover:text-amber-500 transition-colors border-b-2 border-transparent hover:border-amber-500 pb-1">Catalog</button>
              {user && (
                <button onClick={() => onNavigate('orders')} className="hover:text-amber-500 transition-colors border-b-2 border-transparent hover:border-amber-500 pb-1">Portfolio</button>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => onNavigate('admin')} className="hover:text-amber-500 transition-colors border-b-2 border-transparent hover:border-amber-500 pb-1 text-amber-500">Logistics</button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8">
            <button 
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-white hover:text-amber-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none text-black transform translate-x-1/2 -translate-y-1/2 gold-bg rounded-full shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3 group">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-white leading-tight uppercase tracking-widest">{user.name}</span>
                  <button onClick={onLogout} className="text-[8px] text-gray-500 font-black uppercase tracking-wider hover:text-red-500 transition-colors">Sign Out</button>
                </div>
                <div className="h-10 w-10 rounded-xl gold-bg flex items-center justify-center text-black font-black shadow-lg border-2 border-white/10">
                  {user.name?.[0]?.toUpperCase() || 'D'}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="gold-bg text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-amber-500/10"
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
