import TelegramBot from 'node-telegram-bot-api'; // Библиотека для работы с Telegram
import {initMongo} from './tools/mongo.js'; // Модуль для работы с базой данных
import {chatCreateItem, chatGetItem} from './api/chat.js';  // Модуль для работы с чатом
import {messageCreateItem, messageGetCountMessage, messageGetList, messageUpdateItem} from './api/message.js'; // Модуль для работы с сообщением
import {assistantProcess, initAssistant} from './api/assistant.js';  // Модуль для работы с ассистентом LLM
import {TELEGRAM_TOKEN} from './config.js'; // Файл конфигурации


if(!TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN is required');
}

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: false,
  webHook: false,
});

const iconError            = '⚠️ ';
const iconStartMessage     = '👋 ';
const iconAssistantProcess = '🤔 ';

const labelErrorAccessDenied = '_Доступ запрещен_';
const labelErrorAccessLimit  = '_Превышен лимит сообщений_';
const labelErrorBadCommand   = '_Команда не существует!_';

const labelMessageStart     = 'Здравствуйте, я готов помочь Вам выбрать место для проведения досуга. Напишите, пожалуйста, где Вы находитесь и чем бы хотели заняться';
const labelMessageAwait     = '_Дайте подумать..._';
const labelMessageInProcess = '_Подождите, я еще думаю..._';

/**
 * Обработка ошибок Telegram
 * @param error
 * @returns {Promise<void>}
 */
async function onPollingError(error) {
  console.log('polling_error', error.code);
}

/**
 * Отправка сообщений Пользователю
 * @param chatId
 * @param text
 * @returns {Promise<*>}
 */
async function sendMessage(chatId, text) {
  return await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
  });
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
    await sendMessage(chat._id, iconError + labelErrorAccessDenied);
    return;
  }

  // Проверяем является ли сообщение командой
  if (msg.text[0] === '/') {
    // Возвращаем "Hello Message"
    if (msg.text.indexOf('/start') === 0) {
      await sendMessage(chat._id, iconStartMessage + labelMessageStart);
      return;
    }

    // Возвращаем ошибку если команда не существует
    await sendMessage(chat._id, iconError + labelErrorBadCommand);
    return;
  }

  // Получаем кол-во сообщений пользователя за указанный интервал, если сообщений больше лимита - отправляем ошибку
  if (!chat.admin) {
    const chatLastMessagesCount = await messageGetCountMessage(chat._id, 1 / 6);
    if (chatLastMessagesCount > 5) {
      await sendMessage(chat._id, iconError + labelErrorAccessLimit);
      return;
    }
  }

  // Получаем заданное количество последних сообщений
  const oldMessages = await messageGetList(chat._id, 10);

  // Ограничиваем возможность задавать вопросы пользователем до получения ответа от нейронки
  if (!chat.admin) {
    if (oldMessages.length && !oldMessages[0].answer) {
      await sendMessage(chat._id, iconAssistantProcess + labelMessageInProcess);
      return;
    }
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
    assistantProcess('openai/gpt-4o-mini', messages), // Отправляем контекст и ждем ответ
    sendMessage(chat._id, iconAssistantProcess + labelMessageAwait), // Отправляем пользователю сообщение заглушку
  ]);
  if (waitMessage && waitMessage.message_id) {
    await bot.deleteMessage(chat._id, waitMessage.message_id); // удаляем сообщение заглушку
  }

  await Promise.all([
    messageUpdateItem(message._id, answer), // Сохраняем ответ
    sendMessage(chat._id, answer), // Отправляем ответ пользователю
  ]);
}

/**
 * Основная функция запуска программы
 * @returns {Promise<void>}
 */
async function bootstrap() {
  // Подготавливаем к работе базу данных
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
