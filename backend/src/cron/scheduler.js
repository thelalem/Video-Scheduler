import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import { sendVideoToTelegram } from '../services/telegramServices.js';
import { getSignedDownloadUrl } from '../services/s3Service.js';

export const startScheduler = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            console.log('[SCHEDULER] Tick', { now: now.toISOString() });

            const dueVideos = await Schedule.find({
                sendAt: { $lte: now },
                sent: false,
            }).populate("user");

            const nextPending = await Schedule.findOne({ sent: false }).sort({ sendAt: 1 });
            console.log('[SCHEDULER] Pending summary', {
                dueCount: dueVideos.length,
                nextPendingSendAt: nextPending?.sendAt ? new Date(nextPending.sendAt).toISOString() : null,
                nextPendingId: nextPending?._id?.toString() || null,
            });

            for (const video of dueVideos) {
                try {
                    console.log('[SCHEDULER] Processing due video', {
                        scheduleId: video._id.toString(),
                        sendAt: new Date(video.sendAt).toISOString(),
                        telegramId: video.user?.telegramId || null,
                        hasUser: !!video.user,
                        s3Url: video.s3Url,
                    });

                    if (!video.user?.telegramId) {
                        throw new Error('Missing populated user.telegramId on schedule');
                    }

                    const isHttpUrl = /^https?:\/\//i.test(video.s3Url);
                    const deliveryUrl = isHttpUrl
                        ? video.s3Url
                        : await getSignedDownloadUrl(video.s3Url, 3600);

                    console.log('[SCHEDULER] Sending to Telegram', {
                        scheduleId: video._id.toString(),
                        telegramId: video.user.telegramId,
                        urlMode: isHttpUrl ? 'direct' : 'signed',
                    });

                    await sendVideoToTelegram(video.user.telegramId, deliveryUrl);

                    video.sent = true;
                    await video.save();

                    console.log('[SCHEDULER] Marked as sent', { scheduleId: video._id.toString() });
                } catch (error) {
                    console.error('[SCHEDULER] Error processing schedule', {
                        scheduleId: video._id?.toString(),
                        message: error.message,
                        stack: error.stack,
                    });
                }
            }
        } catch (error) {
            console.error('[SCHEDULER] Tick failed', {
                message: error.message,
                stack: error.stack,
            });
        }
    });
};