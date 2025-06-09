import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import type { Order as OrderType } from '@/lib/types';
import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/types';
import mongoose from 'mongoose';

const orderItemSchemaForPut = z.object({
  menuItemId: z.string().min(1),
  name: z.string(),
  quantity: z.number().int().min(1),
  priceAtOrder: z.number().positive(),
  customizations: z.string().optional(),
});

const putOrderSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerContact: z.string().min(1).optional(),
status: z
  .enum([...ORDER_STATUSES] as [OrderStatus, ...OrderStatus[]])
  .optional(),
  notes: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  items: z
    .array(orderItemSchemaForPut)
    .min(1, 'Order must have at least one item')
    .optional(),
  totalAmount: z.number().positive().optional(),
  estimatedDeliveryTime: z.string().datetime({ offset: true }).optional().nullable(),
});

// ----- GET handler -----
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await dbConnect();
    let orderDoc: any = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      orderDoc = await Order.findById(id);
    }
    if (!orderDoc) {
      orderDoc = await Order.findOne({ orderNumber: id });
    }
    if (!orderDoc) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const order: OrderType = orderDoc.toObject();
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error(`API Error fetching order ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// ----- PUT handler -----
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Order ID format' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const body = await request.json();

    const validationResult = putOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          issues: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData: Partial<OrderType> = {};
    for (const key in validationResult.data) {
      const value = (validationResult.data as any)[key];
      if (value !== undefined) updateData[key as keyof OrderType] = value;
    }

    const updatedOrderDoc = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedOrderDoc) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const updatedOrder: OrderType = updatedOrderDoc.toObject();
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error(`API Error updating order ${id}:`, error);
    let msg = 'Server error occurred while updating order.';
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message, issues: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ----- DELETE handler -----
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Order ID format' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const deletedOrderDoc = await Order.findByIdAndDelete(id);
    if (!deletedOrderDoc) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { message: 'Order deleted successfully' },
    });
  } catch (error) {
    console.error(`API Error deleting order ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}