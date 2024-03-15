import asyncio
import logging
from datetime import UTC, datetime

from sqlalchemy import select

from ..app.core.config import config
from ..app.core.db.database import AsyncSession, local_session
from ..app.models.rate_limit import RateLimit
from ..app.models.tier import Tier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_first_tier(session: AsyncSession) -> None:
    try:
        tier_name = config("TIER_NAME", default="free")

        query = select(Tier).where(Tier.name == tier_name)
        result = await session.execute(query)
        tier = result.scalar_one_or_none()

        if tier is None:
            session.add(Tier(name=tier_name))
            await session.commit()
            logger.info(f"Tier '{tier_name}' created successfully.")

        if tier is None:
            # Assuming tier creation is successful and you have the tier object
            result = await session.execute(select(Tier).where(Tier.name == tier_name))
            tier = result.scalar_one()
            # Create a rate limit for 500 resumes per month
            session.add(
                RateLimit(
                    tier_id=tier.id,
                    name="monthly_resume_limit",
                    path="api/v1/resumes",
                    limit=500,
                    period=2592000,  # 30 days in seconds
                    created_at=datetime.now(UTC),
                )
            )
            session.add(
                RateLimit(
                    tier_id=tier.id,
                    name="monthly_job_descriptions_limit",
                    path="api/v1/job_descriptions",
                    limit=20,
                    period=2592000,  # 30 days in seconds
                    created_at=datetime.now(UTC),
                )
            )
            await session.commit()
            logger.info("Rate limit for 500 resumes and 20 job descriptions per month created successfully.")

        else:
            logger.info(f"Tier '{tier_name}' already exists.")

    except Exception as e:
        logger.error(f"Error creating tier: {e}")


async def main():
    async with local_session() as session:
        await create_first_tier(session)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
