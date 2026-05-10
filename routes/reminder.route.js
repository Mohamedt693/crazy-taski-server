import express from 'express';
import { 
    createReminder,
    getProjectReminders,
    updateReminder,
    deleteReminder,
    getReminderById
} from '../controllers/reminder.controller.js';
import { protect } from '../middleware/auth.middleware.js'; 
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getProjectReminders); // GET /projects/:projectId/reminders
router.get('/:reminderId', getReminderById); // GET /projects/:projectId/reminders/:reminderId
router.post('/', createReminder); // POST /projects/:projectId/reminders
router.patch('/:reminderId', updateReminder); // PATCH /projects/:projectId/reminders/:reminderId
router.delete('/:reminderId', deleteReminder); // DELETE /projects/:projectId/reminders/:reminderId


export default router;