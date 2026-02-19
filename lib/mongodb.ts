import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI || "";
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Adding timeout to fail faster during config issues
  connectTimeoutMS: 10000, 
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

/**
 * Enhanced Resilience Logic:
 * We provide a descriptive rejection so the API routes can report exactly what is missing.
 */
if (!uri || uri.includes('<password>')) {
  const errorMsg = !uri 
    ? 'MONGODB_URI environment variable is missing.' 
    : 'MONGODB_URI contains a placeholder <password>. Please update it with your real Atlas credentials.';
  
  clientPromise = Promise.reject(new Error(errorMsg));
} else {
  try {
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongo = globalThis as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
  } catch (e: any) {
    clientPromise = Promise.reject(new Error(`Failed to initialize MongoDB client: ${e.message}`));
  }
}

export default clientPromise;