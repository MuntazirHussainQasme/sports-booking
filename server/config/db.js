const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri || uri === 'memory') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.join(__dirname, '..', '.data');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({ instance: { dbPath, port: 27019, storageEngine: 'wiredTiger' } });
    uri = mongod.getUri('facility_booking');
    console.log('Using built-in local database (server/.data)');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
