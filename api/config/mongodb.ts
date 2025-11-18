import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  const g = globalThis as any
  if (!g._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI)
    g._mongoClientPromise = client.connect()
  }
  clientPromise = g._mongoClientPromise
} else {
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export default clientPromise