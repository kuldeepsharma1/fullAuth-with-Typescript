import mongoose from "mongoose";

export const connect = async () => {
    try {
        const connection = await mongoose.connect(process.env.DB_URI!);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("Could not connect to DB", error);
        process.exit(1);
    }
};
export default connect;