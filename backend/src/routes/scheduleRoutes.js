import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    res.send('Schedule endpoint');
    // Handle schedule creation logic
});

export default router