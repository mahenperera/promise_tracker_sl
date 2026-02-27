// server/src/routes/feedback-routes.js

import express from 'express';
import { postFeedback, getPromiseFeedback, approveFeedback, deleteFeedback } from '../controllers/feedback-controller.js';
import jwtAuth from '../middlewares/jwt-auth.js';
import requireRole from '../middlewares/require-role.js';

const router = express.Router();

router.get('/:id/feedback', getPromiseFeedback);
router.post('/:id/feedback', jwtAuth, requireRole('CITIZEN'), postFeedback);
router.patch('/:id/approve', jwtAuth, requireRole('MODERATOR', 'ADMIN'), approveFeedback);
router.delete('/:id', jwtAuth, requireRole('MODERATOR', 'ADMIN'), deleteFeedback);

export default router;