import TelegramBot from 'node-telegram-bot-api'; // Библиотека для работы с Telegram
import {chatCreateItem, chatGetItem} from './api/chat.js';  // Модуль для работы с чатом
import {messageCreateItem, messageGetList, messageUpdateItem} from './api/message.js'; // Модуль для работы с сообщением
import {initMongo} from './tools/mongo.js';
import {assistantProcess, initAssistant} from './api/assistant.js';  // Модуль для работы с ассистентом LLM
import {TELEGRAM_TOKEN} from './config.js'; // Файл конфигурации


if(!TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN is required');
}

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: false,
  webHook: false,
});

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

  // Подгружаем старые сообщения чата
  const oldMessages = await messageGetList(chat._id);

  // Ограничиваем возможность задавать вопросы пользователем до получения ответа от нейронки
  if (oldMessages.length && !oldMessages[0].answer) {
    await bot.sendMessage(chat._id, '🤔 Подождите, я еще думаю...');
    return;
  }

  // Создаем новое сообщение для чата
  const message = await messageCreateItem(chat._id, msg.text);

  // Создаем контекст сообщений чата
  const messages = [];
  let i = oldMessages.length;
  while (i--) {
    const message = oldMessages[i];
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

  const [
    answer,
    waitMessage,
  ] = await Promise.all([
    assistantProcess('vsegpt', messages), // Отправляем контекст и ждем ответ
    bot.sendMessage(chat._id, '🤔 Дайте подумать...'), // Отправляем пользователю сообщение заглушку
  ]);
  if (waitMessage && waitMessage.message_id) {
    await bot.deleteMessage(chat._id, waitMessage.message_id); // удаляем сообщени заглушку
  }

  await Promise.all([
    messageUpdateItem(message._id, answer), // Сохраняем ответ
    bot.sendMessage(chat._id, answer), // Отправляем ответ пользователю
  ]);
}

/**
 * Основная функция запуска программы
 * @returns {Promise<void>}
 */
async function bootstrap() {
  //
  await initMongo();

  // Подготавливаем к работе ассистента
  await initAssistant();

  // Устанавливаем обработчики и запускаем соединение с Telegram
  bot.on('polling_error', onPollingError);
  bot.on('message', onMessage);
  await bot.startPolling({restart: true});
}

// Запуск программы
bootstrap()
  .then((res) => res && console.log(res))
  .catch((err) => err && console.log(err));
