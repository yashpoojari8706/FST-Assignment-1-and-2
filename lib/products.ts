export interface Product {
  id: string;
  name: string;
  description: string;
  category: "Audio" | "Wearables" | "Accessories" | "Workstation";
  price: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aura Pro Wireless Headphones",
    description: "Active noise cancellation with 40mm custom drivers and 38-hour battery longevity.",
    category: "Audio",
    price: 249.99,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 142,
    inStock: true,
    image: "/products/headphones.svg",
  },
  {
    id: "prod-2",
    name: "Chronos Smartwatch Ultra",
    description: "Titanium casing with dual-frequency GPS, biometric sensors, and sapphire glass display.",
    category: "Wearables",
    price: 399.0,
    badge: "Popular",
    rating: 4.8,
    reviewCount: 98,
    inStock: true,
    image: "/products/smartwatch.svg",
  },
  {
    id: "prod-3",
    name: "Nova Mechanical Studio Keyboard",
    description: "Hot-swappable tactile switches, gasket-mounted aluminum frame, and sound-dampening foam.",
    category: "Workstation",
    price: 159.5,
    rating: 4.7,
    reviewCount: 64,
    inStock: true,
    image: "/products/keyboard.svg",
  },
  {
    id: "prod-4",
    name: "Precision Ergonomic Mouse",
    description: "PixArt optical sensor, hyper-fast scroll wheel, and ergonomic thumb rest for 12h comfort.",
    category: "Accessories",
    price: 89.99,
    badge: "Staff Pick",
    rating: 4.9,
    reviewCount: 210,
    inStock: true,
    image: "/products/mouse.svg",
  },
  {
    id: "prod-5",
    name: "Lumina 4K HDR Monitor Light Bar",
    description: "Asymmetric optical design preventing screen glare, auto-dimming touch sensor, and CRI > 95.",
    category: "Workstation",
    price: 79.0,
    rating: 4.6,
    reviewCount: 53,
    inStock: true,
    image: "/products/lightbar.svg",
  },
  {
    id: "prod-6",
    name: "Aero MagSafe 3-in-1 Charging Stand",
    description: "Fast 15W wireless charging pad for phone, watch, and earbuds with weighted zinc alloy base.",
    category: "Accessories",
    price: 69.99,
    rating: 4.8,
    reviewCount: 88,
    inStock: true,
    image: "/products/charger.svg",
  },
  {
    id: "prod-7",
    name: "StudioDesk Desk Pad (Wool Felt)",
    description: "Water-resistant recycled wool felt desk mat with anti-slip natural rubber base.",
    category: "Accessories",
    price: 45.0,
    rating: 4.7,
    reviewCount: 119,
    inStock: true,
    image: "/products/deskpad.svg",
  },
  {
    id: "prod-8",
    name: "Aura Pods Studio Active Earbuds",
    description: "Adaptive transparency, spatial audio tracking, and IPX7 sweat & rain resistance.",
    category: "Audio",
    price: 179.0,
    badge: "New",
    rating: 4.9,
    reviewCount: 76,
    inStock: true,
    image: "/products/earbuds.svg",
  },
];

export async function getProducts(): Promise<Product[]> {
  // Simulate slight network delay for Suspense demonstration
  await new Promise((resolve) => setTimeout(resolve, 80));
  return PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return PRODUCTS.find((p) => p.id === id);
}
