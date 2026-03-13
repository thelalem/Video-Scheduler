import TelegramBot from "node-telegram-bot-api";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export let bot = null;

export const startTelegramBot = () => {
    if (bot) {
        return bot;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }

    bot = new TelegramBot(token, { polling: true });
    console.log("Telegram bot started");

    bot.onText(/\/start (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const username = msg.chat.username;
        const firstName = msg.chat.first_name;
        const connectToken = match[1];

        try {
            let user = await User.findOne({ telegramId: chatId });

            if (user) {
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

            await bot.sendMessage(chatId, "Your Telegram account has been connected.");
            console.log(`User ${firstName} @${username} (${chatId}) connected with token: ${connectToken}`);
        } catch (error) {
            console.error("Telegram connection error:", error.message);
            await bot.sendMessage(chatId, "Failed to connect. Try again.");
        }
    });

    return bot;
};
