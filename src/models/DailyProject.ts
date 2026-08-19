import mongoose, { Schema, models, model } from "mongoose";
import type { DifficultyLevel } from "@/lib/content/types";

export interface IProjectDaySlot {
  gameId: string;
  random: boolean;
}

export interface IProjectDay {
  dayNumber: number;
  math: IProjectDaySlot;
  hebrew: IProjectDaySlot;
  english: IProjectDaySlot;
  mathCompletedAt?: Date | null;
  hebrewCompletedAt?: Date | null;
  englishCompletedAt?: Date | null;
}

export interface IDailyProject {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  name: string;
  totalDays: number;
  difficulty: DifficultyLevel;
  currentDay: number;
  status: "active" | "completed";
  days: IProjectDay[];
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<IProjectDaySlot>(
  {
    gameId: { type: String, required: true },
    random: { type: Boolean, default: true },
  },
  { _id: false }
);

const DaySchema = new Schema<IProjectDay>(
  {
    dayNumber: { type: Number, required: true },
    math: { type: SlotSchema, required: true },
    hebrew: { type: SlotSchema, required: true },
    english: { type: SlotSchema, required: true },
    mathCompletedAt: { type: Date, default: null },
    hebrewCompletedAt: { type: Date, default: null },
    englishCompletedAt: { type: Date, default: null },
  },
  { _id: false }
);

const DailyProjectSchema = new Schema<IDailyProject>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    totalDays: { type: Number, required: true, min: 1, max: 60 },
    difficulty: { type: Number, enum: [1, 2, 3], default: 3 },
    currentDay: { type: Number, required: true, min: 1, default: 1 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    days: { type: [DaySchema], required: true },
  },
  { timestamps: true }
);

export const DailyProject =
  models.DailyProject ?? model<IDailyProject>("DailyProject", DailyProjectSchema);
