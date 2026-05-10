import express from 'express';
import {
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    getMyInvitations,
    getProjectInvitations,
    cancelInvitation,
    removeMember
} from '../controllers/invitation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post('/', sendInvitation); 
router.get('/', getProjectInvitations); 
router.delete('/:invitationId', cancelInvitation); 
router.patch('/remove-member', removeMember); 

router.get('/my-invitations', getMyInvitations); 
router.patch('/:invitationId/accept', acceptInvitation);
router.patch('/:invitationId/decline', declineInvitation);

export default router;