// src/index.ts
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import brandsRouter from './routes/brands';
import userRoutes from './routes/users';
import accessoriesRouter from './routes/accessories';
import { prisma } from './prisma'; // Import your Prisma instance

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // For handling image data

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/assets', assetsRouter);
app.use('/api/auth', authRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/users', userRoutes);
app.use('/api/accessories', accessoriesRouter);

// Test route
app.get('/api/test', (req, res) => res.json({ message: 'Server is working!' }));

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Count records in each table
    const assetsCount = await prisma.asset.count();
    const usersCount = await prisma.user.count();
    const brandsCount = await prisma.brand.count();
    const accessoriesCount = await prisma.accessory.count();
    
    res.json({
      message: 'Database connection successful!',
      counts: {
        assets: assetsCount,
        users: usersCount,
        brands: brandsCount,
        accessories: accessoriesCount
      }
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    // Test database connection on startup
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test counts
    const assetsCount = await prisma.asset.count();
    const usersCount = await prisma.user.count();
    console.log(`📊 Current counts - Assets: ${assetsCount}, Users: ${usersCount}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Test database: http://localhost:${PORT}/api/db-test`);
      console.log(`🔧 Basic test: http://localhost:${PORT}/api/test`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();