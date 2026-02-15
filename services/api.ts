
import { Product, Order, User, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../constants';

// Simulated API Log for the Admin Dashboard
export interface ApiLog {
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  status: number;
  runtime: string;
  tech: 'Laravel' | 'Node.js';
}

class ApiService {
  private logs: ApiLog[] = [];
  private tech: 'Laravel' | 'Node.js' = 'Node.js';
  private delay = 800;

  // Fix: Changed from private to public to allow direct usage in App.tsx for specialized simulation logging
  public async simulate(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, status = 200) {
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const end = performance.now();
    
    const log: ApiLog = {
      timestamp: new Date().toISOString(),
      method,
      path,
      status,
      runtime: `${(end - start).toFixed(2)}ms`,
      tech: this.tech
    };
    
    this.logs = [log, ...this.logs].slice(0, 50);
    console.log(`[${this.tech}] ${method} ${path} - ${status}`);
    return log;
  }

  setTech(tech: 'Laravel' | 'Node.js') {
    this.tech = tech;
  }

  getLogs() {
    return this.logs;
  }

  // --- Products API ---
  async getProducts(): Promise<Product[]> {
    await this.simulate('GET', '/api/v1/products');
    const saved = localStorage.getItem('fd_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  }

  async updateProduct(product: Product): Promise<Product> {
    await this.simulate('PUT', `/api/v1/products/${product.id}`);
    const products = await this.getProducts();
    const updated = products.map(p => p.id === product.id ? product : p);
    localStorage.setItem('fd_products', JSON.stringify(updated));
    return product;
  }

  async createProduct(product: Product): Promise<Product> {
    await this.simulate('POST', '/api/v1/products');
    const products = await this.getProducts();
    const newList = [product, ...products];
    localStorage.setItem('fd_products', JSON.stringify(newList));
    return product;
  }

  // --- Orders API ---
  async getOrders(): Promise<Order[]> {
    await this.simulate('GET', '/api/v1/orders');
    const saved = localStorage.getItem('fd_orders');
    return saved ? JSON.parse(saved) : [];
  }

  async createOrder(order: Order): Promise<Order> {
    // Structure like a Laravel JSON resource
    await this.simulate('POST', '/api/v1/orders', 201);
    const orders = await this.getOrders();
    const newList = [order, ...orders];
    localStorage.setItem('fd_orders', JSON.stringify(newList));
    return order;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    await this.simulate('PUT', `/api/v1/orders/${id}/status`);
    const orders = await this.getOrders();
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem('fd_orders', JSON.stringify(updated));
  }

  // --- Auth API ---
  async login(email: string): Promise<User> {
    await this.simulate('POST', '/api/v1/auth/login');
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user'
    };
    localStorage.setItem('fd_user', JSON.stringify(user));
    return user;
  }
}

export const api = new ApiService();
