import express from "express";
import User from "../models/User.js"; // ✅ import the User model

const router = express.Router();

router.get("/telegram-status/:token", async (req, res) => {
  const user = await User.findOne({ connectToken: req.params.token });
  res.json({ connected: !!user?.telegramId, user });
});

export default router;