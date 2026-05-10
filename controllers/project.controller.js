import Project from '../models/project.model.js';
import PROJECT_MESSAGES from '../utils/messages/projects.messages.js';

const createProject = async (req, res) => {
    try {
        const { name, description, settings } = req.body;

        if (!name) {
            return res.error(PROJECT_MESSAGES.ERROR.NAME_REQUIRED, 400);
        }

        const newProject = await Project.create({
            name,
            description,
            settings,
            owner: req.user._id,
        });

        return res.success(PROJECT_MESSAGES.SUCCESS.CREATE, newProject, 201);
    } catch (error) {
        return res.error(error.message, 400);
    }
};

const getProjects = async (req, res) => {
    try {
        const userId = req.user._id;

        const allProjects = await Project.find({
            $or: [
                { owner: userId },
                { "members.user": userId }
            ]
        }).populate('owner', 'displayName avatar email')
        .populate('members.user', 'displayName avatar email') 
        .sort({ createdAt: -1 });

        const ownedProjects = allProjects.filter(p => p.owner._id.toString() === userId.toString());
        const joinedProjects = allProjects.filter(p => p.owner._id.toString() !== userId.toString());

        return res.success("Projects fetched successfully", {
            ownedProjects,
            joinedProjects
        });
    } catch (error) {
        return res.error("Server Error", 500, error.message);
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'displayName avatar email')
            .populate('members.user', 'displayName avatar email');

        if (!project) {
            return res.error(PROJECT_MESSAGES.ERROR.NOT_FOUND, 404);
        }

        const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
        const isOwner = project.owner._id.toString() === req.user._id.toString();

        if (!isOwner && !isMember && !project.settings.isPublic) {
            return res.error(PROJECT_MESSAGES.ERROR.UNAUTHORIZED, 403);
        }

        return res.success(PROJECT_MESSAGES.SUCCESS.DETAIL, project);
    } catch (error) {
        return res.error(error.message, 500);
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.error(PROJECT_MESSAGES.ERROR.NOT_FOUND, 404);
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.error(PROJECT_MESSAGES.ERROR.UNAUTHORIZED, 403);
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { returnDocument: 'after', runValidators: true }
        );

        return res.success(PROJECT_MESSAGES.SUCCESS.UPDATE, updatedProject);
    } catch (error) {
        return res.error(error.message, 400);
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.error(PROJECT_MESSAGES.ERROR.NOT_FOUND, 404);
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.error(PROJECT_MESSAGES.ERROR.UNAUTHORIZED, 403);
        }

        await project.deleteOne();
        return res.success(PROJECT_MESSAGES.SUCCESS.DELETE);
    } catch (error) {
        return res.error(error.message, 500);
    }
};

export { createProject, getProjects, getProjectById, updateProject, deleteProject};