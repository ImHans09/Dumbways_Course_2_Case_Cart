import { Router } from "express";
import { getUsers, createUser, updateUser, transferPoint, deleteUser } from "../controllers/user-controller.js";

// Create Router instance
const router = Router();

// Route to get users
router.get('/users', getUsers);

// Route to create user
router.post('/users', createUser);

// Route to update user
router.put('/users/:id', updateUser);

// Route to transfer point between users
router.put('/transfer-points', transferPoint);

// Route to delete user
router.delete('/users/:id', deleteUser);

// Set default export for router variable
export default router;