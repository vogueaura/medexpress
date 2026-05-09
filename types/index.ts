export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  dosage: string;
  manufacturer: string;
  description: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  prescriptionRequired: boolean;
  uses?: string;
  warning?: string;
  rating: number;
  reviewCount: number;
  sideEffects?: string[];
  dosageInstructions?: string;
  activeIngredients?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  description: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: CartItem[];
  total: number;
  deliveryAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Prescription {
  id: string;
  image: string;
  notes: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  date: string;
  medicines?: Medicine[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  validUntil: string;
  image: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "pharmacist";
  message: string;
  timestamp: string;
  attachment?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "offer" | "system" | "prescription";
  read: boolean;
  date: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  totalMedicines: number;
  ordersChange: number;
  revenueChange: number;
  usersChange: number;
  medicinesChange: number;
}
