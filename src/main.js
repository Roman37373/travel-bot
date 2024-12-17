import TelegramBot from 'node-telegram-bot-api';
import {TELEGRAM_TOKEN} from './config.js';


const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
bot.on('message', onMessage);


async function onMessage({chat, from, text}) {
  await bot.sendMessage(chat.id, 'Access denied');
}
