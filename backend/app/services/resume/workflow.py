import logging

from ...core.config import settings
from ...core.utils.kv import set_key_value
from ...schemas.parsed_job_description import ParsedJobDescriptionRead
from ...schemas.resume import ResumeRead
from ...services.ocr.parse_pdf import parse_pdf
from ...services.resume.openai import oa_resume


async def evaluate_resume(resume: ResumeRead, parsed_job_description: ParsedJobDescriptionRead) -> ResumeRead:
    """Process the text workflow.

    Extract skills from job description and CV and then evaluate CV.

    :param text: The text to process.
    :param parsed_resume: DAO for ParsedText models.
    :return: The parsed text.
    """
    try:
        llm_provider = settings.LLM_PROVIDER

        if llm_provider == "openai":
            request_function = oa_resume

        await set_key_value(key=f"job:{resume.job_id}:{resume.id}:evaluate_status", value=settings.STATUS_PROCESSING)
        text_extracted = await request_function(
            parsed_skills=parsed_job_description.parsed_skills,
            resume_text=resume.text,
        )
        logging.info(f"Parsed skills: {text_extracted}")
        await set_key_value(key=f"job:{resume.job_id}:{resume.id}:evaluate_status", value=settings.STATUS_SUCCESS)

        return text_extracted
    except Exception as e:
        logging.error(
            f"Error evaluating CV for PDF ID {resume.id} and Job ID {resume.job_id}: {e}",
        )
        await set_key_value(key=f"job:{resume.job_id}:{resume.id}:evaluate_status", value=settings.STATUS_ERROR)
        raise


async def extract_resume_text(
    resume: ResumeRead,
) -> str:
    """Given a Resume in S3, convert each page to JPG images and encode them in base64. Then, extract text from
    each image and return the full text.

    :param s3_url: The S3 URL of the PDF to process.
    :type s3_url: str
    :return: The full text of the PDF.
    :rtype: str
    """
    logging.info(f"Extracting text from PDF {resume.s3_url}")
    try:
        return await parse_pdf(path=resume.s3_url, is_s3_url=True)
    except Exception as e:
        logging.error(f"Error extracting text from PDF ID {resume.id}: {e}")
        await set_key_value(key=f"job:{resume.job_id}:{resume.id}:extract_status", value=settings.STATUS_ERROR)
