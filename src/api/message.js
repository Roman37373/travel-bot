import {mongoInsertOne, mongoUpdateOne, mongoGetList, mongoGetCount} from '../tools/mongo.js';

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
 * Сохраняет ответ в существующее сообщение
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
}

/**
 * Возвращает сообщения чата
 * @param chatId
 * @param limit
 * @returns {Promise<*|*[]>}
 */
export async function messageGetList(chatId, limit = 5) {
  return await mongoGetList('message', {chatId}, {stamp: -1}, limit);
}

/**
 * Возвращает количество сообщений для чата с возможностью указать интервал времени
 * @param chatId
 * @param hour
 * @returns {Promise<*>}
 */
export async function messageGetCountMessage(chatId, hour = 0) {
  const filter = {chatId};
  if (hour > 0) {
    filter.created = {
      $gt: Date.now() - (hour * 60 * 60e3),
    };
  }
  return await mongoGetCount('message', filter);
}