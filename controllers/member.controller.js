import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Note from "../models/note.model.js";
import MEMBER_MESSAGES from "../utils/messages/member.messages.js";


const cleanUserAssignments = async (projectId, userId) => {
    await Task.updateMany(
        { project: projectId, assignedTo: userId },
        { $set: { assignedTo: null } }
    );

    await Note.updateMany(
        { project: projectId, assignedTo: userId }, 
        { $set: { assignedTo: null } }
    );
};

const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return { error: MEMBER_MESSAGES.ERROR.PROJECT_NOT_FOUND, status: 404 };

    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.user.toString() === userId.toString());

    if (!isOwner && !isMember) {
        return { error: MEMBER_MESSAGES.ERROR.NOT_AUTHORIZED, status: 403 };
    }
    return { project, isOwner, isMember };
};

const getMembers = async (req, res) => {
    try {
        const { projectId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const project = await Project.findById(projectId)
            .populate('owner', 'displayName avatar email')
            .populate('members.user', 'displayName avatar email')
            .select('members owner');

        return res.success(MEMBER_MESSAGES.SUCCESS.FETCHED, {
            members: project.members,
            owner: project.owner
        });
    } catch (error) {
        return res.error(MEMBER_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const getMemberById = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const project = await Project.findById(projectId)
            .populate('members.user', 'displayName avatar email');

        const member = project.members.find(m => m.user?._id.toString() === userId);
        if (!member) return res.error(MEMBER_MESSAGES.ERROR.NOT_FOUND, 404);

        return res.success(MEMBER_MESSAGES.SUCCESS.DETAIL, member);
    } catch (error) {
        return res.error(MEMBER_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const updateMemberRole = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, newRole } = req.body;

        if (!newRole) return res.error(MEMBER_MESSAGES.ERROR.ROLE_REQUIRED, 400);

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        if (!access.isOwner) return res.error(MEMBER_MESSAGES.ERROR.NOT_AUTHORIZED, 403);

        const project = access.project;
        const member = project.members.find(m => m.user.toString() === userId);
        if (!member) return res.error(MEMBER_MESSAGES.ERROR.NOT_FOUND, 404);

        member.role = newRole;
        await project.save();

        return res.success(MEMBER_MESSAGES.SUCCESS.ROLE_UPDATED, member);
    } catch (error) {
        return res.error(MEMBER_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const removeMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        if (!access.isOwner) return res.error(MEMBER_MESSAGES.ERROR.NOT_AUTHORIZED, 403);

        if (userId === req.user._id.toString()) {
            return res.error(MEMBER_MESSAGES.ERROR.OWNER_CANNOT_REMOVE_SELF, 400);
        }

        const project = access.project;
        project.members = project.members.filter(m => m.user.toString() !== userId);

        await cleanUserAssignments(projectId, userId);
        await project.save();

        return res.success(MEMBER_MESSAGES.SUCCESS.REMOVED);
    } catch (error) {
        return res.error(MEMBER_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

const leaveProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const access = await checkProjectAccess(projectId, userId);
        if (access.error) return res.error(access.error, access.status);

        if (access.isOwner) {
            return res.error(MEMBER_MESSAGES.ERROR.OWNER_CANNOT_LEAVE, 400);
        }

        const project = access.project;
        project.members = project.members.filter(m => m.user.toString() !== userId.toString());

        await cleanUserAssignments(projectId, userId);
        await project.save();

        return res.success(MEMBER_MESSAGES.SUCCESS.LEFT);
    } catch (error) {
        return res.error(MEMBER_MESSAGES.ERROR.SERVER_ERROR, 500, error.message);
    }
};

export {
    getMembers,
    getMemberById,
    updateMemberRole,
    removeMember,
    leaveProject
};