import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import cookieParser from 'cookie-parser'
import equipmentRoutes from './routes/equipmentRoutes.js';  
import purchases from './routes/purchases.js';// Change to .js extension
import router from './routes/index.routes.js';
import taskRoutes from './routes/taskRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import projectRoutes from './routes/projects.js';
import labourAssignmentRoutes from './routes/labourAssignmentRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(cookieParser())
app.use(cors({
    origin: true,
    credentials: true,
}))

app.use(express.json({ limit: "10mb" })); 

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 4000;

connectDB();

// API Endpoints
app.use('/api/equipment', equipmentRoutes); 
app.use('/api/purchases',purchases);// Add /api prefix to match frontend URL
app.use("/api/user",router)
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', labourAssignmentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('API Working');
});

// Start Server
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(4000);