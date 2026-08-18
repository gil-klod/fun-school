import mongoose, { Schema, models, model } from "mongoose";
import type { ContentItemType } from "@/lib/content/types";

export interface IGameContent {
  _id: mongoose.Types.ObjectId;
  subjectId: string;
  gameId: string;
  difficulty: 1 | 2 | 3;
  itemType: ContentItemType;
  data: Record<string, unknown>;
  sortOrder: number;
  active: boolean;
}

const GameContentSchema = new Schema<IGameContent>(
  {
    subjectId: { type: String, required: true, index: true },
    gameId: { type: String, required: true, index: true },
    difficulty: { type: Number, enum: [1, 2, 3], required: true, index: true },
    itemType: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GameContentSchema.index(
  { subjectId: 1, gameId: 1, difficulty: 1, itemType: 1, sortOrder: 1 },
  { unique: false }
);
GameContentSchema.index({ subjectId: 1, gameId: 1, difficulty: 1, itemType: 1 });

export const GameContent =
  models.GameContent ?? model<IGameContent>("GameContent", GameContentSchema);
