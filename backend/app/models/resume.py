import uuid as uuid_pkg
from datetime import UTC, datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import DateTime, Integer, String

from ..core.db.database import Base


class Resume(Base):
    """Model for Resumes."""

    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column("id", autoincrement=True, nullable=False, unique=True, primary_key=True, init=False)
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    name: Mapped[str] = mapped_column(
        String(length=2000),
        nullable=False,
    )
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    text: Mapped[str] = mapped_column(String(63206), nullable=True)
    s3_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(default_factory=uuid_pkg.uuid4, primary_key=True, unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)
