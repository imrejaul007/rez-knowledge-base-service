import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import merchantRoutes from './routes/merchant';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'rez-knowledge-base-service',
    timestamp: Date.now()
  });
});

// Routes
app.use('/api/merchants', merchantRoutes);

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'REZ Knowledge Base Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      merchants: {
        list: 'GET /api/merchants',
        create: 'POST /api/merchants',
        get: 'GET /api/merchants/:merchantId',
        update: 'PUT /api/merchants/:merchantId',
        delete: 'DELETE /api/merchants/:merchantId'
      },
      menu: {
        add: 'POST /api/merchants/:merchantId/menu',
        update: 'PUT /api/merchants/:merchantId/menu/:itemId',
        delete: 'DELETE /api/merchants/:merchantId/menu/:itemId'
      },
      faq: {
        list: 'GET /api/merchants/:merchantId/faq',
        add: 'POST /api/merchants/:merchantId/faq',
        update: 'PUT /api/merchants/:merchantId/faq/:faqId',
        delete: 'DELETE /api/merchants/:merchantId/faq/:faqId'
      },
      search: 'GET /api/merchants/:merchantId/search?q=query',
      import: 'POST /api/merchants/:merchantId/import',
      export: 'GET /api/merchants/:merchantId/export'
    }
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rez-knowledge-base';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`REZ Knowledge Base Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
