import mongoose, { ConnectOptions } from "mongoose";
import "dotenv/config";

const uri = process.env.MONGO_URI || "";

// Proper typing for serverApi options
const clientOptions: ConnectOptions & {
  serverApi?: {
    version: string;
    strict: boolean;
    deprecationErrors: boolean;
  };
} = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectDB = async (): Promise<void> => {
  try {
    console.log("Connecting to MongoDB...", uri);
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
