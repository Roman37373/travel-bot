const chatMessages = {};

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

export async function messageUpdateItem(chatId, messageIndex, answer) {
  if (chatMessages[chatId] && chatMessages[chatId][messageIndex]) {
    chatMessages[chatId][messageIndex].stamp = Date.now();
    chatMessages[chatId][messageIndex].answer = answer;
  } else {
    throw new Error(`Message is not exists`);
  }
}

export async function messageGetList(chatId) {
  return chatMessages.hasOwnProperty(chatId) ? chatMessages[chatId].slice() : [];
}
