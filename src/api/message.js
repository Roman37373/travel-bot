import {mongoInsertOne, mongoUpdateOne, mongoGetList} from '../tools/mongo.js';

/**
 * Сохраняет сообщение чата
 * @param chatId
 * @param text
 * @returns {Promise<{messageIndex, created: number, stamp: number, text}>}
 */
export async function messageCreateItem(chatId, text) {
  const $set = {
    created: Date.now(),
    stamp: Date.now(),
    chatId,
    text,
  };
  const res = await mongoInsertOne('message', $set);
  if (res?.insertedId) {
    $set._id = res.insertedId;
    return $set;
  }
}

/**
 * Сохранет ответ в существующее сообщение
 * @param _id
 * @param answer
 * @returns {Promise<void>}
 */
export async function messageUpdateItem(_id, answer) {
  const $set = {
    stamp: Date.now(),
    answer: answer,
  };
  await mongoUpdateOne('message', {_id}, $set);
  // chatMessages[chatId][messageIndex].stamp = Date.now();
  // chatMessages[chatId][messageIndex].answer = answer;
}

/**
 * Возвращает сообщения чата
 * @param chatId
 * @returns {Promise<*|*[]>}
 */
export async function messageGetList(chatId) {
  return await mongoGetList('message', {chatId}, {stamp: -1}, 3);
}
