import { Offer } from "@/types";

export const offers: Offer[] = [
  {
    id: "offer-1",
    title: "25% Off Vitamins",
    description: "Get 25% off on all vitamins and supplements this month!",
    discount: 25,
    code: "VITA25",
    validUntil: "2025-01-31",
    image: "/offers/vitamins-offer.jpg",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "offer-2",
    title: "Free Delivery",
    description: "Free delivery on orders above $30. No code needed!",
    discount: 0,
    code: "FREEDEL",
    validUntil: "2025-02-28",
    image: "/offers/delivery-offer.jpg",
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "offer-3",
    title: "Buy 2 Get 1 Free",
    description: "Buy any 2 skincare products and get 1 free!",
    discount: 33,
    code: "SKIN3",
    validUntil: "2025-01-15",
    image: "/offers/skincare-offer.jpg",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "offer-4",
    title: "New User 15% Off",
    description: "First-time users get 15% off their first order!",
    discount: 15,
    code: "NEW15",
    validUntil: "2025-12-31",
    image: "/offers/new-user-offer.jpg",
    color: "from-blue-500 to-indigo-600",
  },
];

export const notifications = [
  {
    id: "notif-1",
    title: "Order Delivered",
    message: "Your order ORD-2024-001 has been delivered successfully.",
    type: "order" as const,
    read: true,
    date: "2024-12-16T14:30:00Z",
  },
  {
    id: "notif-2",
    title: "Flash Sale!",
    message: "50% off on all cold & flu medicines. Today only!",
    type: "offer" as const,
    read: false,
    date: "2024-12-25T09:00:00Z",
  },
  {
    id: "notif-3",
    title: "Prescription Approved",
    message: "Your prescription has been reviewed and approved by our pharmacist.",
    type: "prescription" as const,
    read: false,
    date: "2024-12-24T11:15:00Z",
  },
  {
    id: "notif-4",
    title: "Order Shipped",
    message: "Your order ORD-2024-003 is on its way! Track it now.",
    type: "order" as const,
    read: false,
    date: "2024-12-23T10:00:00Z",
  },
  {
    id: "notif-5",
    title: "Account Security",
    message: "A new device was used to log into your account.",
    type: "system" as const,
    read: true,
    date: "2024-12-20T08:45:00Z",
  },
];

export const chatMessages = [
  {
    id: "msg-1",
    sender: "user" as const,
    message: "Hi, I need advice about taking Paracetamol with Ibuprofen together.",
    timestamp: "2024-12-25T10:00:00Z",
  },
  {
    id: "msg-2",
    sender: "pharmacist" as const,
    message: "Hello! Yes, it's generally safe to take Paracetamol and Ibuprofen together as they work differently. However, make sure to follow the recommended dosages for each and don't exceed the daily limits.",
    timestamp: "2024-12-25T10:02:00Z",
  },
  {
    id: "msg-3",
    sender: "user" as const,
    message: "What about taking them with food?",
    timestamp: "2024-12-25T10:03:00Z",
  },
  {
    id: "msg-4",
    sender: "pharmacist" as const,
    message: "Great question! Ibuprofen should ideally be taken with food or after eating to reduce the risk of stomach irritation. Paracetamol can be taken with or without food. Always drink plenty of water with both medications.",
    timestamp: "2024-12-25T10:05:00Z",
  },
  {
    id: "msg-5",
    sender: "user" as const,
    message: "Thank you! Can I also take Cetirizine for my allergies at the same time?",
    timestamp: "2024-12-25T10:06:00Z",
  },
  {
    id: "msg-6",
    sender: "pharmacist" as const,
    message: "Yes, Cetirizine can be taken alongside Paracetamol and Ibuprofen. Just be aware that Cetirizine may cause drowsiness, so avoid driving or operating machinery if affected. If you have any chronic conditions, it's best to consult your doctor first.",
    timestamp: "2024-12-25T10:08:00Z",
  },
];

export const adminRevenueData = [
  { month: "Jan", revenue: 12400, orders: 340 },
  { month: "Feb", revenue: 15200, orders: 420 },
  { month: "Mar", revenue: 18900, orders: 510 },
  { month: "Apr", revenue: 16700, orders: 460 },
  { month: "May", revenue: 21300, orders: 580 },
  { month: "Jun", revenue: 19800, orders: 540 },
  { month: "Jul", revenue: 23100, orders: 630 },
  { month: "Aug", revenue: 22400, orders: 610 },
  { month: "Sep", revenue: 25600, orders: 700 },
  { month: "Oct", revenue: 24100, orders: 660 },
  { month: "Nov", revenue: 28900, orders: 790 },
  { month: "Dec", revenue: 31200, orders: 850 },
];

export const adminStats = {
  totalOrders: 7090,
  totalRevenue: 259600,
  activeUsers: 4250,
  totalMedicines: 380,
  ordersChange: 12.5,
  revenueChange: 8.3,
  usersChange: 15.2,
  medicinesChange: 3.1,
};
