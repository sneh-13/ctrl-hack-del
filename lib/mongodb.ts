import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Cached connection to avoid multiple connections during hot reloads in development
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  (global as unknown as { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose || { conn: null, promise: null };

if (!(global as unknown as { mongoose: unknown }).mongoose) {
  (global as unknown as { mongoose: typeof cached }).mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
