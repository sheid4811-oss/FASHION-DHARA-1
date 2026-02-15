
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  gallery?: string[];
  rating: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export type PaymentMethod = 'stripe' | 'bkash' | 'sslcommerz' | 'cod';
export type DeliveryZone = 'inside' | 'outside';
export type CourierService = 'pathao' | 'sundarban' | 'steadfast';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  phoneNumber: string;
  shippingAddress: string;
  deliveryZone: DeliveryZone;
  deliveryCost: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'shipped';
  paymentMethod?: PaymentMethod;
  courier?: CourierService;
  courierTrackingId?: string;
  createdAt: string;
}
