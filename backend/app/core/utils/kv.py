from redis.asyncio import ConnectionPool, Redis

from ..logger import logging

logger = logging.getLogger(__name__)

pool: ConnectionPool | None = None
client: Redis | None = None


async def set_key_value(
    key: str,
    value: str,
) -> None:
    """Sets a key-value pair in Redis.

    Args:
        redis (Redis): The Redis connection.
        key (str): The key under which to store the value.
        value (Any): The value to store.

    Returns:
        Awaitable[bool]: True if the operation was successful, False otherwise.

    Raises:
        RedisError: If there is an error setting the value in Redis.
    """
    if client is None:
        logger.error("Redis client is not initialized.")
        raise Exception("Redis client is not initialized.")

    try:
        await client.set(key, value)
    except Exception as e:
        logging.error(f"Error setting Redis key: {key} with value: {value}. Error: {e}")
        raise
