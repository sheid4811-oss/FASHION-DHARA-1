
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onClick: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onBuyNow, onClick }) => {
  return (
    <article className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(212,175,55,0.2)] transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
      <div 
        className="relative aspect-[4/5] overflow-hidden cursor-pointer bg-gray-50"
        onClick={() => onClick(product)}
        role="button"
        aria-label={`View details for ${product.name}`}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 gold-bg px-3 py-1.5 rounded-xl text-[10px] font-black text-black border border-white/20 shadow-xl">
          ★ {product.rating}
        </div>
        {product.stock < 10 && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
            LIMITED EDITION
          </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <header className="mb-2">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{product.category}</span>
          <h3 
            className="text-2xl font-black text-gray-900 mt-3 mb-1 truncate cursor-pointer hover:text-amber-600 transition-colors leading-tight"
            onClick={() => onClick(product)}
          >
            {product.name}
          </h3>
        </header>
        <p className="text-sm text-gray-400 line-clamp-2 mb-8 h-10 leading-relaxed font-medium italic">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-1">Acquisition Price</span>
              <span className="text-3xl font-black text-gray-900 tracking-tighter gold-gradient inline-block">${product.price.toFixed(2)}</span>
            </div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Certified Original</div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="col-span-1 flex items-center justify-center aspect-square rounded-2xl bg-zinc-900 text-amber-500 hover:bg-amber-500 hover:text-black transition-all duration-300 transform active:scale-90 shadow-lg"
              aria-label={`Add ${product.name} to bag`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              className="col-span-4 py-4 rounded-2xl gold-bg text-black text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all duration-300 shadow-xl shadow-amber-500/10 transform active:scale-95"
            >
              Exquisite Purchase
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
