import { Router } from 'express';
import * as ActivityLogController from '../controllers/activityLogController';

const router = Router();

// Get all activity logs
router.get('/', ActivityLogController.getAllActivityLogs);

// Get activity log by ID
router.get('/:id', ActivityLogController.getActivityLogById);

// Get activity logs by user
router.get('/user/:username', ActivityLogController.getActivityLogsByUser);

// Get activity logs by type
router.get('/type/:type', ActivityLogController.getActivityLogsByType);

// Create activity log
router.post('/', ActivityLogController.createActivityLog);

// Delete activity log
router.delete('/:id', ActivityLogController.deleteActivityLog);

// Delete all activity logs for a user
router.delete('/user/:username', ActivityLogController.deleteActivityLogsByUser);

// Clear old activity logs
router.post('/maintenance/clear-old', ActivityLogController.clearOldActivityLogs);

export default router;
