// src/routes/accessories.ts
import express from 'express';
import * as AccessoriesController from '../controllers/accessoriesController';

const router = express.Router();

router.get('/', AccessoriesController.listAccessories);
router.get('/:id', AccessoriesController.getAccessoryById);
router.post('/', AccessoriesController.createAccessory);
router.put('/:id', AccessoriesController.updateAccessory);
router.delete('/:id', AccessoriesController.deleteAccessory);

// Action endpoint: request/issue/reserve
router.post('/:id/request', AccessoriesController.requestAccessory);

export default router;
