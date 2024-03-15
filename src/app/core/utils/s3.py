import logging
from typing import Any

import boto3
import pendulum
from fastapi import UploadFile

from ...core.config import settings


async def create_s3_client() -> Any:
    """Create an s3 client."""
    logging.info("Creating S3 Client!")
    logging.info(f"Endpoint: {settings.S3_ENDPOINT_URL}")
    logging.info(f"Access key id: {settings.AWS_ACCESS_KEY_ID}")
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL if settings.ENVIRONMENT == "local" else None,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


async def upload_s3_file(file: UploadFile, file_name: str, folder_path: str) -> str:
    """Upload the s3 file."""
    s3_client = await create_s3_client()
    bucket_name = settings.S3_BUCKET_NAME

    if len([x for x in s3_client.list_buckets()["Buckets"] if x["Name"] == bucket_name]) == 0:
        s3_client.create_bucket(Bucket=bucket_name)

    file_contents = await file.read()
    current_time = pendulum.now().to_iso8601_string()
    object_name = f"{current_time}_{file_name}"

    s3_client.put_object(
        Body=file_contents,
        Bucket=bucket_name,
        Key=object_name,
    )
    if settings.ENVIRONMENT == "development":
        s3_url = f"{settings.S3_ENDPOINT_URL}/{bucket_name}/{folder_path}/{object_name}"
    else:
        s3_url = f"https://{bucket_name}.s3.amazonaws.com/{folder_path}/{object_name}"

    return s3_url
