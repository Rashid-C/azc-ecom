import mongoose from 'mongoose'
const cached = (global as any).mongoose || { conn: null, promise: null }

export const connectToDatabase = async (
    MONGODB_URI = process.env.MONGODB_URI
) => {
    if (cached.conn) return cached.conn
    if (!MONGODB_URI)
        throw new Error(
            'Missing MONGODB_URI environment variable inside .env.local'
        )
    cached.promise = cached.promise || mongoose.connect(MONGODB_URI)
    cached.conn = await cached.promise
    return cached.conn
}

// import mongoose from 'mongoose'

// type MongooseCache = {
//     conn: typeof mongoose | null
//     promise: Promise<typeof mongoose> | null
// }

// const globalForMongoose = globalThis as typeof globalThis & {
//     mongoose?: MongooseCache
// }

// const cached =
//     globalForMongoose.mongoose ?? (globalForMongoose.mongoose = { conn: null, promise: null })

// export const connectToDatabase = async (
//     MONGODB_URI = process.env.MONGODB_URI
// ) => {
//     if (cached.conn) return cached.conn
//     if (!MONGODB_URI) {
//         throw new Error('Missing MONGODB_URI environment variable inside .env.local')
//     }
//     cached.promise = cached.promise || mongoose.connect(MONGODB_URI)
//     cached.conn = await cached.promise
//     return cached.conn
// }
