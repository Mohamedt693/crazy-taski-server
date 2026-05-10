import express from 'express';
import {
    createEvent,
    getMyEvents,
    getEventById,
    updateEvent, 
    deleteEvent
} from '../controllers/calendar.controller.js';
import { protect } from '../middleware/auth.middleware.js'; 
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getMyEvents); // GET /projects/:projectId/events
router.get('/:eventId', getEventById); // GET /projects/:projectId/events/:eventId
router.post('/', createEvent); // POST /projects/:projectId/events
router.patch('/:eventId', updateEvent); // PATCH /projects/:projectId/events/:eventId
router.delete('/:eventId', deleteEvent); // DELETE /projects/:projectId/events/:eventId

export default router;