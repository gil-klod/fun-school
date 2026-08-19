import mongoose, { Schema, models, model } from "mongoose";
import type { UserGender } from "@/lib/gender";

export interface IStudent {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: UserGender;
  avatar: string;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 4, max: 14 },
    gender: { type: String, enum: ["male", "female"], required: true },
    avatar: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Student = models.Student ?? model<IStudent>("Student", StudentSchema);
