import { Router } from "express";
import { authenticate } from "../middlerwares/auth-middleware.js";
import { getProducts } from "../controllers/supplier-controller.js";

// Create Router instance
const router = Router();

// Route to get supplier products data
router.get('/suppliers/products', authenticate, getProducts)

// Route to update stock and quantity from product stock and supplier

// Set default export for router variable
export default router;