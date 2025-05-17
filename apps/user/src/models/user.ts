import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  password?: string;
  provider: 'credentials' | 'google' | 'github';
  image?: string | null; 
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  provider: { type: String, required: true },
  image: { type: String, default: null }, 
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
