import express from 'express';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try{
        const {s3Url, chatId, sendAt} = req.body;
        if (!s3Url || !chatId || !sendAt) {
            return res.status(400).json({
                message: "s3Url, chatId, and sendAt are required",
            });
        }
        const user = await User.findOne({ telegramId: "123456789" }); // test user
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
    }
});

export default router


