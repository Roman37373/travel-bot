import path from 'node:path';  // Библиотека для работы с путями
import fs from 'node:fs/promises';  // Библиотека для работы с файловой системой
import TelegramBot from 'node-telegram-bot-api'; // Библиотека для работы с телеграммом
import {chatCreateItem, chatGetItem} from './api/chat.js';  // Модуль для работы с чатом
import {messageCreateItem, messageGetList, messageUpdateItem} from './api/message.js'; // Модуль для работы с сообщением
import {assistantProcess} from './api/assistant.js';  // Модуль для работы с асистонтом LLM
import {TELEGRAM_TOKEN} from './config.js'; // Файл конфигурации


if(!TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN is required');
}

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: false,
  webHook: false,
});
let systemPrompt = '';

/**
 * Обработка ошибок Telegram
 * @param error
 * @returns {Promise<void>}
 */
async function onPollingError(error) {
  console.log('polling_error', error.code);
}

/**
 * Обработка сообщений Telegram
 * @param msg
 * @returns {Promise<void>}
 */
async function onMessage(msg) {
  if (!msg?.chat?.id || !msg?.text) {
    return;
  }

  //  Подгружаем чат
  let chat = await chatGetItem(msg.chat.id);

  // Возвращаем ошибку если чат не найден
  if (!chat) {
    chat = await chatCreateItem(msg.chat).catch(err => {
      console.error(err);
    });
  }

  // Возвращаем ошибку если чат деактивирован
  if (!chat?.active) {
    await bot.sendMessage(chat._id, 'Access denied');
    return;
  }

  // Подгружаем старые собщения чата
  const oldMessages = await messageGetList(chat._id);

  // Создаем новое сообщение для чата
  const message = await messageCreateItem(chat._id, msg.text);

  // Создаем контекст сообщений чата
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
    assistantProcess('vsegpt', messages), // Отправляем контекст и ждем ответ
    bot.sendMessage(chat._id, '🤔 Дайте подумать...'), // Отправляем пользователю сообщение заглушку
  ]);
  if (waitMessage && waitMessage.message_id) {
    await bot.deleteMessage(chat._id, waitMessage.message_id); // удаляем сообщени заглушку
  }

  await Promise.all([
    messageUpdateItem(chat._id, message.messageIndex, answer), // Сохраняем ответ
    bot.sendMessage(chat._id, answer), // Отправляем ответ пользователю
  ]);
}

/**
 * Основная функция запуска программы
 * @returns {Promise<void>}
 */
async function bootstrap() {
  // Подгружаем промт из файла
  systemPrompt = await fs.readFile(path.join(import.meta.dirname, '..', 'data', 'prompt.md'), 'utf8');

  // устанавливаем обработчики и запускаем соединение с Telegram
  bot.on('polling_error', onPollingError);
  bot.on('message', onMessage);
  await bot.startPolling({restart: true});
}

// Запуск программы
bootstrap()
  .then((res) => res && console.log(res))
  .catch((err) => err && console.log(err));
