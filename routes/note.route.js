import express from 'express';
import { 
    createNote,
    getProjectNotes,
    updateNote,
    deleteNote,
    getNoteById
} from '../controllers/note.controller.js';
import { protect } from '../middleware/auth.middleware.js'; 
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getProjectNotes); // GET /projects/:projectId/notes
router.get('/:noteId', getNoteById); // GET /projects/:projectId/notes/:noteId
router.post('/', createNote); // POST /projects/:projectId/notes
router.patch('/:noteId', updateNote); // PATCH /projects/:projectId/notes/:noteId
router.delete('/:noteId', deleteNote); // DELETE /projects/:projectId/notes/:noteId

export default router;