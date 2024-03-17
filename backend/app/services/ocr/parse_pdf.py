import logging
import string
from io import BytesIO

import pdfplumber

from ...core.config import settings
from ...core.utils.s3 import create_s3_client


class PDFOcrParsingError(Exception):
    """Exception raised when a PDF cannot be parsed."""


async def parse_pdf(path: str, is_s3_url=False) -> str:
    logging.info("Parsing PDF using OCR")

    pdf_pages_list = []

    if is_s3_url:
        try:
            s3_client = await create_s3_client()
            bucket_name = settings.S3_BUCKET_NAME
            object_name = str(path).split("/")[-1]
            logging.info(f"Parsing S3 PDF {object_name}")

            file_obj = BytesIO()
            s3_client.download_fileobj(bucket_name, object_name, file_obj)
            pdf = pdfplumber.open(BytesIO(file_obj.getvalue()))

        except Exception as e:
            logging.error(f"Error downloading PDF from S3: {e}")
            raise PDFOcrParsingError(f"Error downloading PDF from S3: {e}") from e
    else:
        pdf = pdfplumber.open(path)
        logging.info(f"Parsing Local PDF {path}")

    for page in pdf.pages:
        text = page.extract_text()
        pdf_pages_list.append(text)

    pdf_pages_list = "".join([page_text.replace("*", "") for page_text in pdf_pages_list])
    pdf_pages_list = "".join(x for x in pdf_pages_list if x in string.printable)  # remove wrong chars

    return pdf_pages_list
