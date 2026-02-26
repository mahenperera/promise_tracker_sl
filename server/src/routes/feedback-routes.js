// server/src/routes/feedback-routes.js

import express from 'express';
import { postFeedback, getPromiseFeedback, approveFeedback, deleteFeedback } from '../controllers/feedback-controller.js';
import clerkAuth from '../middlewares/clerk-auth.js';
import requireRole from '../middlewares/require-role.js';

const router = express.Router();

router.get('/:id/feedback', getPromiseFeedback);
router.post('/:id/feedback', clerkAuth, requireRole('CITIZEN'), postFeedback);
router.patch('/:id/approve', clerkAuth, requireRole('MODERATOR', 'ADMIN'), approveFeedback);
router.delete('/:id', clerkAuth, requireRole('MODERATOR', 'ADMIN'), deleteFeedback);

export default router;