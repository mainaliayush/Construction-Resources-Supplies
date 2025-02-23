import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer'; 
import pool from './config/db.js';

import resourceRoutes from './routes/resourceRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const server = express();
const PORT = process.env.PORT || 3001;

server.use(cors({
  origin: 'https://inventory-location.netlify.app', 
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true })); 

const upload = multer({ dest: "uploads/" }); 

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


server.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}!!`);
});
