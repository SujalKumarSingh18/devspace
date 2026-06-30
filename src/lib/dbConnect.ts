import mongoose from 'mongoose';

/**
 * EXTENDING THE GLOBAL TYPE
 * In Next.js development mode, hot-reloading clears the node cache.
 * To preserve our database connection across file changes, we attach it to the `global` object.
 * We must tell TypeScript that `global.mongoose` is a valid property.
 */
declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;//mongoose constructor
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside your env file.');
}

/**
 * CACHE INITIALIZATION
 * Check if a global cache already exists. If not, initialize it.
 * This cache acts as our connection singleton.
 */
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose!;



async function dbConnect() {
  // A. Check if we already have an active database connection.
  // If we do, return it immediately to avoid spawning new connections (Connection Pooling).
  if (cached.conn) {
    return cached.conn;
  }

  // B. If no connection attempt is currently in progress, initiate one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering queries when not connected
    };

    // Store the pending Promise. If concurrent API routes call dbConnect() at the same
    // instant, they will wait on this SAME promise rather than initiating multiple connections.
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      return m;
    });
  }

  // C. Await the connection promise and handle errors.
  try {
    cached.conn = await cached.promise;//Promise has two possibilities => resolve/reject, resolve is handled here
  } catch (error) {
    // If the connection fails, clear the cached promise so we can try reconnecting on the next request.
    cached.promise = null;
    console.error('Database connection error:', error);
    throw error;
  }

  // D. Return the active connection
  return cached.conn;
}

export default dbConnect;
