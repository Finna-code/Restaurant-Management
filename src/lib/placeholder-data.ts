import type {
  MenuItem,
  Order,
  AnalyticsData,
  DietaryTag,
  MenuCategory,
  OrderStatus,
  CustomerFeedback
} from './types';
import { faker } from '@faker-js/faker';
import { MENU_CATEGORIES, ORDER_STATUSES, DIETARY_TAGS } from './types';

const generateFeedback = (count: number): CustomerFeedback[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    userName: faker.person.firstName(),
    rating: faker.number.int({ min: 3, max: 5 }),
    comment: faker.lorem.sentence({ min: 5, max: 15 }),
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
  }));
};

const baseMenuItems: Omit<MenuItem, 'id' | 'feedbacks' | 'averageRating' | 'category'> & { category: MenuCategory, name: string }[] = [
  {
    name: 'Classic Margherita Pizza',
    category: 'Main Courses',
    price: faker.number.float({ min: 350, max: 600, multipleOf: 10 }),
    description: 'Fresh mozzarella, basil, and tomato sauce on a thin crust. A timeless classic.',
    ingredients: ['Dough', 'Tomato Sauce', 'Fresh Mozzarella', 'Basil', 'Olive Oil', 'Oregano'],
    tags: ['vegetarian'] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1689458322624-93d7fa98bb8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxQaXp6YSUyMGZvb2R8ZW58MHx8fHwxNzQ5MTc0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 15, max: 25 }),
  },
  {
    name: 'Spicy Sriracha Burger',
    category: 'Main Courses',
    price: faker.number.float({ min: 400, max: 750, multipleOf: 10 }),
    description: 'Juicy beef patty with house-made sriracha mayo, crisp jalapenos, and pepper jack cheese on a toasted brioche bun.',
    ingredients: ['Beef Patty', 'Brioche Bun', 'Sriracha Mayo', 'Jalapenos', 'Pepper Jack Cheese', 'Lettuce', 'Tomato', 'Red Onion'],
    tags: ['spicy'] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1559847844-d9d2bc807d82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxNYWluJTIwQ291cnNlcyUyMGZvb2R8ZW58MHx8fHwxNzQ5MTc0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 20, max: 30 }),
  },
  {
    name: 'Vegan Buddha Bowl',
    category: 'Salads',
    price: faker.number.float({ min: 300, max: 550, multipleOf: 10 }),
    description: 'A vibrant bowl of quinoa, roasted sweet potatoes, seasoned chickpeas, fresh avocado, and a creamy tahini dressing.',
    ingredients: ['Quinoa', 'Sweet Potatoes', 'Chickpeas', 'Avocado', 'Spinach', 'Cucumber', 'Carrots', 'Tahini Dressing'],
    tags: ['vegan', 'gluten-free'] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxTYWxhZHMlMjBmb29kfGVufDB8fHx8MTc0OTE3NDYwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 15, max: 20 }),
  },
  {
    name: 'Decadent Chocolate Lava Cake',
    category: 'Desserts',
    price: faker.number.float({ min: 250, max: 450, multipleOf: 10 }),
    description: 'Warm, rich chocolate cake with a gooey molten center, served with a scoop of premium vanilla bean ice cream and a raspberry coulis.',
    ingredients: ['Dark Chocolate', 'Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla Ice Cream', 'Raspberries'],
    tags: ['vegetarian'] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8RGVzc2VydHMlMjBmb29kfGVufDB8fHx8MTc0OTE3NDYwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 18, max: 25 }),
  },
  {
    name: 'Grilled Chicken Caesar Salad',
    category: 'Salads',
    price: faker.number.float({ min: 320, max: 580, multipleOf: 10 }),
    description: 'Crisp romaine lettuce, tender grilled chicken breast, house-made croutons, shaved Parmesan, and a classic Caesar dressing.',
    ingredients: ['Romaine Lettuce', 'Grilled Chicken Breast', 'Croutons', 'Parmesan Cheese', 'Caesar Dressing', 'Black Pepper'],
    tags: [] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1550304934-29c9ba233800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxDaGlja2VuJTIwQ2Flc2FyJTIwU2FsYWR8ZW58MHx8fHwxNzQ5Mzc0NzYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 12, max: 18 }),
  },
  {
    name: 'Creamy Tomato Pasta',
    category: 'Main Courses',
    price: faker.number.float({ min: 380, max: 650, multipleOf: 10 }),
    description: 'Penne pasta tossed in a rich and creamy tomato sauce with a hint of garlic and basil, topped with Parmesan.',
    ingredients: ['Penne Pasta', 'Tomato Sauce', 'Heavy Cream', 'Garlic', 'Basil', 'Parmesan Cheese', 'Olive Oil'],
    tags: ['vegetarian'] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1703258581842-31608ecd6528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxQYXN0YSUyMGZvb2R8ZW58MHx8fHwxNzQ5MTc0NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 18, max: 28 }),
  },
  {
    name: 'Sparkling Berry Lemonade',
    category: 'Beverages',
    price: faker.number.float({ min: 150, max: 300, multipleOf: 10 }),
    description: 'Homemade lemonade infused with mixed berries and a splash of soda water for a refreshing fizz.',
    ingredients: ['Lemons', 'Mixed Berries (Strawberries, Blueberries, Raspberries)', 'Water', 'Sugar', 'Soda Water', 'Mint'],
    tags: ['vegan', 'gluten-free'] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxCZXZlcmFnZXMlMjBmb29kfGVufDB8fHx8MTc0OTE3NDYwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 5, max: 10 }),
  },
   {
    name: 'Crispy Calamari Rings',
    category: 'Appetizers',
    price: faker.number.float({ min: 280, max: 480, multipleOf: 10 }),
    description: 'Tender calamari rings, lightly battered and fried to golden perfection. Served with a zesty marinara sauce.',
    ingredients: ['Calamari', 'Flour', 'Cornstarch', 'Egg', 'Breadcrumbs', 'Marinara Sauce', 'Lemon Wedges'],
    tags: [] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1600956954861-9882f7957053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYWxhbWFyaXxlbnwwfHx8fDE3NDkzNzU0OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 12, max: 18 }),
  },
  {
    name: 'Hearty Minestrone Soup',
    category: 'Soups',
    price: faker.number.float({ min: 220, max: 380, multipleOf: 10 }),
    description: 'A classic Italian vegetable soup made with a rich tomato broth, beans, pasta, and seasonal vegetables.',
    ingredients: ['Carrots', 'Celery', 'Onions', 'Zucchini', 'Kidney Beans', 'Cannellini Beans', 'Ditalini Pasta', 'Tomato Broth', 'Herbs'],
    tags: ['vegan', 'vegetarian'] as DietaryTag[],
    availability: false, // Intentionally unavailable
    imageUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb3VwfGVufDB8fHx8MTc0OTM3NTU2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 25, max: 40 }),
  },
  {
    name: 'Club Sandwich Deluxe',
    category: 'Sandwiches',
    price: faker.number.float({ min: 350, max: 550, multipleOf: 10 }),
    description: 'Triple-decker sandwich with roasted turkey, crispy bacon, lettuce, tomato, and mayonnaise on toasted white bread. Served with fries.',
    ingredients: ['White Bread', 'Turkey Breast', 'Bacon', 'Lettuce', 'Tomato', 'Mayonnaise', 'Fries'],
    tags: [] as DietaryTag[],
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1592415486658-c454096f392b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjbHViJTIwc2FuZHdpY2h8ZW58MHx8fHwxNzQ5Mzc1NjIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: faker.number.int({ min: 15, max: 20 }),
  },
];

export const PLACEHOLDER_MENU_ITEMS: MenuItem[] = baseMenuItems.map((item, index) => ({
  ...item,
  id: `placeholder-item-${index + 1}`,
  feedbacks: generateFeedback(faker.number.int({ min: 0, max: 10 })),
  // averageRating is calculated on frontend
}));

// Make one more random item unavailable if possible, different from Minestrone
if (PLACEHOLDER_MENU_ITEMS.length > 1) {
  let randomIndexToMakeUnavailable = faker.number.int({ min: 0, max: PLACEHOLDER_MENU_ITEMS.length - 1 });
  while (PLACEHOLDER_MENU_ITEMS[randomIndexToMakeUnavailable].name === 'Hearty Minestrone Soup' && PLACEHOLDER_MENU_ITEMS.length > 1) {
    randomIndexToMakeUnavailable = faker.number.int({ min: 0, max: PLACEHOLDER_MENU_ITEMS.length - 1 });
  }
  PLACEHOLDER_MENU_ITEMS[randomIndexToMakeUnavailable].availability = false;
}


const getRandomOrderItems = (menuItems: MenuItem[], count: number): Order['items'] => {
  const availableItems = menuItems.filter(item => item.availability);
  if (availableItems.length === 0) return [];

  const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
  const numItemsToSelect = Math.min(count, availableItems.length);

  return shuffled.slice(0, numItemsToSelect).map(item => ({
    menuItemId: item.id,
    name: item.name,
    priceAtOrder: item.price,
    quantity: faker.number.int({ min: 1, max: 3 }), // Increased max quantity
    customizations: faker.datatype.boolean(0.2) ? faker.lorem.words({min:2, max:4}) : undefined,
  }));
};

export function generatePlaceholderOrders(menuItems: MenuItem[]): Order[] {
  return Array.from({ length: faker.number.int({min: 40, max: 70}) }, (_, i) => { // Increased order count
    const items = getRandomOrderItems(menuItems, faker.number.int({ min: 1, max: 3 }));
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
    const orderStatus = faker.helpers.arrayElement(ORDER_STATUSES);
    const isDelivery = orderStatus !== 'Ready for Pickup' && faker.datatype.boolean(0.6);

    let estimatedDeliveryTime: string | undefined = undefined;
    const createdAtDate = faker.date.recent({ days: 7 });
    if ((orderStatus === 'Out for Delivery' || orderStatus === 'In Preparation' || orderStatus === 'Placed') && isDelivery) {
      estimatedDeliveryTime = faker.date.soon({ days: 1, refDate: createdAtDate }).toISOString();
    }

    return {
      id: faker.string.uuid(),
      orderNumber: `EK${faker.string.numeric(5)}`,
      items,
      customerName: faker.person.fullName(),
      customerContact: faker.helpers.arrayElement([faker.phone.number('9#########'), faker.internet.email()]),
      status: orderStatus,
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence({min:3, max:8}) : undefined,
      totalAmount,
      createdAt: createdAtDate.toISOString(),
      updatedAt: faker.date.between({from: createdAtDate, to: new Date()}).toISOString(),
      deliveryAddress: isDelivery ? `${faker.location.streetAddress()}, ${faker.location.city()}` : undefined,
      estimatedDeliveryTime,
    };
  });
}


const getWeekNumber = (d: Date): number => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

const generatePeakHours = (): AnalyticsData['peakOrderingHours'] => {
  const hoursData: AnalyticsData['peakOrderingHours'] = [];
  for (let hour = 0; hour < 24; hour++) {
    let orderCount;
    if (hour >= 12 && hour <= 14) { 
      orderCount = faker.number.int({ min: 20, max: 50 });
    } else if (hour >= 19 && hour <= 21) { 
      orderCount = faker.number.int({ min: 25, max: 60 });
    } else if (hour >= 7 && hour <= 9) { 
      orderCount = faker.number.int({ min: 5, max: 20 });
    } else if (hour >=16 && hour <= 18){ 
      orderCount = faker.number.int({min:15, max:35});
    }
    else { 
      orderCount = faker.number.int({ min: 1, max: 15 });
    }
    hoursData.push({ hour, orderCount });
  }
  return hoursData.sort((a, b) => a.hour - b.hour);
};

const dynamicMostOrderedDishes = (orders: Order[]): AnalyticsData['mostOrderedDishes'] => {
  const itemSalesMap = new Map<string, { itemName: string; quantitySold: number; totalRevenue: number }>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const existingEntry = itemSalesMap.get(item.menuItemId);
      if (existingEntry) {
        existingEntry.quantitySold += item.quantity;
        existingEntry.totalRevenue += item.quantity * item.priceAtOrder;
      } else {
        itemSalesMap.set(item.menuItemId, {
          itemName: item.name,
          quantitySold: item.quantity,
          totalRevenue: item.quantity * item.priceAtOrder,
        });
      }
    });
  });

  const aggregatedItems = Array.from(itemSalesMap.values());
  return aggregatedItems
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);
};

const dynamicCategoryRevenue = (menuItems: MenuItem[]): AnalyticsData['categoryRevenue'] => {
  const categories = [...new Set(menuItems.map(item => item.category as string))];
  return categories.map(categoryName => ({
    categoryName,
    totalRevenue: faker.number.float({ min: 20000, max: 100000, multipleOf: 100 }),
  }));
};

export function generatePlaceholderAnalyticsData(
  menuItems: MenuItem[],
  orders: Order[]
): AnalyticsData {
  return {
    dailySales: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
          date: date.toLocaleDateString('en-CA'), 
          totalSales: faker.number.float({ min: 15000, max: 60000, multipleOf: 100 }),
          orderCount: faker.number.int({ min: 20, max: 80 }),
      };
    }),
    weeklySales: Array.from({ length: 4 }, (_, i) => {
      const weekEndDate = new Date();
      weekEndDate.setDate(weekEndDate.getDate() - (i * 7));
      const weekNumber = getWeekNumber(weekEndDate);
      const year = weekEndDate.getFullYear();
      return {
          date: `Week ${weekNumber}, ${year}`,
          totalSales: faker.number.float({ min: 100000, max: 400000, multipleOf: 1000 }),
          orderCount: faker.number.int({ min: 150, max: 500 }),
      };
    }).reverse(),
    mostOrderedDishes: dynamicMostOrderedDishes(orders),
    categoryRevenue: dynamicCategoryRevenue(menuItems),
    peakOrderingHours: generatePeakHours(),
    totalOrdersCount: orders.length,
  };
}

export const PLACEHOLDER_ORDERS = generatePlaceholderOrders(
  PLACEHOLDER_MENU_ITEMS
);