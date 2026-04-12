// server/src/routes/feedback-routes.js

import express from 'express';
import { postFeedback, getPromiseFeedback, approveFeedback, deleteFeedback, editFeedback } from '../controllers/feedback-controller.js';
import jwtAuth from '../middlewares/jwt-auth.js';
import requireRole from '../middlewares/require-role.js';

const router = express.Router();

router.get('/:id/feedback', jwtAuth.optional, getPromiseFeedback);
router.post('/:id/feedback', jwtAuth, requireRole(['citizen']), postFeedback);
router.patch('/:id/approve', jwtAuth, requireRole(['admin']), approveFeedback);
router.put('/:id', jwtAuth, requireRole(['citizen']), editFeedback);
router.delete('/:id', jwtAuth, requireRole(['admin', 'citizen']), deleteFeedback);

export default router;