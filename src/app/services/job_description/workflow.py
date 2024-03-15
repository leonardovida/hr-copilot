import logging

from ...core.config import settings
from ...core.utils.kv import set_key_value
from ...schemas.job_description import JobDescriptionRead
from ...services.job_description.openai import oa_job_description
from ...services.job_description.schema import SkillsExtract
from ...services.ocr.parse_pdf import parse_pdf


async def extract_job_description_skills(
    job_description: JobDescriptionRead,
) -> JobDescriptionRead:
    """Extracts skills from a given job description using a Large Language Model (LLM).

    This function takes a JobDescriptionRead object and an AsyncSession object as input. It
    processes the job description
    text using a specified LLM provider (e.g., OpenAI) to extract relevant skills.
    The function updates the job's status
    in the key-value store before and after the extraction process. It handles exceptions
    that may occur during the
    extraction process and logs appropriate messages.

    Args:
        job_description (JobDescriptionRead): The job description object containing the text
        to be processed.
        db (Annotated[AsyncSession, Depends(async_get_db)]): The database session used for any
        database operations.

    Returns:
        JobDescriptionRead: An object containing the extracted skills from the job description.

    Raises:
        Exception: If an error occurs during the extraction process or while updating the job's
        status in the key-value store.
    """
    await set_key_value(key=f"job:{job_description.id}:extract_status", value=settings.STATUS_PROCESSING)

    llm_provider = settings.LLM_PROVIDER
    if llm_provider == "openai":
        request_function = oa_job_description
    # TODO: to substitute with Claude or LLM general wrapper
    # elif llm_provider == "mistral":
    #     request_function = mistral_job_description

    job_extract = await request_function(
        job_description=job_description.description,
        response_model=SkillsExtract,
    )

    await set_key_value(key=f"job:{job_description.id}:extract_status", value=settings.STATUS_SUCCESS)
    return job_extract


async def extract_job_description_text(
    job_description: JobDescriptionRead,
) -> str:
    """Given a PDF in S3, convert each page using pdfplumber to images. Extracts the text from a job description
    PDF stored in S3.

    This function takes a JobDescriptionRead object, which includes an S3 URL to the PDF,
    and uses the `parse_pdf` function to extract the text from the PDF. It handles any exceptions
    that occur during the extraction process and logs an error message if the extraction fails.

    Args:
        job_description (JobDescriptionRead): The job description object containing the S3
        URL of the PDF.

    Returns:
        str: The extracted text from the PDF if successful, None otherwise.

    Raises:
        Exception: If an error occurs during the PDF text extraction process.
    """
    try:
        return await parse_pdf(path=job_description.s3_url, is_s3_url=True)
    except Exception as e:
        logging.error(f"Error extracting text from PDF {job_description.s3_url}: {e}")
