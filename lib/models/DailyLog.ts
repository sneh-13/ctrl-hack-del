import mongoose, { Document, Model, Schema } from "mongoose";

type MuscleSorenessMap = Record<string, number>;

export interface IDailyLog extends Document {
  userId: mongoose.Types.ObjectId;
  dayKey: string;
  date: string;
  sleepDurationHours: number;
  wakeTime: string;
  stress: number;
  yesterdayWorkout: string;
  lastSessionRpe: number;
  subjectiveSoreness: number;
  muscleSoreness: MuscleSorenessMap;
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dayKey: { type: String, required: true },
    date: { type: String, required: true },
    sleepDurationHours: { type: Number, required: true },
    wakeTime: { type: String, required: true },
    stress: { type: Number, required: true },
    yesterdayWorkout: { type: String, default: "" },
    lastSessionRpe: { type: Number, required: true },
    subjectiveSoreness: { type: Number, required: true },
    muscleSoreness: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

DailyLogSchema.index({ userId: 1, dayKey: 1 }, { unique: true });
DailyLogSchema.index({ userId: 1, date: -1 });

const DailyLog: Model<IDailyLog> =
  mongoose.models.DailyLog || mongoose.model<IDailyLog>("DailyLog", DailyLogSchema);

export default DailyLog;
