import express from 'express';
import dotenv from 'dotenv';
import Connection from './db/connection';
import authRoutes from './routes/user-router';

dotenv.config();
Connection();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
