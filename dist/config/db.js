"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const uri = process.env.MONGO_URI || "";
// Proper typing for serverApi options
const clientOptions = {
    serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
    },
};
const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...", uri);
        await mongoose_1.default.connect(uri, clientOptions);
        await mongoose_1.default.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
