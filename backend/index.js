const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
dotenv.config({ path: './backend/.env' });

cron.schedule('0 0 * * *', async () => { // Uruchamiane codziennie o północy
  try {
    await axios.post('http://localhost:5000/api/users/update-badges'); // Zmodyfikuj, jeśli masz inne API
    console.log('Badges updated successfully (cron job).');
  } catch (err) {
    console.error('Error updating badges via cron:', err.message);
  }
});

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-production-domain.com' : 'http://localhost:3000',  
  credentials: true,                 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json()); 
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

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
