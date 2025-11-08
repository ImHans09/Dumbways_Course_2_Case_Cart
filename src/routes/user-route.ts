import { Router } from "express";
import { getUsers, createUserAdmin, createUserCustomer, createUserSupplier, updateUser, loginUser } from "../controllers/user-controller.js";
import { authenticate } from "../middlerwares/auth-middleware.js";

// Create Router instance
const router = Router();

// Route to get users
router.get('/users', getUsers);

// Route to create admin
router.post('/users/register/admin', createUserAdmin);

// Route to create customer
router.post('/users/register', createUserCustomer);

// Route to create supplier
router.post('/users/register/supplier', createUserSupplier);

// Route to update user
router.put('/users/:id', authenticate, updateUser);

// Route to authenticate user
router.post('/users/login', loginUser);

// Route to transfer point between users
// router.put('/transfer-points', transferPoint);

// Route to delete user
// router.delete('/users/:id', deleteUser);

// Set default export for router variable
export default router;