import { bot } from "../bot/telegramBot.js";

export const sendVideoToTelegram = async (chatId, videoUrl) => {
  try {
    await bot.sendVideo(chatId, videoUrl);
  } catch (error) {
    console.error(`Failed to send video to ${chatId}: ${error.message}`);
  }
};