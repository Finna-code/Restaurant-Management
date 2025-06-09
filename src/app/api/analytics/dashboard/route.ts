
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import type { AnalyticsData, SalesDataPoint, PeakHourDataPoint, ItemSalesDataPoint } from '@/lib/types';

export async function GET() {
  try {
    await dbConnect();

    // 1. Daily Sales for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailySalesRaw: Array<{ _id: string; totalSales: number; orderCount: number }> = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
    ]);
    
    const dailySalesMap = new Map(dailySalesRaw.map(item => [item._id, item]));
    const dailySales: SalesDataPoint[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (dailySalesMap.has(dateStr)) {
            const data = dailySalesMap.get(dateStr)!;
            dailySales.push({ date: dateStr, totalSales: data.totalSales, orderCount: data.orderCount });
        } else {
            dailySales.push({ date: dateStr, totalSales: 0, orderCount: 0 });
        }
    }


    // 2. Peak Ordering Hours
    const peakOrderingHours: PeakHourDataPoint[] = await Order.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" }, 
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          hour: "$_id",
          orderCount: 1
        }
      }
    ]);

    // 3. Total Orders Count
    const totalOrdersCount = await Order.countDocuments();

    // 4. Most Ordered Dishes
    const mostOrderedDishes: ItemSalesDataPoint[] = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { menuItemId: "$items.menuItemId", itemName: "$items.name" }, // Group by ID and name
          quantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtOrder"] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          itemName: "$_id.itemName",
          quantitySold: 1,
          totalRevenue: 1
        }
      }
    ]);

    const analyticsData: Partial<AnalyticsData> = { // Use Partial as some fields might still be placeholders
      dailySales,
      peakOrderingHours,
      totalOrdersCount,
      mostOrderedDishes,
      // categoryRevenue and weeklySales will use placeholders if not fetched here
    };

    return NextResponse.json({ success: true, data: analyticsData });

  } catch (error) {
    console.error('API Error fetching live analytics data:', error);
    let errorMessage = 'Server error occurred while fetching live analytics data.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
