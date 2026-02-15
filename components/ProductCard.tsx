
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
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer bg-gray-50"
        onClick={() => onClick(product)}
        role="button"
        aria-label={`View details for ${product.name}`}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-gray-800 border border-white/20 shadow-md">
          ★ {product.rating}
        </div>
        {product.stock < 10 && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
            Almost Sold Out
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <header className="mb-2">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{product.category}</span>
          <h3 
            className="text-xl font-black text-gray-900 mt-2 mb-1 truncate cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => onClick(product)}
          >
            {product.name}
          </h3>
        </header>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10 leading-relaxed font-medium">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Unit Price</span>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">${product.price.toFixed(2)}</span>
            </div>
            <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">In Stock</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="col-span-1 flex items-center justify-center p-4 rounded-xl bg-gray-50 text-gray-900 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform active:scale-90"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              className="col-span-3 py-4 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 shadow-xl shadow-indigo-100 transform active:scale-95"
            >
              Instant Purchase
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
