// This script runs once when the MongoDB container is first created.
// It creates a dedicated application user with read/write access to the bgverify database.
db = db.getSiblingDB('bgverify');

db.createUser({
  user: 'bgverify_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'apppassword',
  roles: [{ role: 'readWrite', db: 'bgverify' }],
});

print('✅ MongoDB: bgverify database and application user created.');
