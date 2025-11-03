import { Router } from "express";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/product-controller.js";

// Create Router instance
const router = Router();

// Route to get products
router.get('/products', getProducts);

// Route to create product
router.post('/products', createProduct);

// Route to update product
router.put('/products/:id', updateProduct);

// Route to delete product
router.delete('/products/:id', deleteProduct);

// Set default export for router variable
export default router;