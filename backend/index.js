const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
// console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect("mongodb://localhost:27017/students_forum", {}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});
