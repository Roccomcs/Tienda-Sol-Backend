import mongoose from 'mongoose';

export class MongoDBClient {
    static async connect() {
        try {
            const connectionString = process.env.MONGODB_CONNECTION_STRING
                ?? `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`

            const conn = await mongoose.connect(connectionString);

            console.log(`MongoDB is connected: ${conn.connection.host}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
}
