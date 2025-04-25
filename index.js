import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import sessionMiddleware from './middlewares/sessionMiddleware.js';
import path from 'path';
import setupTrashCleanup from './cron/trashCleanup.js';

// Import routes
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';


const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Use the proper session middleware
app.use(sessionMiddleware);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vit-helpdesk')
  .then(() => {
    console.log('Connected to MongoDB');
    setupTrashCleanup();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Public Routes
app.use('/api', publicRoutes);

// Admin Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);


app.use((req, res) => {
  res.status(404).json({
    message: "We're having trouble finding that resource right now."
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);

  // Determine status code
  let status = err.status || 500;
  let message = "Something went wrong on our end. We're working on it.";

  // Optional: Custom messages for common status codes
  if (status === 400) {
    message = "Something seems off. Please check the input and try again.";
  } else if (status === 401) {
    message = "Your session has expired. Please log in again.";
  } else if (status === 403) {
    message = "You don’t have permission to access this.";
  }

  res.status(status).json({ message });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 