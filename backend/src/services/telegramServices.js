import { bot } from "../bot/telegramBot.js";

export const sendVideoToTelegram = async (chatId, videoUrl) => {
  try {
    if (!bot) {
      throw new Error("Telegram bot is not initialized");
    }
    console.log("[TELEGRAM] sendVideo called", { chatId });
    await bot.sendVideo(chatId, videoUrl);
    console.log("[TELEGRAM] sendVideo success", { chatId });
  } catch (error) {
    console.error("[TELEGRAM] sendVideo failed", {
      chatId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};