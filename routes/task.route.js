import express from 'express';
import { 
    createTask, 
    getProjectTasks, 
    updateTask, 
    deleteTask, 
    getTaskwithId
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });


router.use(protect);



router.get('/', getProjectTasks); // GET /projects/:projectId/tasks
router.get('/:TaskId', getTaskwithId); // GET /projects/:projectId/tasks/:taskId
router.post('/', createTask); // POST /projects/:projectId/tasks
router.patch('/:TaskId', updateTask); // PATCH /projects/:projectId/tasks/:taskId
router.delete('/:TaskId', deleteTask); // DELETE /projects/:projectId/tasks/:taskId

export default router;