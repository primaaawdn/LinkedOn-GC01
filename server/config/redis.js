const { default: Redis } = require("ioredis");

const redis = new Redis({
    port: 15704,
	host: "redis-15704.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com",
	username: "default",
	password: process.env.REDIS_CLOUD_PASSWORD,
	db: 0,
});

redis.on('connect', () => {
    console.log("Connected to Redis");
});

redis.on('error', (err) => {
    console.log("Redis connection error: ", err);
});

module.exports = redis;