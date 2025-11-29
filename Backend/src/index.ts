import express from 'express';
import dotenv from 'dotenv';
import loginuserRouter from './routes/loginuser';
import usermanagementRouter from './routes/usermanagement';
import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import accessoriesRouter from './routes/accessories';
import brandsRouter from './routes/brands';
import monthlyReportsRouter from './routes/monthlyReports';
import assetTypeOptionsRouter from './routes/assetTypeOptions';
import activityLogRouter from './routes/activityLog';
import prisma from './prismaClient';

dotenv.config();
const app = express();

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use('/auth', authRouter);
app.use('/assets', assetsRouter);
app.use('/accessories', accessoriesRouter);
app.use('/loginuser', loginuserRouter);
app.use('/usermanagement', usermanagementRouter);
app.use('/brands', brandsRouter);
app.use('/asset-type-options', assetTypeOptionsRouter);
app.use('/monthly-report', monthlyReportsRouter);
app.use('/activity-log', activityLogRouter);

app.get('/', async (_req, res) => {
  try {
    const users = await prisma.loginuser.findMany();
    res.json({
      message: 'AMS backend running - Connected to database',
      loginUsers: users,
      count: users.length
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'AMS backend running - Database connection failed',
      error: String(err) 
    });
  }
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
