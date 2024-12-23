import {mongoFindOne, mongoInsertOne, mongoUpdateOne} from '../tools/mongo.js';

/**
 * Возврщает данные чата
 * @param _id
 * @returns {Promise<*>}
 */
export async function chatGetItem(_id) {
  return await mongoFindOne('chat', {_id});
  // return chatData[_id];
}

/**
 * Сохраняет данные чата
 * @param data
 * @returns {Promise<*>}
 */
export async function chatCreateItem(data = {}) {
  const _id = data.id;
  if (!_id) {
    throw new Error('Chat id is required');
  }
  if (await chatGetItem(_id)) {
    throw new Error('Chat is exists');
  }

  const $set = {
    _id,
    active: true,
    crated: Date.now(),
    stamp: Date.now(),
  };

  if (data.username) {
    $set.username = data.username;
  }
  if (data.first_name) {
    $set.first_name = data.first_name;
  }
  if (data.last_name) {
    $set.last_name = data.last_name;
  }

  // chatData[_id] = $set;
  await mongoInsertOne('chat', $set);
  return await chatGetItem(_id);
}

/**
 * Обновляет данные чата
 * @param _id
 * @param patch
 * @returns {Promise<void>}
 */
export async function chatUpdateItem(_id, patch = {}) {
  const oldItem = await chatGetItem(_id);
  if (!oldItem) {
    throw new Error('chat is not exists');
  }

  const $set = {
    stamp: Date.now(),
  };

  if (oldItem.active !== patch.active) {
    $set.active = patch.active;
  }
  if (oldItem.username !== patch.username) {
    $set.username = patch.username;
  }
  if (oldItem.first_name !== patch.first_name) {
    $set.first_name = patch.first_name;
  }
  if (oldItem.last_name !== patch.last_name) {
    $set.last_name = patch.last_name;
  }
  await mongoUpdateOne('chat', {_id}, $set);
  return await chatGetItem(_id);
}
