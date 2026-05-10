import cron from 'node-cron';
import Reminder from '../../models/reminder.model.js';
import sendEmail from '../functions/sendEmail.js';

const startReminderJob = () => {
    // التكرار كل دقيقة (النجوم الخمسة تعني: كل دقيقة، كل ساعة، كل يوم...)
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            const pendingReminders = await Reminder.find({
                remindAt: { $lte: now },
                status: 'pending'
            }).populate('creator assignedTo', 'email displayName');

            if (pendingReminders.length === 0) return;

            console.log(`[Cron Job] Found ${pendingReminders.length} reminders to send.`);

            for (const reminder of pendingReminders) {
                const recipient = reminder.assignedTo || reminder.creator;

                try {

                    await Reminder.findByIdAndUpdate(
                        reminder._id, 
                        { $set: { status: 'sent' } },
                        { new: true } 
                    );

                    await sendEmail({
                        email: recipient.email,
                        subject: `🔔 Reminder: ${reminder.title}`,
                        message: `Hello ${recipient.displayName},\n\nThis is a reminder for your task: "${reminder.title}" in Crazy Taski.\n\nStay productive!`
                    });
                    
                } catch (emailError) {
                    console.error(`Failed to send email for reminder ${reminder._id}:`, emailError);
                }
            }
        } catch (error) {
            console.error('Error in Reminder Cron Job:', error);
        }
    });
};

export default startReminderJob;