import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path'; // Import path module
import pool from './config/db.js';

import resourceRoutes from './routes/resourceRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const server = express();
const PORT = process.env.PORT || 3001;

server.use(cors({
  origin: '*',
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

server.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected successfully!', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

server.get('/', (req, res) => {
  res.send('Connected to Server! 🚀');
});

server.use("/uploads", express.static("uploads"));
server.use('/resources', resourceRoutes);
server.use('/inventory', inventoryRoutes);

// Error handling middleware
server.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: 'File upload error', details: err.message });
  } else if (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}!!`);
});