process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

const connect = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
};

const disconnect = async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
};

const clearDb = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, disconnect, clearDb };
