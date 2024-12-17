import TelegramBot from 'node-telegram-bot-api';
import {TELEGRAM_TOKEN} from './config.js';
import {chatCreateItem, chatGetItem} from './chat.js';
import {messageCreateItem, messageGetList, messageUpdateItem} from './message.js';
import {assistantProcess} from './assistant.js';


const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
bot.on('message', onMessage);

async function onMessage(msg) {
  if (!msg?.chat?.id || !msg?.text) {
    return;
  }

  let chat = await chatGetItem(msg.chat.id);
  if (!chat) {
    chat = await chatCreateItem(msg.chat).catch(err => {
      console.error(err);
    });
  }
  if (!chat?.active) {
    await bot.sendMessage(chat._id, 'Access denied');
    return;
  }

  const oldMessages = await messageGetList(chat._id);
  const message = await messageCreateItem(chat._id, msg.text);

  const messages = [
    {
      role: 'system',
      content: 'Промпт',
    },
  ];
  for (const message of oldMessages) {
    messages.push({
      role: 'user',
      content: message.text,
    });
    messages.push({
      role: 'assistant',
      content: message.answer,
    });
  }
  messages.push({
    role: 'user',
    content: msg.text,
  });

  const answer = await assistantProcess(messages);

  await messageUpdateItem(chat._id, message.messageIndex, answer);
  await bot.sendMessage(chat._id, answer);
}
