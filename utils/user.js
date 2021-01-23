import redisClient from './redis';

async function getUserIdAndKey(request) {
  const obj = { userId: null, key: null };

  const xToken = request.header('X-Token');

  if (!xToken) return obj;

  obj.key = `auth_${xToken}`;

  obj.userId = await redisClient.get(obj.key);

  return obj;
}

export default getUserIdAndKey;
