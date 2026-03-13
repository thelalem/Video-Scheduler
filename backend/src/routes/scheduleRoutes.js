import express from 'express';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try{
        const {s3Url, sendAt, connectToken} = req.body;
        if (!s3Url || !sendAt || !connectToken) {
            return res.status(400).json({
                message: "s3Url, sendAt, and connectToken are required",
            });
        }
        const user = await User.findOne({ connectToken }); // test user

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
    }
});

export default router