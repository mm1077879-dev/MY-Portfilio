import mongoose from 'mongoose';
import { env } from './env';

let connectionMode: 'external-mongodb' | 'disconnected' = 'disconnected';
let connectionError: string | null = null;
let connectionAttempt: Promise<void> | null = null;
let isDisconnecting = false;

mongoose.connection.on('disconnected', () => {
  connectionMode = 'disconnected';
  if (isDisconnecting) {
    connectionError = null;
    return;
  }
  connectionError = 'MongoDB Atlas connection is unavailable.';
  console.warn('[MongoDB] Atlas connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  connectionMode = 'external-mongodb';
  connectionError = null;
  console.info('[MongoDB] Atlas connection restored.');
});

mongoose.connection.on('error', () => {
  connectionError = 'MongoDB Atlas connection error.';
  console.error('[MongoDB] Atlas connection error.');
});

export async function connectDatabase(): Promise<void> {
  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MongoDB Atlas configuration error: MONGODB_URI is required.'
    );
  }

  const scheme = /^(mongodb(?:\+srv)?):\/\//i.exec(uri)?.[1].toLowerCase();
  let parsedHosts: string[] = [];
  try {
    const client = new mongoose.mongo.MongoClient(uri);
    parsedHosts =
      scheme === 'mongodb+srv'
        ? [client.options.srvHost || '']
        : client.options.hosts.map((host) => host.host || '');
  } catch {
    // Keep connection errors sanitized; the URI may contain credentials.
  }

  if (
    !scheme ||
    parsedHosts.length === 0 ||
    parsedHosts.some((host) => !host.toLowerCase().endsWith('.mongodb.net')) ||
    /<(?:username|password|cluster-url|database-name)>/i.test(uri)
  ) {
    throw new Error(
      'MongoDB Atlas configuration error: MONGODB_URI must be a valid Atlas URI using mongodb+srv:// or mongodb:// with *.mongodb.net hosts.'
    );
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionAttempt) {
    return connectionAttempt;
  }

  connectionAttempt = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000 })
    .then(() => {
      connectionMode = 'external-mongodb';
      connectionError = null;
      console.info('[MongoDB] Connected to the configured MongoDB cluster.');
    })
    .catch(() => {
      connectionMode = 'disconnected';
      connectionError = 'MongoDB Atlas connection failed.';
      console.error(
        '[MongoDB] Atlas connection failed. Check MONGODB_URI, Atlas network access, and database credentials.'
      );
      throw new Error(
        'MongoDB Atlas connection failed. Verify the MONGODB_URI and Atlas access configuration.'
      );
    })
    .finally(() => {
      connectionAttempt = null;
    });

  return connectionAttempt;
}

export async function disconnectDatabase(): Promise<void> {
  isDisconnecting = true;
  try {
    await mongoose.disconnect();
    connectionMode = 'disconnected';
    connectionError = null;
  } finally {
    isDisconnecting = false;
  }
}

export function getDatabaseHealth() {
  const readyState = mongoose.connection.readyState;
  const stateLabels: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    connected: readyState === 1,
    state: stateLabels[readyState] || 'unknown',
    mode: connectionMode,
    configuredExternalUri: Boolean(env.MONGODB_URI),
    databaseName: mongoose.connection.name || 'mahim_dev_portfolio',
    lastError: connectionError,
  };
}
