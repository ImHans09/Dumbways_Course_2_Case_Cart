import express from 'express';
import productRoutes from './routes/product-route.js';
import orderRoutes from './routes/order-route.js';

// Create Express app
const app = express();

// Get port from environment
const port = process.env.PORT;

// Parsing user data from input form
app.use(express.urlencoded({ extended: false }));

// Use middleware to access API route
app.use('/api/v1', [productRoutes, orderRoutes]);

// Running application
app.listen(port, () => {
  console.log(`Listening app on http://localhost:${port}`);
});