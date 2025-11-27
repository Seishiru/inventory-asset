// src/index.ts
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import brandsRouter from './routes/brands';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // For handling image data

// Routes
app.use('/api/assets', assetsRouter);
app.use('/api/auth', authRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/users', userRoutes);

// Test route
app.get('/api/test', (req, res) => res.json({ message: 'Server is working!' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});