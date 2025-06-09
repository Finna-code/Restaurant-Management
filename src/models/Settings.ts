
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import { MENU_CATEGORIES } from '@/lib/types'; // For initializing default categories

// Define the structure for a category setting item
export interface CategorySettingItem {
  name: string;
  isDefault: boolean;
  isVisible: boolean;
  isCustom: boolean;
}

const CategorySettingItemSchema = new Schema<CategorySettingItem>({
  name: { type: String, required: true },
  isDefault: { type: Boolean, required: true },
  isVisible: { type: Boolean, required: true },
  isCustom: { type: Boolean, required: true },
}, { _id: false });


// This interface defines the shape of the settings document in the database.
export interface RestaurantSettingsType extends Document {
  _id: string; // Explicitly defining _id for the singleton pattern
  restaurantName: string;
  restaurantAddress: string;
  restaurantContact: string;
  acceptingOnlineOrders: boolean;
  deliveryRadius: number; // in km
  minOrderValue: number; // in $
  managedCategories: CategorySettingItem[];
  usePlaceholderData: boolean; // New developer toggle
  createdAt?: Date;
  updatedAt?: Date;
}

const SettingsSchema = new Schema<RestaurantSettingsType>({
  _id: { type: String, default: "global_restaurant_settings" }, // Fixed ID for singleton
  restaurantName: { type: String, default: "EatKwik Central Kitchen" },
  restaurantAddress: { type: String, default: "123 Food Street, Flavor Town" },
  restaurantContact: { type: String, default: "555-123-4567" },
  acceptingOnlineOrders: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5, min: 0 },
  minOrderValue: { type: Number, default: 10, min: 0 },
  managedCategories: { type: [CategorySettingItemSchema], default: [] },
  usePlaceholderData: { type: Boolean, default: true }, // Added new field with default
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Static method to get the singleton settings document
SettingsSchema.statics.getSingleton = async function() {
  const fixedId = "global_restaurant_settings";
  let settings = await this.findById(fixedId);
  let wasModified = false;

  if (!settings) {
    settings = new this({}); // usePlaceholderData will use its schema default (true)
    const defaultCategoriesFromTypes: CategorySettingItem[] = MENU_CATEGORIES.map(name => ({
        name,
        isDefault: true,
        isVisible: true,
        isCustom: false,
      }));
    settings.managedCategories = defaultCategoriesFromTypes;
    // usePlaceholderData is already true by schema default for a new document
    wasModified = true; // Mark as modified to ensure initial save
  } else {
    if (!settings.managedCategories || settings.managedCategories.length === 0) {
      const defaultCategoriesFromTypes: CategorySettingItem[] = MENU_CATEGORIES.map(name => ({
          name,
          isDefault: true,
          isVisible: true,
          isCustom: false,
        }));
      settings.managedCategories = defaultCategoriesFromTypes;
      wasModified = true;
    }
    // Ensure usePlaceholderData has a value; if undefined on an existing doc, set to default true and mark for save.
    if (settings.usePlaceholderData === undefined) { // Check specifically for undefined
      settings.usePlaceholderData = true; // Default to true if it was missing
      wasModified = true;
    }
  }

  if (wasModified) {
    await settings.save();
  }
  
  return settings;
};

// Static method to update the singleton settings document
SettingsSchema.statics.updateSingleton = async function(updateData: Partial<Omit<RestaurantSettingsType, '_id' | 'createdAt' | 'updatedAt'>>) {
  const fixedId = "global_restaurant_settings";
  return this.findByIdAndUpdate(fixedId, updateData, { new: true, upsert: true, runValidators: true });
};

interface SettingsModel extends Model<RestaurantSettingsType> {
  getSingleton(): Promise<RestaurantSettingsType>;
  updateSingleton(updateData: Partial<Omit<RestaurantSettingsType, '_id' | 'createdAt' | 'updatedAt'>>): Promise<RestaurantSettingsType | null>;
}

const Settings = (models.Settings as SettingsModel) || mongoose.model<RestaurantSettingsType, SettingsModel>('Settings', SettingsSchema);

export default Settings;
export type { CategorySettingItem as ApiCategorySettingItem };
