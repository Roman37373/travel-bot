import path from 'node:path';
import fs from 'node:fs/promises';
import TelegramBot from 'node-telegram-bot-api';
import {chatCreateItem, chatGetItem} from './api/chat.js';
import {messageCreateItem, messageGetList, messageUpdateItem} from './api/message.js';
import {assistantProcess} from './api/assistant.js';
import {TELEGRAM_TOKEN} from './config.js';


const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: false,
  webHook: false,
});

let systemPrompt = '';

////

async function onPollingError(error) {
  console.log('polling_error', error.code);
}

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
      content: systemPrompt,
    },
  ];
  for (const message of oldMessages) {
    if (!(message.text && message.answer && !message.error)) {
      continue;
    }
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

  const [answer, waitMessage] = await Promise.all([
    assistantProcess(messages),
    bot.sendMessage(chat._id, '🤔 Дайте подумать...'),
  ]);
  if (waitMessage && waitMessage.message_id) {
    await bot.deleteMessage(chat._id, waitMessage.message_id);
  }

  await Promise.all([
    messageUpdateItem(chat._id, message.messageIndex, answer),
    bot.sendMessage(chat._id, answer),
  ]);
}

////

async function bootstrap() {
  systemPrompt = await fs.readFile(path.join(import.meta.dirname, '..', 'data', 'prompt.md'), 'utf8');
  bot.on('polling_error', onPollingError);
  bot.on('message', onMessage);
  await bot.startPolling({restart: true});
}

bootstrap()
  .then((res) => res && console.log(res))
  .catch((err) => err && console.log(err));
