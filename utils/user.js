import redisClient from './redis';
import dbClient from './db';

async function getUserIdAndKey(request) {
  const obj = { userId: null, key: null };

  const xToken = request.header('X-Token');

  if (!xToken) return obj;

  obj.key = `auth_${xToken}`;

  obj.userId = await redisClient.get(obj.key);

  return obj;
}

async function getUser(query) {
  const user = await dbClient.usersCollection.findOne(query);
  return user;
}

export { getUserIdAndKey, getUser };
