import mongoose from 'mongoose';

const mongoDBConnect = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/realtime-chat';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB - Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    // Don't exit, just log the error
    console.log("⚠️ Continuing without MongoDB - some features will be limited");
  }
};

export default mongoDBConnect;
