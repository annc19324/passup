import { Router } from 'express';
import * as SettingController from '../controllers/setting.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', SettingController.getSystemSettings);
router.get('/background-options', SettingController.getBackgroundOptions);

import { upload } from '../middleware/upload.middleware';

// Admin routes
router.post('/background-options', protect, adminOnly, upload.single('image'), SettingController.createBackgroundOption);
router.delete('/background-options/:id', protect, adminOnly, SettingController.deleteBackgroundOption);
router.post('/update', protect, adminOnly, upload.single('image'), SettingController.updateSetting);

export default router;
