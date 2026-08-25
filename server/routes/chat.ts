import { Router } from 'express';
import { authMiddleware, AuthRequest } from './auth';
import { storage } from '../storage';

const router = Router();

/**
 * DELETE /api/chat/clear
 * Clears the active conversation messages for the authenticated user only.
 * Keeps command history archives and notes logically separated.
 */
router.delete('/clear', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const clearedCount = storage.clearCommands(userId);

    return res.json({
      success: true,
      message: 'Chat cleared. How can I help you?',
      clearedCount
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to clear chat: ' + (err.message || 'Unknown database error')
    });
  }
});

// Alias for REST standards
router.delete('/messages', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const clearedCount = storage.clearCommands(userId);

    return res.json({
      success: true,
      message: 'Chat cleared. How can I help you?',
      clearedCount
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to clear chat: ' + (err.message || 'Unknown database error')
    });
  }
});

export default router;
