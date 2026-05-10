import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Note from "../models/note.model.js";
import Reminder from "../models/reminder.model.js";

export const getHomeData = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalPendingTasks = await Task.countDocuments({ 
            assignedTo: userId, 
            status: { $ne: 'completed' } 
        });

        const activeProjectsCount = await Project.countDocuments({
            $or: [{ owner: userId }, { "members.user": userId }]
        });

        const remindersCount = await Reminder.countDocuments({ 
            status: 'pending',
            creator: userId 
        });

        const notesCount = await Note.countDocuments({ 
            creator: userId 
        });


        const focusTasks = await Task.find({
            assignedTo: userId,
            priority: 'urgent', 
            status: { $ne: 'done' } 
        })
        .limit(3) 
        .populate('project', 'name') 
        .sort('-createdAt'); 


        const recentProjectsRaw = await Project.find({
            $or: [{ owner: userId }, { "members.user": userId }]
        })
        .sort('-updatedAt')
        .limit(3)
        .lean(); 

        const recentProjects = [];
        
        for (const project of recentProjectsRaw) {

            const totalTasks = await Task.countDocuments({ project: project._id });
            
            const completedTasks = await Task.countDocuments({ 
                project: project._id, 
                status: 'done' 
            });

            let progressPercentage = 0;
            if (totalTasks > 0) {
                progressPercentage = Math.round((completedTasks / totalTasks) * 100);
            }

            recentProjects.push({
                _id: project._id,           
                name: project.name,          
                tasksCount: totalTasks,      
                progress: progressPercentage 
            });
        }

        const quickNotes = await Note.find({ creator: userId })
            .select('content')
            .sort('-createdAt')
            .limit(3);

        const reminders = await Reminder.find({ 
            creator: userId,
            status: 'pending' 
        })
        .select('title remindAt')
        .sort('-createdAt')
        .limit(3);


        return res.success("Dashboard data loaded successfully", {
            stats: [
                { 
                    title: "Active Tasks", 
                    value: totalPendingTasks.toString().padStart(2, '0'), 
                    sub: "Pending completion", 
                    color: "bg-[#8EB8F9]" 
                },
                { 
                    title: "My Projects", 
                    value: activeProjectsCount.toString().padStart(2, '0'), 
                    sub: "Active workspaces", 
                    color: "bg-[#A6C8FF]" 
                },
                { 
                    title: "Reminders", 
                    value: remindersCount.toString().padStart(2, '0'), 
                    sub: remindersCount > 0 ? `${remindersCount} upcoming` : "No reminders", 
                    color: "bg-[#F7C9A8]" 
                },
                { 
                    title: "Total Notes", 
                    value: notesCount.toString().padStart(2, '0'), 
                    sub: "Quick captures", 
                    color: "bg-[#C8D9A6]" 
                }
            ],
            focusTasks: focusTasks,
            recentProjects: recentProjects,
            quickNotes: quickNotes,
            reminders: reminders
        });

    } catch (error) {
        return res.error(error.message, 500);
    }
};