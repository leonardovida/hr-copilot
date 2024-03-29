import os
from enum import Enum

from pydantic_settings import BaseSettings
from starlette.config import Config

current_file_dir = os.path.dirname(os.path.realpath(__file__))
env_path = os.path.join(current_file_dir, "..", "..", ".env")
config = Config(env_path)


class AppSettings(BaseSettings):
    APP_NAME: str = config("APP_NAME", default="FastAPI app")
    APP_DESCRIPTION: str | None = config("APP_DESCRIPTION", default=None)
    APP_VERSION: str | None = config("APP_VERSION", default=None)
    LICENSE_NAME: str | None = config("LICENSE", default=None)
    CONTACT_NAME: str | None = config("CONTACT_NAME", default=None)
    CONTACT_EMAIL: str | None = config("CONTACT_EMAIL", default=None)
    REFRESH: bool = config("REFRESH", default=False)  # Only set when developing and with uvicorn


class CryptSettings(BaseSettings):
    SECRET_KEY: str = config("SECRET_KEY")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = config("REFRESH_TOKEN_EXPIRE_DAYS", default=7)


class DatabaseSettings(BaseSettings):
    pass


class SQLiteSettings(DatabaseSettings):
    SQLITE_URI: str = config("SQLITE_URI", default="./sql_app.db")
    SQLITE_SYNC_PREFIX: str = config("SQLITE_SYNC_PREFIX", default="sqlite:///")
    SQLITE_ASYNC_PREFIX: str = config("SQLITE_ASYNC_PREFIX", default="sqlite+aiosqlite:///")


class MySQLSettings(DatabaseSettings):
    MYSQL_USER: str = config("MYSQL_USER", default="username")
    MYSQL_PASSWORD: str = config("MYSQL_PASSWORD", default="password")
    MYSQL_SERVER: str = config("MYSQL_SERVER", default="localhost")
    MYSQL_PORT: int = config("MYSQL_PORT", default=5432)
    MYSQL_DB: str = config("MYSQL_DB", default="dbname")
    MYSQL_URI: str = f"{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_SERVER}:{MYSQL_PORT}/{MYSQL_DB}"
    MYSQL_SYNC_PREFIX: str = config("MYSQL_SYNC_PREFIX", default="mysql://")
    MYSQL_ASYNC_PREFIX: str = config("MYSQL_ASYNC_PREFIX", default="mysql+aiomysql://")
    MYSQL_URL: str = config("MYSQL_URL", default=None)


class PostgresSettings(DatabaseSettings):
    POSTGRES_USER: str = config("POSTGRES_USER", default="postgres")
    POSTGRES_PASSWORD: str = config("POSTGRES_PASSWORD", default="postgres")
    POSTGRES_SERVER: str = config("POSTGRES_SERVER", default="localhost")
    POSTGRES_PORT: int = config("POSTGRES_PORT", default=5432)
    POSTGRES_DB: str = config("POSTGRES_DB", default="postgres")
    POSTGRES_SYNC_PREFIX: str = config("POSTGRES_SYNC_PREFIX", default="postgresql://")
    POSTGRES_ASYNC_PREFIX: str = config("POSTGRES_ASYNC_PREFIX", default="postgresql+asyncpg://")
    POSTGRES_URI: str = f"{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    POSTGRES_URL: str | None = config("POSTGRES_URL", default=None)


class FirstUserSettings(BaseSettings):
    ADMIN_NAME: str = config("ADMIN_NAME", default="admin")
    ADMIN_EMAIL: str = config("ADMIN_EMAIL", default="admin@admin.com")
    ADMIN_USERNAME: str = config("ADMIN_USERNAME", default="admin")
    ADMIN_PASSWORD: str = config("ADMIN_PASSWORD", default="!Ch4ng3Th1sP4ssW0rd!")


class TestSettings(BaseSettings):
    TEST_NAME: str = config("TEST_NAME", default="Tester User")
    TEST_EMAIL: str = config("TEST_EMAIL", default="test@tester.com")
    TEST_USERNAME: str = config("TEST_USERNAME", default="testeruser")
    TEST_PASSWORD: str = config("TEST_PASSWORD", default="Str1ng$t")


class RedisCacheSettings(BaseSettings):
    REDIS_CACHE_HOST: str = config("REDIS_CACHE_HOST", default="localhost")
    REDIS_CACHE_PORT: int = config("REDIS_CACHE_PORT", default=6379)
    REDIS_CACHE_URL: str = f"redis://{REDIS_CACHE_HOST}:{REDIS_CACHE_PORT}"


class ClientSideCacheSettings(BaseSettings):
    CLIENT_CACHE_MAX_AGE: int = config("CLIENT_CACHE_MAX_AGE", default=60)


class RedisQueueSettings(BaseSettings):
    REDIS_QUEUE_HOST: str = config("REDIS_QUEUE_HOST", default="localhost")
    REDIS_QUEUE_PORT: int = config("REDIS_QUEUE_PORT", default=6379)


class RedisRateLimiterSettings(BaseSettings):
    REDIS_RATE_LIMIT_HOST: str = config("REDIS_RATE_LIMIT_HOST", default="localhost")
    REDIS_RATE_LIMIT_PORT: int = config("REDIS_RATE_LIMIT_PORT", default=6379)
    REDIS_RATE_LIMIT_URL: str = f"redis://{REDIS_RATE_LIMIT_HOST}:{REDIS_RATE_LIMIT_PORT}"


class DefaultRateLimitSettings(BaseSettings):
    DEFAULT_RATE_LIMIT_LIMIT: int = config("DEFAULT_RATE_LIMIT_LIMIT", default=10)
    DEFAULT_RATE_LIMIT_PERIOD: int = config("DEFAULT_RATE_LIMIT_PERIOD", default=3600)


class EnvironmentOption(Enum):
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"


class EnvironmentSettings(BaseSettings):
    ENVIRONMENT: EnvironmentOption = config("ENVIRONMENT", default="local")


class OpenAISettings(BaseSettings):
    OPENAI_MODEL_NAME: str = config("OPENAI_MODEL_NAME", default="gpt-4-turbo-preview")
    OPENAI_API_KEY: str = config("OPENAI_API_KEY", default=None)
    OPENAI_API_URL: str = config("OPENAI_API_URL", default="")
    OPENAI_SEED: int = config("SEED", default=12345)
    OPENAI_MAX_TOKENS: int = config("MAX_TOKENS", default=4096)
    OPENAI_TEMPERATURE: float = config("TEMPERATURE", default=0.0)
    OPENAI_PRESENCE_PENALTY: float = config("PRESENCE_PENALTY", default=0.1)
    OPENAI_FREQUENCY_PENALTY: float = config("FREQUENCY_PENALTY", default=0.1)


class S3Settings(BaseSettings):
    S3_BUCKET_NAME: str = os.getenv(
        "TALENT_COPILOT_S3_BUCKET_NAME",
        "tc-staging-documents",
    )
    # This is localstack to emulate s3
    S3_ENDPOINT_URL: str | None = os.getenv(
        "TALENT_COPILOT_S3_ENDPOINT_URL",
        "http://host.docker.internal:4566",
    )
    AWS_ACCESS_KEY_ID: str | None = os.getenv(
        "TALENT_COPILOT_AWS_SECRET_ACCESS_KEY_ID",
        "test",
    )
    AWS_SECRET_ACCESS_KEY: str | None = os.getenv(
        "TALENT_COPILOT_AWS_SECRET_ACCESS_KEY",
        "test",
    )


class LLMBaseSettings(BaseSettings):
    LLM_PROVIDER: str = "openai"


class StatusSettings(BaseSettings):
    STATUS_PROCESSING: str = "Processing"
    STATUS_SUCCESS: str = "Done"
    STATUS_ERROR: str = "Error"


class ScoreSettings(BaseSettings):
    YES_MATCH_WEIGHT: float = 1.0
    PARTIAL_MATCH_WEIGHT: float = 0.5
    NO_MATCH_WEIGHT: float = 0.0
    REQUIRED_SKILLS_WEIGHT: float = 6
    NICE_TO_HAVE_SKILLS_WEIGHT: float = 4
    SOFT_SKILLS_WEIGHT: float = 0.5
    HARD_SKILLS_WEIGHT: float = 0.5


class SentrySettings(BaseSettings):
    SENTRY_DSN: str | None = config("SENTRY_DSN", default=None)  # Should differs for staging and prod
    SENTRY_SAMPLE_RATE: float = config("SENTRY_SAMPLE_RATE", default=1.0)


class LoggingSettings(BaseSettings):
    LOG_LEVEL: str = config("LOG_LEVEL", default="INFO")


class Settings(
    AppSettings,
    CryptSettings,
    ClientSideCacheSettings,
    DefaultRateLimitSettings,
    EnvironmentSettings,
    FirstUserSettings,
    LoggingSettings,
    LLMBaseSettings,
    OpenAISettings,
    PostgresSettings,
    RedisRateLimiterSettings,
    RedisQueueSettings,
    RedisCacheSettings,
    S3Settings,
    StatusSettings,
    ScoreSettings,
    SentrySettings,
    TestSettings,
):
    pass


settings = Settings()
