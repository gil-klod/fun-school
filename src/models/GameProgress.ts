import mongoose, { Schema, models, model } from "mongoose";

export interface IGameProgress {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subjectId: string;
  gameId: string;
  difficulty: 1 | 2 | 3;
  status: "in_progress" | "completed";
  score: number;
  streak: number;
  round: number;
  correct: number;
  wrong: number;
  state: Record<string, unknown>;
  lastPlayedAt: Date;
}

const GameProgressSchema = new Schema<IGameProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: String, required: true },
    gameId: { type: String, required: true },
    difficulty: { type: Number, enum: [1, 2, 3], default: 2, required: true },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    score: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    round: { type: Number, default: 1 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    state: { type: Schema.Types.Mixed, default: {} },
    lastPlayedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

GameProgressSchema.index(
  { userId: 1, subjectId: 1, gameId: 1, difficulty: 1 },
  { unique: true }
);
GameProgressSchema.index({ userId: 1, lastPlayedAt: -1 });

export const GameProgress =
  models.GameProgress ?? model<IGameProgress>("GameProgress", GameProgressSchema);
