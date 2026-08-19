import mongoose, { Schema, models, model } from "mongoose";

export interface SubjectStat {
  subjectId: string;
  correct: number;
  wrong: number;
  accuracy: number;
  gamesPlayed: number;
}

export interface GameStat {
  subjectId: string;
  gameId: string;
  correct: number;
  wrong: number;
  accuracy: number;
  score: number;
}

export interface IUserAnalytics {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectStats: SubjectStat[];
  gameStats: GameStat[];
  strengths: string[];
  weaknesses: string[];
  aiFeedback: string;
  recommendations: string[];
  updatedAt: Date;
}

const SubjectStatSchema = new Schema(
  {
    subjectId: String,
    correct: Number,
    wrong: Number,
    accuracy: Number,
    gamesPlayed: Number,
  },
  { _id: false }
);

const GameStatSchema = new Schema(
  {
    subjectId: String,
    gameId: String,
    correct: Number,
    wrong: Number,
    accuracy: Number,
    score: Number,
  },
  { _id: false }
);

const UserAnalyticsSchema = new Schema<IUserAnalytics>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    subjectStats: { type: [SubjectStatSchema], default: [] },
    gameStats: { type: [GameStatSchema], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    aiFeedback: { type: String, default: "" },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: { updatedAt: true, createdAt: false } }
);

export const UserAnalytics =
  models.UserAnalytics ?? model<IUserAnalytics>("UserAnalytics", UserAnalyticsSchema);
