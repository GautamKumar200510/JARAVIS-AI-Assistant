import { Router } from 'express';
import { authMiddleware, AuthRequest } from './auth';
import { storage, Note } from '../storage';

const router = Router();

// Get all notes for user
router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { tag, query } = req.query;

  let notes = storage.getNotesByUserId(userId);

  if (tag && typeof tag === 'string') {
    notes = notes.filter(n => n.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return res.json({ notes });
});

// Create note
router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { title, content, tags = [], pinned = false, color = 'cyan' } = req.body;

  if (!title && !content) {
    return res.status(400).json({ error: 'Title or content is required' });
  }

  const newNote: Note = {
    id: 'note_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    userId,
    title: title?.trim() || 'Untitled Note',
    content: content?.trim() || '',
    tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
    pinned: Boolean(pinned),
    color: color || 'cyan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = storage.addNote(newNote);
  return res.status(201).json({ note: created });
});

// Update note
router.put('/:id', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, content, tags, pinned, color } = req.body;

  const existing = storage.getNoteById(id, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const updates: Partial<Note> = {};
  if (title !== undefined) updates.title = title.trim() || 'Untitled Note';
  if (content !== undefined) updates.content = content.trim();
  if (tags !== undefined && Array.isArray(tags)) {
    updates.tags = tags.map((t: string) => t.trim()).filter(Boolean);
  }
  if (pinned !== undefined) updates.pinned = Boolean(pinned);
  if (color !== undefined) updates.color = color;

  const updated = storage.updateNote(id, userId, updates);
  return res.json({ note: updated });
});

// Toggle pin status
router.patch('/:id/pin', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = storage.getNoteById(id, userId);
  if (!existing) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const updated = storage.updateNote(id, userId, { pinned: !existing.pinned });
  return res.json({ note: updated });
});

// Delete note
router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const success = storage.deleteNote(id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.json({ success: true });
});

export default router;
