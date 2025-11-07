import express from 'express';
import productRoutes from './routes/product-route.js';
import orderRoutes from './routes/order-route.js';
import userRoutes from './routes/user-route.js';
import supplierRoutes from './routes/supplier-route.js';
import stockRoutes from './routes/stock-route.js';
import { Request, Response } from 'express';
import { Error } from './models/error-model.js';

// Create Express app
const app = express();

// Get port from environment
const port = process.env.PORT;

// Parse user data from input form
app.use(express.urlencoded({ extended: false }));

// Use middleware to group API route
app.use('/api/v1', [productRoutes, userRoutes, supplierRoutes, stockRoutes]);

// Use middleware to use global error handler
app.use((error: Error, req: Request, res: Response, next: any) => {
  const response = {
    success: false,
    error: {
      status: error.status,
      message: (error.message.length !== 0 && error.message) ? error.message : 'Internal server error'
    }
  };

  console.error(`status: ${error.status}, message: ${error.message}`);
  res.status(error.status).json(response);
});

// Running application
app.listen(port, () => {
  console.log(`Listening app on http://localhost:${port}`);
});