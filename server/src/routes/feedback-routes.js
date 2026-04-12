// server/src/routes/feedback-routes.js

import express from 'express';
import { postFeedback, getPromiseFeedback, approveFeedback, deleteFeedback } from '../controllers/feedback-controller.js';
import jwtAuth from '../middlewares/jwt-auth.js';
import requireRole from '../middlewares/require-role.js';

const router = express.Router();

router.get('/:id/feedback', getPromiseFeedback);
router.post('/:id/feedback', jwtAuth, requireRole(['citizen']), postFeedback);
router.patch('/:id/approve', jwtAuth, requireRole(['admin']), approveFeedback);
router.delete('/:id', jwtAuth, requireRole(['admin']), deleteFeedback);

export default router;