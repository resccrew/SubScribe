import { MongoClient } from 'mongodb'

const MONGODB_URI = 'mongodb://nikitapravorov:Zs8zFLZ9z6MB4O8cMrvx1Yrui1j-Ae3T8zUJdB6o0-XpPNnq@33e15fab-0050-4188-b111-640c127aeaa2.europe-west4.firestore.goog:443/subscribe?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false'

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