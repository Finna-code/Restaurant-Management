
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/MenuItem';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { z } from 'zod';
// MENU_CATEGORIES is no longer the single source of truth for validation here, as categories are dynamic.
// The client (MenuItemForm) will pass a string.

// Define a schema for validating the request body for POST
const postMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"), // Category is now just a string
  price: z.number().positive("Price must be positive"),
  description: z.string().min(1, "Description is required"),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient required"),
  tags: z.array(z.string()).optional().default([]),
  availability: z.boolean().optional().default(true),
  imageUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
  prepTime: z.number().int().min(0).optional(),
});


export async function GET() {
  try {
    await dbConnect();
    const menuItems: MenuItemType[] = await MenuItem.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: menuItems });
  } catch (error) {
    console.error('API Error fetching menu items:', error);
    let errorMessage = 'Server error occurred while fetching menu items.';
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

    const validationResult = postMenuItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: "Invalid input data", issues: validationResult.error.issues }, { status: 400 });
    }

    const { name, category, price, description, ingredients, tags, availability, imageUrl, prepTime } = validationResult.data;

    const newItemData: Partial<MenuItemType> = {
      name,
      category, // category is now a string
      price,
      description,
      ingredients,
      tags,
      availability,
      feedbacks: [],
      averageRating: 0,
    };

    if (imageUrl) {
      newItemData.imageUrl = imageUrl;
    } else {
      newItemData.imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(name)}`;
    }

    if (prepTime !== undefined) {
      newItemData.prepTime = prepTime;
    }

    const menuItem = new MenuItem(newItemData);
    await menuItem.save();

    const createdItem = menuItem.toObject() as MenuItemType;

    return NextResponse.json({ success: true, data: createdItem }, { status: 201 });
  } catch (error) {
    console.error('API Error creating menu item:', error);
    let errorMessage = 'Server error occurred while creating menu item.';
    if (error instanceof Error) {
        if (error.name === 'ValidationError') {
             return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

    