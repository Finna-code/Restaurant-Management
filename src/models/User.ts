
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { User as UserType, UserRole } from '@/lib/types';

// Define the possible roles, consistent with UserRole type
const USER_ROLES: UserRole[] = ['admin', 'staff', 'customer'];

const UserSchema = new Schema<UserType>({
  // MongoDB's _id will serve as the unique identifier.
  // The UserType interface has an 'id' field; when fetching from DB, _id can be mapped to id.
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  role: {
    type: String,
    enum: USER_ROLES,
    required: [true, 'User role is required'],
    default: 'customer',
  },
  name: {
    type: String,
    trim: true,
  },
  // If you were to implement password hashing, you would add a password field here.
  // password: { type: String, required: true },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
  // Optionally, define a transform to map _id to id when converting to JSON/object
  toJSON: {
    virtuals: true, // Ensure virtuals are included if you define any
    transform: function(doc, ret) {
      ret.id = ret._id; // Map _id to id
      delete ret._id;   // Remove _id
      delete ret.__v;  // Remove __v
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

// Create the model
// Check if the model already exists before defining it
const User: Model<UserType> = models.User || mongoose.model<UserType>('User', UserSchema);

export default User;
