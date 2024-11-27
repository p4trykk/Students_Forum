const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config({ path: './backend/.env' });

const app = express();
app.use(express.json()); 
app.use('/api/auth', authRoutes);
// console.log('MONGO_URI:', process.env.MONGO_URI);
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to the Students Forum API!');
});
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/api', (req, res) => {
  res.json({
    message: "Welcome to the Students Forum API",
    endpoints: {
      register: "/api/auth/register",
      login: "/api/auth/login"
    }
  });
});


mongoose.connect("mongodb://localhost:27017/students_forum", {}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});
