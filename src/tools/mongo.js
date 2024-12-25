import {MongoClient} from 'mongodb';
import {MONGO_DB, MONGO_URL} from '../config.js'; // Файл конфигурации

if(!MONGO_DB) {
  throw new Error('MONGO_DB is required');
}

if(!MONGO_URL) {
  throw new Error('MONGO_URL is required');
}

const mongo = new MongoClient(MONGO_URL);
let db;

export async function initMongo() {
  await mongo.connect();
  db = mongo.db(MONGO_DB);
}

export async function mongoFindOne(collection, filter = {}) {
  return await db.collection(collection).findOne(filter);
}

export async function mongoInsertOne(collection, $set) {
  return await db.collection(collection).insertOne($set);
}

export async function mongoUpdateOne(collection, filter = {}, $set) {
  return await db.collection(collection).updateOne(filter, {$set});
}

export async function mongoGetList(collection, filter = {}, sort = {}, limit) {
  return await db.collection(collection).find(filter).sort(sort).limit(limit).toArray();
}

export async function mongoGetCount(collection, filter = {}) {
  return await db.collection(collection).countDocuments(filter);
}