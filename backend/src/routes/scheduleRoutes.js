import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    res.send('Schedule endpoint');
    // Handle schedule creation logic
});

export default router

// able to verify any banks generated qr code on the reciept
// check date with current date to see if its valid
//decentralized verification system for qr codes
bvbvb