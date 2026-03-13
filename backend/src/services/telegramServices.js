import { bot } from "../bot/telegramBot.js";

export const sendVideoToTelegram = async (chatId, videoUrl) => {
  try {
    if (!bot) {
      throw new Error("Telegram bot is not initialized");
    }
    await bot.sendVideo(chatId, videoUrl);
  } catch (error) {
    console.error(`Failed to send video to ${chatId}: ${error.message}`);
    throw error;
  }
};