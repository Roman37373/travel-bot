const chatMessages = {};

/**
 * Сохраняет сообщение чата
 * @param chatId
 * @param text
 * @returns {Promise<{messageIndex, created: number, stamp: number, text}>}
 */
export async function messageCreateItem(chatId, text) {
  if (!chatMessages[chatId]) {
    chatMessages[chatId] = [];
  }
  const message = {
    messageIndex: chatMessages[chatId].length,
    created: Date.now(),
    stamp: Date.now(),
    text,
  };
  chatMessages[chatId].push(message);
  return message;
}

/**
 * Сохранет ответ в существующее сообщение
 * @param chatId
 * @param messageIndex
 * @param answer
 * @returns {Promise<void>}
 */
export async function messageUpdateItem(chatId, messageIndex, answer) {
  if (chatMessages[chatId] && chatMessages[chatId][messageIndex]) {
    chatMessages[chatId][messageIndex].stamp = Date.now();
    chatMessages[chatId][messageIndex].answer = answer;
  } else {
    throw new Error(`Message is not exists`);
  }
}

/**
 * Возвращает сообщения чата
 * @param chatId
 * @returns {Promise<*|*[]>}
 */
export async function messageGetList(chatId) {
  return chatMessages.hasOwnProperty(chatId) ? chatMessages[chatId].slice() : [];
}
