import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import TASK_MESSAGES from '../utils/messages/tasks.messages.js';


const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
        if (!project) return { error: TASK_MESSAGES.ERROR.PROJECT_NOT_FOUND, status: 404 };

    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.user.toString() === userId.toString());

    if (!isOwner && !isMember) {
        return { error: TASK_MESSAGES.ERROR.NOT_MEMBER, status: 403 };
    }
    return { project }; 
};

const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, project, assignedTo, dueDate } = req.body;

        if (!title) return res.error(TASK_MESSAGES.ERROR.TITLE_REQUIRED, 400);
        if (!project) return res.error(TASK_MESSAGES.ERROR.PROJECT_REQUIRED, 400);

        const access = await checkProjectAccess(project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        if (assignedTo) {
            const isMember = access.project.members.some(m => m.user.toString() === assignedTo.toString());
            const isOwner = access.project.owner.toString() === assignedTo.toString();

            if (!isMember && !isOwner) {
                return res.error("User must be a member of the project to be assigned", 403);
            }
        }

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            project,
            assignedTo: assignedTo || req.user._id,
            creator: req.user._id,
            dueDate
        });

        const newTask = await Task.findById(task._id)
            .populate('creator', 'displayName avatar _id')
            .populate('assignedTo', 'displayName avatar _id');

        return res.success(TASK_MESSAGES.SUCCESS.CREATE, newTask , 201);
    } catch (error) {
        return res.error(TASK_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        const access = await checkProjectAccess(projectId, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo creator', 'displayName avatar')
            .sort('-createdAt');

        return res.success(TASK_MESSAGES.SUCCESS.FETCH, tasks );
    } catch (error) {
        return res.error(TASK_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const getTaskwithId = async (req, res) => {
    try {
        const { TaskId } = req.params;
        const task = await Task.findById(TaskId)
            .populate('assignedTo creator', 'displayName avatar');

        if (!task) return res.error(TASK_MESSAGES.ERROR.TASK_NOT_FOUND, 404);

        const access = await checkProjectAccess(task.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        return res.success(TASK_MESSAGES.SUCCESS.FETCH, task );
    } catch (error) {
        return res.error(TASK_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const updateTask = async (req, res) => {
    try {
        const { TaskId } = req.params;
        let { assignedTo } = req.body; 
        
        const task = await Task.findById(TaskId);
        if (!task) return res.error(TASK_MESSAGES.ERROR.TASK_NOT_FOUND, 404);

        const access = await checkProjectAccess(task.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        if (!assignedTo) {
            assignedTo = req.user._id;
        } else {
            const isMember = access.project.members.some(m => m.user.toString() === assignedTo.toString());
            const isOwner = access.project.owner.toString() === assignedTo.toString();

            if (!isMember && !isOwner) {
                return res.error("Target user is not a member of this project", 403);
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(
            TaskId,
            { 
                $set: { 
                    ...req.body, 
                    assignedTo: assignedTo 
                } 
            },
            { returnDocument: 'after', runValidators: true }
        )
        .populate('creator', 'displayName avatar _id')
        .populate('assignedTo', 'displayName avatar _id');

        return res.success(TASK_MESSAGES.SUCCESS.UPDATE, updatedTask);
    } catch (error) {
        return res.error(TASK_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

const deleteTask = async (req, res) => {
    try {
        const { TaskId } = req.params;
        const task = await Task.findById(TaskId);
        if (!task) return res.error(TASK_MESSAGES.ERROR.TASK_NOT_FOUND, 404);

        const access = await checkProjectAccess(task.project, req.user._id);
        if (access.error) return res.error(access.error, access.status);

        await task.deleteOne();
        return res.success(TASK_MESSAGES.SUCCESS.DELETE);
    } catch (error) {
        return res.error(TASK_MESSAGES.ERROR.SERVER_ERROR, 500, error);
    }
};

export { 
    createTask, 
    getProjectTasks, 
    updateTask, 
    deleteTask, 
    getTaskwithId 
};