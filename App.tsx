
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, User, Order, PaymentMethod, DeliveryZone, CourierService } from './types';
import { MOCK_PRODUCTS, COURIER_SERVICES } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AIShopper from './components/AIShopper';
import Auth from './components/Auth';
import OrderHistory from './components/OrderHistory';
import AdminOrders from './components/AdminOrders';
import { generateProductDescription } from './services/geminiService';
import { syncOrderWithCourier } from './services/courierService';

const WHATSAPP_NUMBER = "8801700000000"; 
const FACEBOOK_PAGE_URL = "https://facebook.com/fashiondhara.official";

type SortOption = 'default' | 'price-low-high' | 'price-high-low' | 'rating-high-low' | 'alphabetical';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
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
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
      document.title = `${selectedProduct.name} | Fashion Dhara`;
    } else {
      document.title = `Fashion Dhara | Premium Fashion & Luxury Trends`;
    }
  }, [selectedProduct, currentPage]);

  useEffect(() => {
    if (user) setCheckoutForm(prev => ({ ...prev, name: user.name }));
  }, [user]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleBuyNow = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
    setCurrentPage(user ? 'checkout' : 'login');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleLogout = () => {
    setUser(null);
    setOrders([]);
    setCurrentPage('home');
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
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, name, category, price, description, stock } : p));
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name, category, price, description, rating: 5.0, stock,
        image: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/600/600`,
      };
      setProducts([newProduct, ...products]);
    }
    e.currentTarget.reset();
  };

  const handleFinalCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCheckoutProcessing(true);
    setCheckoutStep(1); 
    
    setTimeout(() => {
      setCheckoutStep(2); 
      setTimeout(() => {
        setCheckoutStep(3); 
        setTimeout(() => {
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
          setOrders(prev => [newOrder, ...prev]);
          setIsCheckoutProcessing(false);
          setCart([]);
          setCheckoutStep(0);
          setCurrentPage('success');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleAdminSyncCourier = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.courier) return;

    try {
      const result = await syncOrderWithCourier(order, order.courier);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, courierTrackingId: result.trackingId, status: 'shipped' } : o));
      alert(`Order synced successfully with ${order.courier.toUpperCase()}. Tracking ID: ${result.trackingId}`);
    } catch (err) {
      alert("Courier sync failed. Please check API credentials.");
    }
  };

  const sendWhatsAppOrder = () => {
    const itemsList = cart.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('%0A');
    const courierStr = COURIER_SERVICES.find(c => c.id === selectedCourier)?.name || selectedCourier;
    const message = `*New Order from Fashion Dhara*%0A%0A*Customer:* ${checkoutForm.name}%0A*Phone:* ${checkoutForm.phone}%0A*Address:* ${checkoutForm.address}%0A*Zone:* ${deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}%0A*Preferred Courier:* ${courierStr}%0A%0A*Items:*%0A${itemsList}%0A%0A*Total:* $${finalTotal.toFixed(2)}%0A%0APlease confirm my order.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const getSortedProducts = () => {
    const items = [...products];
    switch (sortBy) {
      case 'price-low-high':
        return items.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return items.sort((a, b) => b.price - a.price);
      case 'rating-high-low':
        return items.sort((a, b) => b.rating - a.rating);
      case 'alphabetical':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return items;
    }
  };

  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
      <header className="mb-12 text-center relative py-12 bg-black rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #D4AF37, transparent)' }}></div>
        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black text-amber-500 bg-amber-500/10 rounded-full uppercase tracking-[0.3em] border border-amber-500/20">
            Premium Fashion Destination
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            FASHION <span className="gold-gradient">DHARA</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10 font-medium italic">
            "Where Tradition Meets Modern Elegance."
          </p>

          <div className="flex justify-center items-center space-x-4 border-t border-white/5 pt-8 mx-12">
            <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Sort Catalog:</label>
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-zinc-900 border-2 border-white/10 text-white text-xs font-bold rounded-xl px-5 py-2.5 pr-10 appearance-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer outline-none"
              >
                <option value="default">Luxury Picks</option>
                <option value="price-low-high">Value: Low to High</option>
                <option value="price-high-low">Premium: High to Low</option>
                <option value="rating-high-low">Excellence: High to Low</option>
                <option value="alphabetical">Collections (A-Z)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
      <AIShopper context={products.map(p => p.name).join(', ')} />
    </div>
  );

  const renderDetails = () => selectedProduct && (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in">
      <nav aria-label="Breadcrumb" className="mb-8">
        <button onClick={() => setCurrentPage('home')} className="flex items-center text-amber-600 font-bold hover:text-amber-500 transition-colors uppercase tracking-widest text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Home / {selectedProduct.category}
        </button>
      </nav>
      
      <div className="lg:flex lg:gap-16">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <div className="sticky top-24">
            <div 
              ref={imageContainerRef}
              className="relative overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100 cursor-zoom-in aspect-square bg-white"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={(e) => {
                if (!imageContainerRef.current) return;
                const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
                setZoomPos({ x: ((e.pageX - left) / width) * 100, y: ((e.pageY - top) / height) * 100 });
              }}
            >
              <img src={activeImage} alt={selectedProduct.name} className={`w-full h-full object-cover transition-transform duration-300 ${isZooming ? 'scale-[2.5]' : 'scale-100'}`} style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}} />
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 py-4">
          <header className="mb-6">
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest px-4 py-2 bg-amber-50 rounded-full">{selectedProduct.category}</span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mt-6 leading-tight tracking-tight">{selectedProduct.name}</h1>
          </header>
          <div className="text-5xl font-black text-gray-900 tracking-tighter mb-10 gold-gradient inline-block">${selectedProduct.price.toFixed(2)}</div>
          <p className="text-xl text-gray-500 leading-relaxed font-medium mb-12 border-l-4 border-amber-500 pl-6">{selectedProduct.description}</p>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-white border-2 border-amber-500 text-amber-500 py-5 px-8 rounded-[2rem] font-black uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-95">Add to Boutique Bag</button>
              <button onClick={() => handleBuyNow(selectedProduct)} className="flex-1 gold-bg text-black py-5 px-8 rounded-[2rem] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-amber-100 active:scale-95">Instant Luxury Buy</button>
            </div>
            <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Luxury Inquiry: ${selectedProduct.name}`, '_blank')} className="w-full bg-emerald-600 text-white py-5 px-8 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center justify-center space-x-3 shadow-xl active:scale-95">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              <span>Consult via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
      <AIShopper context={`${selectedProduct.name} - ${selectedProduct.description}`} />
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-10">
          <h2 className="text-3xl font-black text-gray-900 mb-10 text-center uppercase tracking-widest">Order Verification</h2>
          
          {isCheckoutProcessing ? (
            <div className="py-20 text-center space-y-8 animate-pulse">
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-4 max-w-xs mx-auto">
                <div className={`flex items-center space-x-3 ${checkoutStep >= 1 ? 'text-amber-600' : 'text-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full ${checkoutStep >= 1 ? 'gold-bg text-black' : 'bg-gray-200 text-white'} flex items-center justify-center text-[10px] font-bold`}>1</div>
                  <span className="font-bold uppercase tracking-widest text-xs">Securing Boutique Payment</span>
                </div>
                <div className={`flex items-center space-x-3 ${checkoutStep >= 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full ${checkoutStep >= 2 ? 'gold-bg text-black' : 'bg-gray-200 text-white'} flex items-center justify-center text-[10px] font-bold`}>2</div>
                  <span className="font-bold uppercase tracking-widest text-xs">Allocating Warehouse Stock</span>
                </div>
                <div className={`flex items-center space-x-3 ${checkoutStep >= 3 ? 'text-amber-600' : 'text-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full ${checkoutStep >= 3 ? 'gold-bg text-black' : 'bg-gray-200 text-white'} flex items-center justify-center text-[10px] font-bold`}>3</div>
                  <span className="font-bold uppercase tracking-widest text-xs">Syncing with Logistic Partner</span>
                </div>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Premium Encryption Active.</p>
            </div>
          ) : (
            <form onSubmit={handleFinalCheckout} className="space-y-10">
              <div className="space-y-6">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm pb-2 border-b border-amber-500/20">1. Delivery Destination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} placeholder="Full Name" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-amber-500" />
                  <input required value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} placeholder="Phone Number" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-amber-500" />
                  <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} placeholder="Detailed Shipping Address" className="md:col-span-2 w-full bg-gray-50 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-amber-500"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDeliveryZone('inside')} className={`p-4 rounded-xl border-2 font-black transition-all ${deliveryZone === 'inside' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-50 bg-gray-50 text-gray-400'}`}>Inside Dhaka (80tk)</button>
                  <button type="button" onClick={() => setDeliveryZone('outside')} className={`p-4 rounded-xl border-2 font-black transition-all ${deliveryZone === 'outside' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-50 bg-gray-50 text-gray-400'}`}>Outside Dhaka (150tk)</button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm pb-2 border-b border-amber-500/20">2. Logistic Partner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {COURIER_SERVICES.map(c => (
                    <button 
                      key={c.id} 
                      type="button" 
                      onClick={() => setSelectedCourier(c.id)} 
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${selectedCourier === c.id ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                    >
                      <span className="text-3xl mb-2">{c.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm pb-2 border-b border-amber-500/20">3. Checkout Protocol</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(['stripe', 'bkash', 'sslcommerz', 'cod'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`p-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all ${paymentMethod === m ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-50 text-gray-400'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100">
                <div className="bg-zinc-900 rounded-[2rem] p-8 space-y-4 mb-10 text-white">
                  <div className="flex justify-between font-black uppercase tracking-widest text-[10px] opacity-60"><span>Items valuation</span><span>${cartSubtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between font-black uppercase tracking-widest text-[10px] opacity-60"><span>Logistics Charge</span><span>${deliveryCost.toFixed(2)}</span></div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-xl font-black uppercase">Net Amount</span><span className="text-4xl font-black gold-gradient">${finalTotal.toFixed(2)}</span></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button type="submit" className="py-5 rounded-[2rem] font-black uppercase tracking-widest bg-black text-white hover:brightness-110 transition-all shadow-2xl active:scale-95 border-2 border-amber-500/30">Confirm Boutique Order</button>
                  <button type="button" onClick={sendWhatsAppOrder} className="py-5 rounded-[2rem] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-2xl active:scale-95 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    <span>Concierge WhatsApp Support</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center animate-in">
      <div className="w-24 h-24 gold-bg rounded-full flex items-center justify-center mx-auto mb-10 text-black shadow-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h1 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-widest">Luxury Secured</h1>
      <p className="text-lg text-gray-500 mb-6 leading-relaxed">
        Exquisite choice. Your order has been successfully confirmed and synced with <strong>{COURIER_SERVICES.find(c => c.id === selectedCourier)?.name}</strong>.
      </p>
      <div className="inline-block bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 mb-12">
        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Boutique ID: {orders[0]?.id || 'DHARA-78923'}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => setCurrentPage('home')} className="px-10 py-4 gold-bg text-black rounded-[2rem] font-black uppercase tracking-widest transition-all hover:brightness-110 shadow-xl">Continue Collecting</button>
        <button onClick={() => setCurrentPage('orders')} className="px-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-[2rem] font-black uppercase tracking-widest transition-all hover:bg-gray-50">View Portfolio</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      <Navbar cartCount={cartCount} user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'details' && renderDetails()}
        {currentPage === 'cart' && <div className="max-w-4xl mx-auto px-4 py-12 animate-in"><h1 className="text-3xl font-black mb-10 text-gray-900 uppercase tracking-widest">Boutique Bag</h1><div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center"><p className="mb-10 text-gray-400 font-bold uppercase tracking-widest">{cart.length} Exclusive Item(s) Selection</p><button onClick={() => setCurrentPage('checkout')} className="w-full py-5 gold-bg text-black rounded-2xl font-black uppercase tracking-widest shadow-xl">Finalize Acquisition</button></div></div>}
        {currentPage === 'orders' && <OrderHistory orders={orders} onNavigate={setCurrentPage} />}
        {currentPage === 'checkout' && renderCheckout()}
        {currentPage === 'success' && renderSuccess()}
        {currentPage === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <h1 className="text-4xl font-black flex items-center text-gray-900 tracking-tight">
                <div className="w-12 h-12 gold-bg rounded-2xl flex items-center justify-center mr-5 text-black text-2xl font-black shadow-lg">FD</div>
                Boutique Management
              </h1>
              <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                <button onClick={() => setAdminTab('products')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'products' ? 'gold-bg text-black shadow-lg' : 'text-gray-400 hover:text-amber-600'}`}>Assets</button>
                <button onClick={() => setAdminTab('orders')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'orders' ? 'gold-bg text-black shadow-lg' : 'text-gray-400 hover:text-amber-600'}`}>Fulfillment</button>
              </div>
            </div>
            
            {adminTab === 'products' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-50">
                    <h2 className="text-2xl font-black mb-8 text-gray-900 uppercase tracking-widest">Catalog Entry</h2>
                    <form className="space-y-6" onSubmit={handleAddOrUpdateProduct}>
                      <input required name="name" type="text" defaultValue={editingProduct?.name || ''} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-amber-500" placeholder="Design Name" />
                      <select name="category" defaultValue={editingProduct?.category || 'Fashion'} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-amber-500">
                        <option>Fashion</option><option>Accessories</option><option>Premium Decor</option>
                      </select>
                      <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price || ''} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-amber-500" placeholder="Valuation ($)" />
                      <button type="submit" className="w-full py-5 gold-bg text-black rounded-2xl font-black uppercase tracking-widest shadow-xl hover:brightness-110 transition-all active:scale-95">Commit to Boutique</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-2">
                   <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr><th className="p-8 text-left">Asset Details</th><th className="p-8 text-right">Valuation</th><th className="p-8 text-center">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-amber-50/10 transition-colors">
                            <td className="p-8 flex items-center space-x-4"><img src={p.image} className="w-10 h-10 rounded-lg object-cover" /><div><p className="font-black text-gray-900">{p.name}</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">{p.category}</p></div></td>
                            <td className="p-8 text-right font-black text-gray-900 tracking-tighter">${p.price.toFixed(2)}</td>
                            <td className="p-8 text-center"><button onClick={() => setEditingProduct(p)} className="text-amber-600 font-black p-2 uppercase text-[10px] tracking-widest hover:underline">Revise</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <AdminOrders orders={orders} onUpdateStatus={updateOrderStatus} onSyncCourier={handleAdminSyncCourier} />
            )}
          </div>
        )}
        {currentPage === 'login' && <Auth onLogin={setUser} onNavigate={setCurrentPage} />}
      </main>
      <footer className="bg-black py-24 text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-4xl font-black text-white mb-6 tracking-tighter uppercase">FASHION <span className="gold-gradient">DHARA</span></p>
          <div className="flex justify-center flex-wrap gap-12 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-12">
            <button onClick={() => setCurrentPage('home')} className="hover:text-amber-500 transition-colors">Exhibitions</button>
            <button className="hover:text-amber-500 transition-colors">Boutique Story</button>
            <button className="hover:text-amber-500 transition-colors">Luxury Concierge</button>
            <button className="hover:text-amber-500 transition-colors">Privacy Charter</button>
          </div>
          <div className="flex justify-center items-center space-x-6 mb-12">
            <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center space-x-2 text-gray-500 hover:text-amber-500 transition-all border border-white/10 px-6 py-3 rounded-full">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Connect on Facebook</span>
            </a>
          </div>
          <p className="text-[10px] text-zinc-800 font-bold uppercase tracking-[0.4em]">&copy; 2024 FASHION DHARA LTD. ELEVATING LIFE BY DESIGN.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
