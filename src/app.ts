import express from "express";
import corsMiddleware from "./middlerwares/cors.js";
import userRoutes from "./routes/user-route.js";
import productRoutes from "./routes/product-route.js";
import { Request, Response, NextFunction } from "express";
import { Error } from "./models/error-model.js";

// Create Express app
const app = express();

// Get port from environment
const PORT = process.env.PORT;

// Parse user data from input form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use cross origin resource sharing (cors)
app.use(corsMiddleware);

// Use static files in public directory
app.use('/public', express.static("public"));

// Use rate limiter
// app.use(limiter);

// Use middleware to group API route
app.use('/api/v1', [userRoutes, productRoutes]);

// Use middleware to use global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
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
app.listen(PORT, () => {
  console.log(`Listening app on http://localhost:${PORT}`);
});