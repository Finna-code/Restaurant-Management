
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import type { RestaurantSettingsType, ApiCategorySettingItem as CategorySettingItem } from '@/models/Settings'; // Use aliased import
import { z } from 'zod';

// Schema for validating the category items when received in PUT
const categorySettingItemSchema = z.object({
  name: z.string().min(1),
  isDefault: z.boolean(),
  isVisible: z.boolean(),
  isCustom: z.boolean(),
});

// Schema for validating PUT request body
const settingsUpdateSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name cannot be empty.").optional(),
  restaurantAddress: z.string().min(1, "Restaurant address cannot be empty.").optional(),
  restaurantContact: z.string().min(1, "Restaurant contact cannot be empty.").optional(),
  acceptingOnlineOrders: z.boolean().optional(),
  deliveryRadius: z.number().min(0, "Delivery radius cannot be negative.").optional(),
  minOrderValue: z.number().min(0, "Minimum order value cannot be negative.").optional(),
  managedCategories: z.array(categorySettingItemSchema).optional(),
  usePlaceholderData: z.boolean().optional(), // Added new field
}).partial();

export async function GET() {
  try {
    await dbConnect();
    // getSingleton now handles initialization of managedCategories if they are missing or empty.
    const settingsDoc = await Settings.getSingleton(); 
    
    const settingsObject = settingsDoc.toObject({ virtuals: true });
    return NextResponse.json({ success: true, data: settingsObject });
  } catch (error) {
    console.error('API Error fetching settings:', error);
    let errorMessage = 'Server error occurred while fetching settings.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validationResult = settingsUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid input data. Please check the fields.", 
        issues: validationResult.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const updatedSettingsDoc = await Settings.updateSingleton(validationResult.data);

    if (!updatedSettingsDoc) {
      return NextResponse.json({ success: false, error: 'Failed to update settings. Please try again.' }, { status: 500 });
    }
    
    const updatedSettingsObject = updatedSettingsDoc.toObject({ virtuals: true });
    return NextResponse.json({ success: true, data: updatedSettingsObject });
  } catch (error) {
    console.error('API Error updating settings:', error);
    let errorMessage = 'Server error occurred while updating settings.';
     if (error instanceof Error) {
        if (error.name === 'ValidationError') {
             return NextResponse.json({ success: false, error: error.message, issues: (error as any).errors }, { status: 400 });
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
