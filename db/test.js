const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://localhost:27017/testdb';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

module.exports = connectDB


/**
 * brew tap mongodb/brew
 * brew install mongosh
 * 
 * brew tap mongodb/brew
 * brew install mongodb-community@6.0
 * brew services start mongodb-community@6.0
 */