import mongoose from 'mongoose';
import { seedDatabase } from './seed.js';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, isConnected: false, seeded: false };
}

/**
 * Connect to MongoDB with connection pooling
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      cached.isConnected = true;
      return m;
    }).catch((err) => {
      cached.promise = null;
      console.warn('MongoDB connection attempted but not established, falling back to memory layer:', err.message);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
    if (cached.conn && !cached.seeded) {
      await seedDatabase();
      cached.seeded = true;
    }
  } catch (e) {
    cached.promise = null;
  }

  return cached.conn;
}

/**
 * Check health status of database
 */
export async function getDBHealth() {
  try {
    if (!MONGODB_URI) {
      return { status: 'Memory/Standalone Mode', connected: true, driver: 'in-memory-storage' };
    }
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return {
      status: states[state] || 'unknown',
      connected: state === 1,
      driver: 'mongodb'
    };
  } catch (err) {
    return { status: 'error', connected: false, error: err.message };
  }
}
