
import { Product, CourierService } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Royal Muslin Dhakai',
    description: 'Authentic hand-woven Jamdani muslin with 300 thread count. A masterpiece of traditional craftsmanship.',
    price: 450.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1583391262775-946654fe7247?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733990-234b6e5f3199?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 5.0,
    stock: 5
  },
  {
    id: '2',
    name: 'Gilded Banarasi Silk',
    description: 'Pure Katan silk with intricate Zari work. Designed for the most prestigious evening events.',
    price: 320.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1595967783875-c371f35d8049?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469668-93510ef2d323?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    stock: 8
  },
  {
    id: '3',
    name: 'Artisanal Gold Jhumka',
    description: '22K gold-plated handcrafted earrings inspired by traditional royal aesthetics.',
    price: 185.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1630019017590-337626998592?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    stock: 12
  },
  {
    id: '4',
    name: 'Midnight Velvet Sherwani',
    description: 'Premium Italian velvet tailored to perfection. Featuring hand-embroidered lapels.',
    price: 550.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617137968427-83c33c2f096b?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    stock: 3
  },
  {
    id: '5',
    name: 'Royal Heritage Pashmina',
    description: 'Ethically sourced pure wool from the high altitudes, hand-dyed in natural indigo.',
    price: 125.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.7,
    stock: 20
  },
  {
    id: '6',
    name: 'Celestial Silk Potli',
    description: 'A delicate silk drawstring bag adorned with pearls and semi-precious stones.',
    price: 75.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fd113961?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544816153-12ad5d714304?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.6,
    stock: 15
  }
];

export const COURIER_SERVICES: { id: CourierService; name: string; icon: string; apiSupported: boolean }[] = [
  { id: 'pathao', name: 'Pathao Luxury', icon: '🛵', apiSupported: true },
  { id: 'steadfast', name: 'Steadfast Elite', icon: '⚡', apiSupported: true },
  { id: 'sundarban', name: 'Sundarban Prime', icon: '📦', apiSupported: false }
];
