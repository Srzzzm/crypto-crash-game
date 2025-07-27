const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    await mongoose.connect('mongodb+srv://sriramkm2004:sriram@cluster0.ioxfm1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    
    process.exit(1);
  }
};

module.exports = connectDB;