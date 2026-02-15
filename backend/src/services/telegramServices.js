import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });


bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString();
    try {
        const existingUser = await User.findOne({ telegramId: chatId });
        if (!existingUser) {
            await User.create({
                telegramId: chatId,
                username: msg.chat.username,
                firstName: msg.chat.first_name,
            });
            console.log(`New user registered: ${chatId}`);
            bot.sendMessage(chatId, 'You are now connected to the Video Scheduler Bot! You can schedule videos to be sent to you at specific times.');
        }
    } catch (error) {
        console.error(`User registration error ${chatId}: ${error.message}`);
    }
});

export const sendVideoToTelegram = async (chatId, videoUrl) => {
    await bot.sendVideo(chatId, videoUrl);
};