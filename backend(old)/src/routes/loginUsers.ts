import { Router } from 'express';
import * as LoginUserController from '../controllers/loginUserController';

const router = Router();

// Get all login users
router.get('/', LoginUserController.getAllLoginUsers);

// Get login user by ID
router.get('/:id', LoginUserController.getLoginUserById);

// Create a new login user
router.post('/', LoginUserController.createLoginUser);

// Update login user
router.put('/:id', LoginUserController.updateLoginUser);

// Delete login user
router.delete('/:id', LoginUserController.deleteLoginUser);

// Login endpoint
router.post('/auth/login', LoginUserController.loginUser);

export default router;
