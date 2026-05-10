import express from 'express';
import { 
    getMembers, 
    getMemberById, 
    updateMemberRole, 
    removeMember, 
    leaveProject 
} from '../controllers/member.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getMembers);
router.delete('/leave', leaveProject);
router.get('/:userId', getMemberById);
router.patch('/role', updateMemberRole);
router.delete('/:userId', removeMember);

export default router;