
import { Product, CourierService } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Aether Pods Pro',
    description: 'Next-generation wireless earbuds with active noise cancellation and spatial audio.',
    price: 249.99,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/pods1/600/600',
    gallery: [
      'https://picsum.photos/seed/pods1/600/600',
      'https://picsum.photos/seed/pods2/600/600'
    ],
    rating: 4.8,
    stock: 15
  },
  {
    id: '2',
    name: 'Lumina Smart Watch',
    description: 'Track your health, receive notifications, and look stylish with this OLED smart watch.',
    price: 199.50,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/watch1/600/600',
    gallery: [
      'https://picsum.photos/seed/watch1/600/600'
    ],
    rating: 4.5,
    stock: 22
  },
  {
    id: '3',
    name: 'Vanguard Backpack',
    description: 'Durable, waterproof, and spacious backpack for the modern urban explorer.',
    price: 89.00,
    category: 'Fashion',
    image: 'https://picsum.photos/seed/backpack1/600/600',
    gallery: [
      'https://picsum.photos/seed/backpack1/600/600'
    ],
    rating: 4.7,
    stock: 45
  },
  {
    id: '4',
    name: 'Terra Leather Wallet',
    description: 'Handcrafted genuine leather wallet with RFID protection.',
    price: 45.00,
    category: 'Fashion',
    image: 'https://picsum.photos/seed/wallet1/600/600',
    gallery: [
      'https://picsum.photos/seed/wallet1/600/600'
    ],
    rating: 4.9,
    stock: 10
  },
  {
    id: '5',
    name: 'Zenith Coffee Press',
    description: 'Brew the perfect cup of coffee with this double-walled stainless steel press.',
    price: 34.99,
    category: 'Home',
    image: 'https://picsum.photos/seed/coffee1/600/600',
    gallery: [
      'https://picsum.photos/seed/coffee1/600/600'
    ],
    rating: 4.6,
    stock: 30
  },
  {
    id: '6',
    name: 'Orbital Desk Lamp',
    description: 'Adjustable LED desk lamp with wireless charging base and touch controls.',
    price: 59.99,
    category: 'Home',
    image: 'https://picsum.photos/seed/lamp1/600/600',
    gallery: [
      'https://picsum.photos/seed/lamp1/600/600'
    ],
    rating: 4.4,
    stock: 12
  },
  {
    id: '7',
    name: 'Horizon Ultra Tablet',
    description: 'Experience stunning visuals on a 120Hz liquid retina display with ultra-fast processing.',
    price: 799.00,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/tablet1/600/600',
    rating: 4.9,
    stock: 8
  },
  {
    id: '8',
    name: 'Apex Gaming Mouse',
    description: 'Ultra-lightweight gaming mouse with precision sensors and customizable RGB lighting.',
    price: 69.50,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/mouse1/600/600',
    rating: 4.7,
    stock: 50
  },
  {
    id: '9',
    name: 'Urban Denim Jacket',
    description: 'Classic fit denim jacket with premium wash and modern styling details.',
    price: 120.00,
    category: 'Fashion',
    image: 'https://picsum.photos/seed/jacket1/600/600',
    rating: 4.6,
    stock: 25
  },
  {
    id: '10',
    name: 'Silk Comfort Scarf',
    description: '100% pure silk scarf with hand-painted patterns for effortless elegance.',
    price: 55.00,
    category: 'Fashion',
    image: 'https://picsum.photos/seed/scarf1/600/600',
    rating: 4.8,
    stock: 15
  },
  {
    id: '11',
    name: 'Minimalist Wall Clock',
    description: 'Sleek, silent-sweep quartz wall clock for a modern office or living room.',
    price: 42.00,
    category: 'Home',
    image: 'https://picsum.photos/seed/clock1/600/600',
    rating: 4.5,
    stock: 20
  },
  {
    id: '12',
    name: 'Velvet Plush Cushion',
    description: 'Luxuriously soft velvet cushion with premium filling for ultimate comfort.',
    price: 28.00,
    category: 'Home',
    image: 'https://picsum.photos/seed/cushion1/600/600',
    rating: 4.7,
    stock: 60
  }
];

export const COURIER_SERVICES: { id: CourierService; name: string; icon: string; apiSupported: boolean }[] = [
  { id: 'pathao', name: 'Pathao Courier', icon: '🛵', apiSupported: true },
  { id: 'steadfast', name: 'Steadfast Courier', icon: '⚡', apiSupported: true },
  { id: 'sundarban', name: 'Sundarban Service', icon: '📦', apiSupported: false }
];
