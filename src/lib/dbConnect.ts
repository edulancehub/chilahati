import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

export default async function dbConnect(): Promise<typeof mongoose> {
    const mongodbUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";

    if (!mongodbUri) {
        throw new Error("Please define MONGO_URI (or MONGODB_URI) environment variable");
    }

    if (!/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
        throw new Error("Invalid MongoDB URI. It must start with mongodb:// or mongodb+srv://");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongodbUri).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
