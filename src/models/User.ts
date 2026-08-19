import mongoose, { Schema, models, model } from "mongoose";
import type { UserGender } from "@/lib/gender";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  gender: UserGender;
  emailVerified: Date | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    emailVerified: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = models.User ?? model<IUser>("User", UserSchema);
