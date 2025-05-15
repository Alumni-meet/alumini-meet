const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function verifyConnection() {
  try {
    console.log("Verifying MongoDB connection...");
    console.log("Using connection URL:", process.env.MONGO_DB_URL);
    
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("MongoDB connection verified successfully!");
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Close the connection
    await mongoose.connection.close();
    console.log("Connection closed.");
  } catch (error) {
    console.error("MongoDB connection verification failed:", error.message);
  }
}

// Run the verification
verifyConnection(); 