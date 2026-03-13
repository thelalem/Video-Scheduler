import TelegramBot from "node-telegram-bot-api";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log("🤖 Telegram bot started...");

// Handle /start <token>
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;
  const firstName = msg.chat.first_name;
  const connectToken = match[1];

  try {
        // 1️⃣ Try to find by token
        let user = await User.findOne({ telegramId: chatId });

        if (user) {
            // Update existing user
            user.connectToken = connectToken;
            user.username = username;
            user.firstName = firstName;
            user.connectedAt = new Date();
            await user.save();
        } else {
            await User.create({
              connectToken,
              telegramId: chatId,
              username,
              firstName,
              connectedAt: new Date(),
            });
        }


        bot.sendMessage(chatId, "✅ Your Telegram account has been connected!");
        console.log(`✅ User ${firstName} @${username} (${chatId}) connected with token: ${connectToken}`);
    } catch (error) {
        console.error("Telegram connection error:", error.message);
        bot.sendMessage(chatId, "❌ Failed to connect. Try again.");
    }
});
