
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, User, Order, PaymentMethod, DeliveryZone, CourierService } from './types';
import { COURIER_SERVICES } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AIShopper from './components/AIShopper';
import Auth from './components/Auth';
import OrderHistory from './components/OrderHistory';
import AdminOrders from './components/AdminOrders';
import { generateProductDescription } from './services/geminiService';
import { syncOrderWithCourier } from './services/courierService';
import { api, ApiLog } from './services/api';

const WHATSAPP_NUMBER = "8801700000000"; 
const FACEBOOK_PAGE_URL = "https://facebook.com/fashiondhara.official";

type SortOption = 'default' | 'price-low-high' | 'price-high-low' | 'rating-high-low' | 'alphabetical';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<'products' | 'orders' | 'api'>('products');
  const [isLoading, setIsLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside');
  const [selectedCourier, setSelectedCourier] = useState<CourierService>('pathao');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodList, orderList] = await Promise.all([
          api.getProducts(),
          api.getOrders()
        ]);
        setProducts(prodList);
        setOrders(orderList);
        
        const savedUser = localStorage.getItem('fd_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        
        setApiLogs(api.getLogs());
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
      document.title = `${selectedProduct.name} | Fashion Dhara`;
    } else {
      document.title = `Fashion Dhara | Premium Luxury Collections`;
    }
  }, [selectedProduct, currentPage]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleBuyNow = (product: Product) => {
    // For Buy Now, we clear the cart and add just this item for an instant checkout experience
    setCart([{ ...product, quantity: 1 }]);
    setCurrentPage(user ? 'checkout' : 'login');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fd_user');
    setCurrentPage('home');
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = deliveryZone === 'inside' ? 80 : 150;
  const finalTotal = cartSubtotal + deliveryCost;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddOrUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 10;
    
    let description = formData.get('description') as string;
    if (!description || description.trim() === '') {
      description = await generateProductDescription(name, category);
    }
    
    if (editingProduct) {
      const updated = await api.updateProduct({ ...editingProduct, name, category, price, description, stock });
      setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name, category, price, description, rating: 5.0, stock,
        image: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/800/1000`,
        gallery: []
      };
      const created = await api.createProduct(newProduct);
      setProducts([created, ...products]);
    }
    setApiLogs(api.getLogs());
    e.currentTarget.reset();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Purge this asset from the API database?")) {
      await api.simulate('DELETE', `/api/v1/products/${id}`, 204);
      setProducts(products.filter(p => p.id !== id));
      setApiLogs(api.getLogs());
    }
  };

  const handleFinalCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCheckoutProcessing(true);
    setCheckoutStep(1); 
    
    setTimeout(async () => {
      setCheckoutStep(2); 
      setTimeout(async () => {
        setCheckoutStep(3); 
        setTimeout(async () => {
          const newOrder: Order = {
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            userId: user?.id || 'guest',
            customerName: checkoutForm.name,
            phoneNumber: checkoutForm.phone,
            shippingAddress: checkoutForm.address,
            deliveryZone,
            deliveryCost,
            items: [...cart],
            total: finalTotal,
            status: 'pending',
            paymentMethod,
            courier: selectedCourier,
            createdAt: new Date().toISOString()
          };
          
          await api.createOrder(newOrder);
          setOrders(prev => [newOrder, ...prev]);
          setApiLogs(api.getLogs());
          
          setIsCheckoutProcessing(false);
          setCart([]);
          setCheckoutStep(0);
          setCurrentPage('success');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setApiLogs(api.getLogs());
  };

  const handleAdminSyncCourier = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.courier) return;

    try {
      const result = await syncOrderWithCourier(order, order.courier);
      await api.simulate('POST', `/api/v1/courier/sync`, 200);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, courierTrackingId: result.trackingId, status: 'shipped' } : o));
      setApiLogs(api.getLogs());
    } catch (err) {
      alert("Logistic sync failed. Verify API provider connectivity.");
    }
  };

  const getSortedProducts = () => {
    const items = [...products];
    switch (sortBy) {
      case 'price-low-high': return items.sort((a, b) => a.price - b.price);
      case 'price-high-low': return items.sort((a, b) => b.price - a.price);
      case 'rating-high-low': return items.sort((a, b) => b.rating - a.rating);
      case 'alphabetical': return items.sort((a, b) => a.name.localeCompare(b.name));
      default: return items;
    }
  };

  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
      <header className="mb-16 text-center relative py-24 bg-black rounded-[4rem] overflow-hidden shadow-2xl border border-amber-500/20">
        <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #D4AF37, transparent)' }}></div>
        <div className="relative z-10 px-6">
          <div className="inline-block px-6 py-2.5 mb-8 text-[11px] font-black text-amber-500 bg-amber-500/10 rounded-full uppercase tracking-[0.4em] border border-amber-500/30">
            {user ? `ELEVATED SOCIETY MEMBER: ${user.name}` : "ESTABLISHED 1994 • LUXURY CONFLUENCE"}
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
            FASHION <span className="gold-gradient">DHARA</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-16 font-medium italic opacity-80">
            "Bridging the gap between heritage craft and contemporary elegance."
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 border-t border-white/10 pt-12">
            <div className="flex items-center space-x-5">
              <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Inventory Sort:</label>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-zinc-900 border-2 border-white/10 text-white text-xs font-bold rounded-2xl px-8 py-4 pr-14 appearance-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer outline-none"
                >
                  <option value="default">Exclusive Picks</option>
                  <option value="price-low-high">Value: Low to High</option>
                  <option value="price-high-low">Premium: High to Low</option>
                  <option value="rating-high-low">Hall of Fame Score</option>
                  <option value="alphabetical">Collections A-Z</option>
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-3xl h-[30rem] animate-pulse">
              <div className="bg-gray-100 h-2/3 rounded-t-3xl"></div>
              <div className="p-10 space-y-6">
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-6 bg-gray-100 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {getSortedProducts().map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
              onBuyNow={handleBuyNow}
              onClick={(p) => { setSelectedProduct(p); setCurrentPage('details'); }}
            />
          ))}
        </section>
      )}
      <AIShopper context={products.map(p => p.name).join(', ')} />
    </div>
  );

  const renderDetails = () => selectedProduct && (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in">
      <nav className="mb-12">
        <button onClick={() => setCurrentPage('home')} className="flex items-center text-amber-600 font-bold hover:text-amber-500 transition-all uppercase tracking-[0.3em] group text-[11px]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Catalog
        </button>
      </nav>
      
      <div className="lg:flex lg:gap-24">
        <div className="lg:w-1/2 mb-12 lg:mb-0">
          <div className="sticky top-32">
            <div 
              ref={imageContainerRef}
              className="relative overflow-hidden rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-gray-100 cursor-zoom-in aspect-[4/5] bg-white group"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={(e) => {
                if (!imageContainerRef.current) return;
                const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
                setZoomPos({ x: ((e.pageX - left) / width) * 100, y: ((e.pageY - top) / height) * 100 });
              }}
            >
              <img src={activeImage} alt={selectedProduct.name} className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isZooming ? 'scale-[2.5]' : 'scale-100'}`} style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}} />
            </div>

            {/* Gallery Thumbnails */}
            {(selectedProduct.gallery && selectedProduct.gallery.length > 0) && (
              <div className="flex gap-4 mt-8 overflow-x-auto pb-4 scrollbar-hide">
                {[selectedProduct.image, ...selectedProduct.gallery].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-32 flex-shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-amber-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`${selectedProduct.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:w-1/2 py-10">
          <header className="mb-12">
            <span className="text-[12px] font-black text-amber-600 uppercase tracking-[0.4em] px-8 py-4 bg-amber-50 rounded-full border border-amber-100 inline-block">Curated Excellence: {selectedProduct.category}</span>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mt-12 leading-[0.9] tracking-tighter uppercase">{selectedProduct.name}</h1>
          </header>
          <div className="text-7xl font-black text-gray-900 tracking-tighter mb-16 gold-gradient inline-block">${selectedProduct.price.toFixed(2)}</div>
          
          <div className="space-y-16">
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] mb-6">Artisanal Pedigree</h3>
              <p className="text-3xl text-gray-700 leading-relaxed font-medium italic border-l-[12px] border-amber-500 pl-12 py-4 shadow-sm bg-white rounded-r-3xl">{selectedProduct.description}</p>
            </div>
            
            <div className="flex flex-col gap-6 pt-10">
              <div className="flex flex-col sm:flex-row gap-8">
                <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-white border-2 border-black text-black py-8 px-12 rounded-[3.5rem] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all active:scale-95 shadow-xl text-xs">Secure in Boutique Bag</button>
                <button onClick={() => handleBuyNow(selectedProduct)} className="flex-1 gold-bg text-black py-8 px-12 rounded-[3.5rem] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-2xl shadow-amber-500/40 active:scale-95 text-xs">Instant Acquisition</button>
              </div>
            </div>
            
            <div className="pt-12 border-t border-gray-100 flex items-center space-x-12">
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated</span>
                 <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Original Certified</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Availability</span>
                 <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{selectedProduct.stock > 0 ? 'In Stock • Ships Today' : 'Waitlist Only'}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      <AIShopper context={`${selectedProduct.name} - ${selectedProduct.description}`} />
    </div>
  );

  const renderCart = () => (
    <div className="max-w-6xl mx-auto px-4 py-24 animate-in">
      <h1 className="text-6xl font-black mb-20 text-gray-900 uppercase tracking-[0.4em] text-center">Your Boutique Selection</h1>
      {cart.length === 0 ? (
        <div className="bg-white p-32 rounded-[5rem] shadow-2xl border border-gray-100 text-center">
          <div className="text-gray-100 mb-16"><svg className="w-40 h-40 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
          <p className="text-4xl font-black text-gray-300 uppercase tracking-[0.4em] mb-16">Collection Vacant</p>
          <button onClick={() => setCurrentPage('home')} className="px-16 py-7 gold-bg text-black rounded-[4rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 text-[11px]">Explore The Catalog</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100">
              <div className="space-y-12">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between pb-12 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-12">
                      <div className="w-24 h-32 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-50 bg-gray-50 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-black text-3xl text-gray-900 uppercase tracking-tighter leading-none mb-4">{item.name}</h4>
                        <div className="flex items-center space-x-6">
                           <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                             <button onClick={() => updateCartQuantity(item.id, -1)} className="px-4 py-2 hover:bg-gray-200 transition-colors font-black">-</button>
                             <span className="px-4 text-sm font-black text-gray-900">{item.quantity}</span>
                             <button onClick={() => updateCartQuantity(item.id, 1)} className="px-4 py-2 hover:bg-gray-200 transition-colors font-black">+</button>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] hover:text-red-600 transition-colors py-2 border-b border-transparent hover:border-red-600">Redact Item</button>
                        </div>
                      </div>
                    </div>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
             <div className="bg-black p-12 rounded-[4rem] shadow-2xl sticky top-32 text-white border border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-[0.4em] mb-12 border-b border-white/10 pb-8">Bag Summary</h3>
                <div className="space-y-6 mb-12">
                   <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]"><span>Items Total</span><span>${cartSubtotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]"><span>Est. Concierge</span><span>$0.00</span></div>
                </div>
                <div className="pt-8 border-t border-white/10 flex justify-between items-end mb-16">
                   <span className="text-xl font-black uppercase tracking-[0.3em]">Estimated</span>
                   <span className="text-5xl font-black gold-gradient tracking-tighter">${cartSubtotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setCurrentPage('checkout')} className="w-full py-8 gold-bg text-black rounded-[3rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 text-xs hover:brightness-110 transition-all">Proceed to Checkout</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
         <div className="lg:col-span-8">
           <div className="bg-white rounded-[4.5rem] shadow-2xl overflow-hidden border border-gray-50 p-16 md:p-24">
             <h2 className="text-6xl font-black text-gray-900 mb-20 text-center uppercase tracking-[0.4em]">SECURE CHECKOUT</h2>
             
             {isCheckoutProcessing ? (
               <div className="py-24 text-center space-y-16">
                 <div className="flex justify-center">
                    <div className="w-32 h-32 border-[12px] border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-2xl font-black text-gray-900 uppercase tracking-[0.3em]">{apiLogs[0]?.tech === 'Laravel' ? 'Synchronizing JSON Resources...' : 'Establishing Node.js Gateway...'}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.5em]">T-1 Security Protocol Active</p>
                 </div>
               </div>
             ) : (
               <form onSubmit={handleFinalCheckout} className="space-y-20">
                 <div className="space-y-12">
                   <h3 className="font-black text-gray-900 uppercase tracking-[0.4em] text-xs pb-6 border-b-2 border-amber-500/20 flex items-center">
                     <span className="w-4 h-10 gold-bg mr-6 rounded-sm"></span>Step 1: Elite Destination
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Portfolio Signature</label>
                        <input required value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} placeholder="Full Legal Identity" className="w-full bg-zinc-50 border-none rounded-[2rem] p-8 font-black focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-300" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] ml-2">Secure Line</label>
                        <input required value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} placeholder="+880..." className="w-full bg-zinc-50 border-none rounded-[2rem] p-8 font-black focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-300" />
                     </div>
                     <div className="md:col-span-2 space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] ml-2">Fulfillment Address</label>
                        <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} placeholder="Complete commercial or residential destination" className="w-full bg-zinc-50 border-none rounded-[2rem] p-8 font-black focus:ring-4 focus:ring-amber-500/10 h-44 placeholder:text-gray-300 resize-none"></textarea>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-12">
                   <h3 className="font-black text-gray-900 uppercase tracking-[0.4em] text-xs pb-6 border-b-2 border-amber-500/20 flex items-center">
                     <span className="w-4 h-10 gold-bg mr-6 rounded-sm"></span>Step 2: Logistics Partner
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                     {COURIER_SERVICES.map(c => (
                       <button key={c.id} type="button" onClick={() => setSelectedCourier(c.id)} className={`p-12 rounded-[3.5rem] border-2 flex flex-col items-center justify-center transition-all group ${selectedCourier === c.id ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-2xl' : 'border-gray-50 bg-gray-50 text-gray-300'}`}>
                         <span className={`text-6xl mb-6 transition-transform group-hover:scale-110 ${selectedCourier === c.id ? 'opacity-100' : 'opacity-40'}`}>{c.icon}</span>
                         <span className="text-[11px] font-black uppercase tracking-[0.4em]">{c.name}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 <button type="submit" className="w-full py-10 rounded-[4rem] font-black uppercase tracking-[0.5em] bg-black text-white hover:brightness-150 transition-all shadow-3xl active:scale-95 border-2 border-amber-500/50 text-[11px]">AUTHORIZE TRANSACTION & SHIP</button>
               </form>
             )}
           </div>
         </div>
         
         <div className="lg:col-span-4">
           <div className="bg-zinc-950 p-12 rounded-[4.5rem] shadow-2xl text-white sticky top-32 border border-white/5">
              <h3 className="text-2xl font-black uppercase tracking-[0.4em] mb-12 border-b border-white/10 pb-8">Final Summary</h3>
              <div className="space-y-8 mb-16">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex items-center space-x-5">
                         <img src={item.image} className="w-12 h-16 rounded-xl object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">{item.name}</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                         </div>
                      </div>
                      <span className="font-mono text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                   </div>
                 ))}
                 <div className="pt-8 border-t border-white/10 space-y-4">
                    <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest"><span>Net Assets</span><span>${cartSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest"><span>Premium Logistics</span><span>${deliveryCost.toFixed(2)}</span></div>
                 </div>
              </div>
              <div className="pt-8 border-t border-white/20 flex justify-between items-end">
                 <span className="text-xl font-black uppercase tracking-[0.3em]">Total</span>
                 <span className="text-6xl font-black gold-gradient tracking-tighter">${finalTotal.toFixed(2)}</span>
              </div>
           </div>
         </div>
       </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-4xl mx-auto px-4 py-32 animate-in">
      <div className="bg-white rounded-[5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden text-center p-32">
        <div className="w-40 h-40 gold-bg rounded-[3.5rem] flex items-center justify-center mx-auto mb-16 text-black text-6xl shadow-2xl shadow-amber-500/40 relative">
          <div className="absolute inset-0 bg-white rounded-[3.5rem] animate-ping opacity-20"></div>
          <svg className="w-20 h-20 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-10 uppercase tracking-[0.4em]">ACQUISITION COMPLETE</h1>
        <p className="text-2xl text-gray-500 font-medium mb-20 italic px-20 leading-relaxed opacity-80">
          "Your premium selection has been successfully synchronized. Our logistics team is now hand-packing your boutique assets for rapid transit."
        </p>
        
        <div className="bg-zinc-50 rounded-[3rem] p-12 mb-20 border border-gray-100 inline-block text-left shadow-inner">
           <div className="flex flex-col sm:flex-row items-center gap-16">
              <div>
                <span className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] mb-3">ORDER REFERENCE</span>
                <span className="text-3xl font-black text-amber-600 font-mono tracking-tighter">#{orders[0]?.id || 'FD-0000'}</span>
              </div>
              <div className="hidden sm:block w-px h-16 bg-gray-200"></div>
              <div>
                <span className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] mb-3">LOGISTICS TIER</span>
                <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full uppercase tracking-[0.2em] border border-emerald-200">ELITE DELIVERY ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-10">
          <button onClick={() => setCurrentPage('home')} className="px-16 py-8 bg-black text-white rounded-[4rem] font-black uppercase tracking-[0.4em] hover:brightness-150 transition-all shadow-2xl text-xs">Examine New Collections</button>
          <button onClick={() => setCurrentPage('orders')} className="px-16 py-8 border-2 border-black text-black rounded-[4rem] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-2xl text-xs">Review My Portfolio</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/40 flex flex-col selection:bg-amber-200">
      <Navbar cartCount={cartCount} user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'details' && renderDetails()}
        {currentPage === 'cart' && renderCart()}
        {currentPage === 'orders' && <OrderHistory orders={orders} onNavigate={setCurrentPage} />}
        {currentPage === 'checkout' && renderCheckout()}
        {currentPage === 'success' && renderSuccess()}
        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-16 animate-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-24 gap-12">
              <h1 className="text-7xl font-black flex items-center text-gray-900 tracking-tighter">
                <div className="w-24 h-24 gold-bg rounded-[2.5rem] flex items-center justify-center mr-10 text-black text-5xl font-black shadow-2xl shadow-amber-500/30">FD</div>
                SYSTEMS
              </h1>
              <div className="flex bg-white rounded-[2.5rem] p-2.5 shadow-2xl border border-gray-100">
                <button onClick={() => setAdminTab('products')} className={`px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all ${adminTab === 'products' ? 'gold-bg text-black shadow-xl' : 'text-gray-400 hover:text-amber-600'}`}>Inventory</button>
                <button onClick={() => setAdminTab('orders')} className={`px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all ${adminTab === 'orders' ? 'gold-bg text-black shadow-xl' : 'text-gray-400 hover:text-amber-600'}`}>Orders</button>
                <button onClick={() => setAdminTab('api')} className={`px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all ${adminTab === 'api' ? 'gold-bg text-black shadow-xl' : 'text-gray-400 hover:text-amber-600'}`}>Console</button>
              </div>
            </div>
            
            {adminTab === 'products' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-5">
                  <div className="bg-white p-16 rounded-[4.5rem] shadow-2xl border border-gray-100 sticky top-40">
                    <h2 className="text-4xl font-black mb-16 text-gray-900 uppercase tracking-[0.4em]">Resource Edit</h2>
                    <form className="space-y-12" onSubmit={handleAddOrUpdateProduct}>
                      <input required name="name" type="text" defaultValue={editingProduct?.name || ''} className="w-full bg-zinc-50 border-none rounded-[2rem] p-8 font-black focus:ring-4 focus:ring-amber-500/10 shadow-inner" placeholder="Asset Identifier" />
                      <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price || ''} className="w-full bg-zinc-50 border-none rounded-[2rem] p-8 font-black focus:ring-4 focus:ring-amber-500/10 shadow-inner" placeholder="Valuation ($)" />
                      <button type="submit" className="w-full py-10 gold-bg text-black rounded-[3.5rem] font-black uppercase tracking-[0.5em] shadow-2xl text-[11px] hover:brightness-110 transition-all">Synchronize Database</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-7">
                   <div className="bg-white rounded-[4.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-black text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">
                        <tr><th className="px-12 py-10 text-left">Identifier</th><th className="px-12 py-10 text-right">Value</th><th className="px-12 py-10 text-center">Protocol</th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-amber-50/10 transition-colors">
                            <td className="px-12 py-12 font-black text-2xl text-gray-900 uppercase tracking-tighter">{p.name}</td>
                            <td className="px-12 py-12 text-right font-black text-3xl text-gray-900 tracking-tighter">${p.price.toFixed(2)}</td>
                            <td className="px-12 py-12 text-center">
                              <div className="flex justify-center space-x-10">
                                <button onClick={() => setEditingProduct(p)} className="text-amber-600 font-black uppercase text-[10px] tracking-[0.3em] hover:gold-gradient transition-all">Revise</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-red-700 transition-all">Purge</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : adminTab === 'orders' ? (
              <AdminOrders orders={orders} onUpdateStatus={updateOrderStatus} onSyncCourier={handleAdminSyncCourier} />
            ) : apiLogs.length > 0 ? (
              <div className="bg-black rounded-[3rem] p-12 font-mono text-xs text-amber-500 shadow-2xl">
                 <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-white border-b border-white/10 pb-4">Live API Monitor</h2>
                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-6">
                    {apiLogs.map((l, i) => (
                      <div key={i} className="flex space-x-4 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-gray-500">[{l.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className="font-black text-white">{l.method}</span>
                        <span className="flex-1">{l.path}</span>
                        <span className="text-emerald-500">{l.status}</span>
                        <span className="text-blue-400">{l.runtime}</span>
                      </div>
                    ))}
                 </div>
              </div>
            ) : null}
          </div>
        )}
        {currentPage === 'login' && <Auth onLogin={async (u) => { 
          const loggedInUser = await api.login(u.email);
          setUser(loggedInUser);
          setApiLogs(api.getLogs());
          setCurrentPage('home');
        }} onNavigate={setCurrentPage} />}
      </main>
      <footer className="bg-black py-40 text-center border-t border-white/5 mt-32">
        <div className="max-w-7xl mx-auto px-10">
          <p className="text-8xl font-black text-white mb-16 tracking-tighter uppercase leading-none opacity-90">FASHION <span className="gold-gradient">DHARA</span></p>
          <div className="flex justify-center flex-wrap gap-16 text-[12px] font-black text-gray-500 uppercase tracking-[0.6em] mb-24">
             <button className="hover:text-amber-500 transition-colors">Boutique Portfolio</button>
             <button className="hover:text-amber-500 transition-colors">Elite Concierge</button>
             <button className="hover:text-amber-500 transition-colors">Global Logistics</button>
             <button className="hover:text-amber-500 transition-colors">Security Protocol</button>
          </div>
          <p className="text-[12px] text-zinc-900 font-bold uppercase tracking-[0.8em] opacity-40">&copy; 2024 FASHION DHARA INTERNATIONAL. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
