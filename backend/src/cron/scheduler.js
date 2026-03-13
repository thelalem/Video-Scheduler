import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import { sendVideoToTelegram } from '../services/telegramServices.js';
import { getSignedDownloadUrl } from '../services/s3Service.js';

export const startScheduler = () => {
    cron.schedule('* * * * *', async () => {
        console.log('Checking for scheduled videos to send...');

        const now = new Date();
        const dueVideos = await Schedule.find({
            sendAt: { $lte: now },
            sent: false,
        }).populate("user"); // ✅ this populates the user document

        for (const video of dueVideos) {
            try {
                const isHttpUrl = /^https?:\/\//i.test(video.s3Url);
                const deliveryUrl = isHttpUrl
                    ? video.s3Url
                    : await getSignedDownloadUrl(video.s3Url, 3600);

                await sendVideoToTelegram(video.user.telegramId, deliveryUrl);

                video.sent = true;
                await video.save();

                console.log(`Marked as sent: ${video._id}`);
            } catch (error) {
                console.error(`Error processing schedule ${video._id}: ${error.message}`);  
            }
        }
    });
};