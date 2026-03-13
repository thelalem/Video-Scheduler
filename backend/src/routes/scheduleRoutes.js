import express from 'express';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try{
        const {s3Url, sendAt, telegramID, clientTimeZone} = req.body;
        const missingFields = [];
        if (!s3Url) missingFields.push('s3Url');
        if (!sendAt) missingFields.push('sendAt');
        if (!telegramID) missingFields.push('telegramID');

        if (missingFields.length > 0) {
            return res.status(400).json({
            message: `Missing required field(s): ${missingFields.join(', ')}`,
            });
        }
        const user = await User.findOne({ telegramId: telegramID });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Require timezone-aware timestamp (must include Z or an offset like +02:00)
        if (typeof sendAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(sendAt)) {
            return res.status(400).json({
                message: 'sendAt must be an ISO 8601 timestamp with timezone offset',
            });
        }

        const parsedSendAt = new Date(sendAt);
        if (Number.isNaN(parsedSendAt.getTime())) {
            return res.status(400).json({
                message: 'Invalid sendAt value',
            });
        }

        const now = new Date();
        if (parsedSendAt <= now) {
            return res.status(400).json({
                message: 'Earlier time is not allowed. Please select a future time.',
                serverNowUtc: now.toISOString(),
                normalizedSendAtUtc: parsedSendAt.toISOString(),
            });
        }

        console.log('[SCHEDULE] Create request', {
            telegramID,
            s3Url,
            rawSendAt: sendAt,
            parsedSendAtUtc: parsedSendAt.toISOString(),
            clientTimeZone: clientTimeZone || null,
            serverNowUtc: new Date().toISOString(),
        });

        const newSchedule = await Schedule.create({
            s3Url,
            user: user._id,
            sendAt: parsedSendAt,
        });


    res.status(201).json({
        message: "Video scheduled successfully",
        schedule: newSchedule,
        normalizedSendAtUtc: parsedSendAt.toISOString(),
        });
    }catch (error) {
        res.status(500).json({
            message: "Failed to schedule video",
            error: error.message,
        });
        console.error("Error scheduling video:", error);
    }
});

export default router