import express from 'express';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try{
        const {s3Url, sendAt, telegramID} = req.body;
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
        const newSchedule = await Schedule.create({
            s3Url,
            user: user._id,
            sendAt: new Date(sendAt),
        });


    res.status(201).json({
        message: "Video scheduled successfully",
        schedule: newSchedule,
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