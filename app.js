import express from 'express';
import { createServer } from 'http'; 
import 'dotenv/config'; 
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import './config/passport.js'; 
import cookieParser from 'cookie-parser';
// middleware
import { responseHandler } from './middleware/auth.middleware.js';
// Routes
import authRoutes from './routes/auth.route.js';
import projectRoutes from './routes/project.route.js'
import taskRoutes from './routes/task.route.js'
import noteRoutes from './routes/note.route.js'
import reminderRoutes from './routes/reminder.route.js'
import eventsRoutes from './routes/calender.route.js'
import invitationRoutes from './routes/invitation.route.js'
import memberRoutes from './routes/member.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
// cron jobs
import startReminderJob from './utils/jobs/reminderJob.js';
// socket.io
import { initSocket } from './socket/socket.js';

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// Middlewares
app.use(express.json());
app.use(responseHandler);
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true 
}));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/notes', noteRoutes);
app.use('/api/projects/:projectId/reminders', reminderRoutes);
app.use('/api/projects/:projectId/events', eventsRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/projects/:projectId/invitations', invitationRoutes);
app.use('/api/projects/:projectId/members', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);

// MongoDB Connection
const url = process.env.MONGO_URI;
mongoose.connect(url)
    .then(() => {
        console.log('✅ Connected to MongoDB (Crazy Taski DB)');
        
        startReminderJob(); 
        
        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server & Socket running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err);
        process.exit(1); 
    });