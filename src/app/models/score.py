import uuid as uuid_pkg
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from ..core.db.database import Base


class Score(Base):
    """Model for Scores."""

    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    resume_id: Mapped[int] = mapped_column(
        String(length=100),
        nullable=False,
    )
    job_id: Mapped[int] = mapped_column(
        String(length=100),
        nullable=False,
    )
    parsed_job_id: Mapped[int] = mapped_column(
        String(length=100),
        nullable=False,
    )
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(default_factory=uuid_pkg.uuid4, primary_key=True, unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)
