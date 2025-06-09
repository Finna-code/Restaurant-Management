
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Order as OrderType, OrderItem as OrderItemType, OrderStatus } from '@/lib/types';
import { ORDER_STATUSES } from '@/lib/types'; // For enum validation

// Define the schema for OrderItem (as a subdocument)
const OrderItemSchema = new Schema<OrderItemType>({
  menuItemId: { type: String, required: true }, // Or Schema.Types.ObjectId if linking to MenuItem collection
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true },
  customizations: { type: String },
}, { _id: false }); // Ensure no separate _id for subdocuments

// Define the schema for Order
const OrderSchema = new Schema<OrderType>({
  orderNumber: { type: String, required: true, unique: true, index: true },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: [ (val: OrderItemType[]) => val.length > 0, 'Order must have at least one item.' ]
  },
  customerId: { type: String, index: true }, // Optional
  customerName: { type: String, required: true, trim: true },
  customerContact: { type: String, required: true, trim: true },
  status: { type: String, enum: ORDER_STATUSES, required: true, default: 'Placed' },
  notes: { type: String, trim: true },
  totalAmount: { type: Number, required: true, min: 0 },
  deliveryAddress: { type: String, trim: true },
  estimatedDeliveryTime: { type: String }, // Using String for ISO date compatibility
  // createdAt and updatedAt are handled by timestamps: true
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Ensure id is a string
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Ensure id is a string
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Create the model
const Order: Model<OrderType> = models.Order || mongoose.model<OrderType>('Order', OrderSchema);

export default Order;
