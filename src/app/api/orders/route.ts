
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import type { Order as OrderTypeDocument } from '@/lib/types'; // Use a different alias to avoid conflict with model name
import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/types';

const orderItemSchemaForPost = z.object({
  menuItemId: z.string().min(1, "MenuItem ID is required"),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  priceAtOrder: z.number().positive("Price at order must be positive"),
  customizations: z.string().optional(),
});

const postOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerContact: z.string().min(1, "Customer contact is required"),
  status: z.enum(ORDER_STATUSES).default('Placed'),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  items: z.array(orderItemSchemaForPost).min(1, "Order must have at least one item"),
  totalAmount: z.number().positive("Total amount must be positive"),
  customerId: z.string().optional(), // Optional customerId
  estimatedDeliveryTime: z.string().datetime({ offset: true }).optional().nullable(), // ISO String for date
});

export async function GET() {
  try {
    await dbConnect();
    // Fetch full Mongoose documents
    const orderDocs = await Order.find({}).sort({ createdAt: -1 });

    // Manually convert each document to a plain object using Mongoose's toObject transform
    // This ensures all schema transformations, including for subdocuments, are applied.
    const transformedOrders: OrderTypeDocument[] = orderDocs.map(doc => doc.toObject() as OrderTypeDocument);

    return NextResponse.json({ success: true, data: transformedOrders });
  } catch (error) {
    console.error('API Error fetching orders:', error);
    let errorMessage = 'Server error occurred while fetching orders.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validationResult = postOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid input data", issues: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { customerName, customerContact, status, notes, deliveryAddress, items, totalAmount, customerId, estimatedDeliveryTime } = validationResult.data;

    // Generate a simple order number
    const orderNumber = `EK${Date.now().toString().slice(-6)}`;

    const newOrderData: Partial<OrderTypeDocument> = {
      orderNumber,
      customerName,
      customerContact,
      status,
      items,
      totalAmount,
    };
    if (notes) newOrderData.notes = notes;
    if (deliveryAddress) newOrderData.deliveryAddress = deliveryAddress;
    if (customerId) newOrderData.customerId = customerId;
    if (estimatedDeliveryTime) newOrderData.estimatedDeliveryTime = estimatedDeliveryTime;


    const order = new Order(newOrderData);
    await order.save();

    const createdOrder = order.toObject() as OrderTypeDocument; // toObject includes the id mapping
    return NextResponse.json({ success: true, data: createdOrder }, { status: 201 });

  } catch (error) {
    console.error('API Error creating order:', error);
    let errorMessage = 'Server error occurred while creating order.';
    if (error instanceof Error) {
        if (error.name === 'ValidationError') {
             return NextResponse.json({ success: false, error: error.message, issues: (error as any).errors }, { status: 400 });
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
