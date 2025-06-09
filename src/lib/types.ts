
export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface CustomerFeedback {
  id: string;
  userId: string; // or customer name if not logged in
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO date string
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  ingredients: string[];
  tags: string[]; // e.g., "vegan", "spicy", "gluten-free"
  availability: boolean;
  imageUrl: string;
  feedbacks: CustomerFeedback[];
  averageRating?: number;
  prepTime?: number; // in minutes
}

export interface OrderItem {
  menuItemId: string;
  name: string; // Denormalized for easier display
  quantity: number;
  priceAtOrder: number; // Price at the time of order
  customizations?: string; // e.g., "extra cheese, no onions"
}

export type OrderStatus =
  | 'Placed'
  | 'In Preparation'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string; // User-friendly order number
  items: OrderItem[];
  customerId?: string; // Optional: if placed by a logged-in customer
  customerName: string;
  customerContact: string; // Phone or email
  status: OrderStatus;
  notes?: string; // Special instructions from customer
  totalAmount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deliveryAddress?: string; // Optional for delivery orders
  estimatedDeliveryTime?: string; // ISO date string
}

export interface SalesDataPoint {
  date: string; // e.g., "YYYY-MM-DD" or "YYYY-WW"
  totalSales: number;
  orderCount: number;
}

export interface ItemSalesDataPoint {
  itemName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface CategorySalesDataPoint {
  categoryName: string;
  totalRevenue: number;
}

export interface PeakHourDataPoint {
  hour: number; // 0-23
  orderCount: number;
}

export interface AnalyticsData {
  dailySales: SalesDataPoint[];
  weeklySales: SalesDataPoint[];
  mostOrderedDishes: ItemSalesDataPoint[];
  categoryRevenue: CategorySalesDataPoint[];
  peakOrderingHours: PeakHourDataPoint[];
  totalOrdersCount?: number; // Added for absolute total orders
}

export const DIETARY_TAGS = ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "spicy", "low-carb", "halal", "kosher"] as const;
export type DietaryTag = typeof DIETARY_TAGS[number];

export const MENU_CATEGORIES = ["Appetizers", "Main Courses", "Desserts", "Beverages", "Sides", "Salads", "Soups", "Sandwiches"] as const;
export type MenuCategory = typeof MENU_CATEGORIES[number];

export const ORDER_STATUSES: OrderStatus[] = [
  'Placed',
  'In Preparation',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

