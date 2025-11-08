import { Router } from "express";
import { createProduct, updateProduct } from "../controllers/product-controller.js";
import { authenticate } from "../middlerwares/auth-middleware.js";

// Create Router instance
const router = Router();

// Route to create product
router.post('/product/add', authenticate, createProduct);

// Route to update product
router.put('/product/update/:id', authenticate, updateProduct);

// Route to delete product

// Set default export for router variable
export default router;