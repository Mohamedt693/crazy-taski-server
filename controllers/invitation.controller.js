import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import INVITATION_MESSAGES from "../utils/messages/invitation.messages.js";
import { getIO } from "../socket/socket.js";



const sendInvitation = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { inviteeEmail, role } = req.body; 
        const currentUserId = req.user._id.toString();

        // 1. التأكد من وجود المشروع
        const project = await Project.findById(projectId);
        if (!project) {
            return res.error(INVITATION_MESSAGES.ERROR.PROJECT_NOT_FOUND, 404);
        }

        const isOwner = project.owner.toString() === currentUserId;
        const memberInfo = project.members.find(m => m.user.toString() === currentUserId);
        const isEditor = memberInfo?.role === 'editor';
        const canMembersInvite = project.settings?.canMemberInvite;
        const hasPermission = isOwner || (isEditor && canMembersInvite);

        if (!hasPermission) {
            return res.error("You don't have permission to invite members to this project", 403);
        }

        const recipient = await User.findOne({ email: inviteeEmail.toLowerCase() });
        if (!recipient) {
            return res.error(INVITATION_MESSAGES.ERROR.USER_NOT_FOUND, 404);
        }

        if (recipient._id.toString() === currentUserId) {
            return res.error(INVITATION_MESSAGES.ERROR.SELF_INVITE, 400);
        }

        const isAlreadyMember = project.members.some(m => m.user.toString() === recipient._id.toString());
        const isProjectOwner = project.owner.toString() === recipient._id.toString();
        
        if (isAlreadyMember || isProjectOwner) {
            return res.error(INVITATION_MESSAGES.ERROR.ALREADY_MEMBER, 400);
        }

        const existingInvite = await Invitation.findOne({
            project: projectId,
            invitee: recipient._id,
            status: 'pending'
        });
        if (existingInvite) {
            return res.error(INVITATION_MESSAGES.ERROR.ALREADY_SENT, 400);
        }

        const invitation = await Invitation.create({
            project: projectId,
            inviter: req.user._id,
            invitee: recipient._id, 
            inviteeEmail: inviteeEmail.toLowerCase(),
            role: role || 'viewer' 
        });

        const newInvitation = await Invitation.findById(invitation._id)
            .populate('invitee', 'displayName avatar email')
            .populate('inviter', 'displayName avatar');

        // socket.io
        const io = getIO();
        const recipientIdStr = recipient._id.toString();

        io.to(recipientIdStr).emit("new_notification", {
            type: "INVITATION_RECEIVED",
            message: `You have been invited to join project: ${project.name}`,
            payload: {
                invitationId: newInvitation._id,
                projectName: project.name,
                inviterName: req.user.displayName,
                role: role || 'viewer'
            }
        });

        return res.success(INVITATION_MESSAGES.SUCCESS.SENT, newInvitation);

    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        const invitation = await Invitation.findOne({
            _id: invitationId,
            invitee: req.user._id,
            status: 'pending'
        });

        if (!invitation) {
            return res.error(INVITATION_MESSAGES.ERROR.NOT_FOUND, 404);
        }

        const project = await Project.findByIdAndUpdate(
            invitation.project,
            { 
                $addToSet: { members: { user: req.user._id, role: invitation.role } } 
            },
            { returnDocument: 'after' }
        );

        const io = getIO();
        io.to(invitation.inviter.toString()).emit("notification_received", {
            type: "INVITATION_ACCEPTED",
            message: `${req.user.displayName} joined your project!`
        });

        await Invitation.findByIdAndDelete(invitationId);

        return res.success(INVITATION_MESSAGES.SUCCESS.ACCEPTED, project);
    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const declineInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        const invitation = await Invitation.findOne(
            { _id: invitationId, invitee: req.user._id, status: 'pending' },
        );

        if (!invitation) {
            return res.error(INVITATION_MESSAGES.ERROR.NOT_FOUND, 404);
        }

        await Invitation.findByIdAndDelete(invitationId);

        return res.success(INVITATION_MESSAGES.SUCCESS.REJECTED);
    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const getMyInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({ 
            invitee: req.user._id, 
            status: 'pending' 
        }).populate('project', 'name description') 
          .populate('inviter', 'displayName avatar'); 

        return res.success(INVITATION_MESSAGES.SUCCESS.FETCHED, invitations);
    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const getProjectInvitations = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (project.owner.toString() !== req.user._id.toString()) {
            return res.error(INVITATION_MESSAGES.ERROR.NOT_AUTHORIZED, 403);
        }

        const invitations = await Invitation.find({ 
            project: projectId,
            status: 'pending'
        })
            .populate('invitee', 'displayName avatar email')
            .sort('-createdAt');

        return res.success(INVITATION_MESSAGES.SUCCESS.FETCHED, invitations );
    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const cancelInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        const invitation = await Invitation.findOneAndDelete({
            _id: invitationId,
            inviter: req.user._id,
            status: 'pending' 
        });

        if (!invitation) {
            return res.error(INVITATION_MESSAGES.ERROR.NOT_FOUND, 404);
        }

        return res.success("Invitation canceled successfully.");
    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const removeMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body; 

        const project = await Project.findById(projectId);
        
        if (project.owner.toString() !== req.user._id.toString()) {
            return res.error(INVITATION_MESSAGES.ERROR.NOT_AUTHORIZED, 403);
        }

        if (project.owner.toString() === userId) {
            return res.error("You cannot remove yourself as an owner.", 400);
        }

        project.members = project.members.filter(m => m.user.toString() !== userId);
        await project.save();

        return res.success("Member removed successfully.");
    } catch (error) {
        return res.error(INVITATION_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

export {
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    getMyInvitations,
    getProjectInvitations,
    cancelInvitation,
    removeMember
}