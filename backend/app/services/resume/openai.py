import logging

import instructor
from openai import AsyncOpenAI

from ...core.config import settings
from ...services.job_description.schema import SkillsExtract
from ...services.resume.prompt import (
    oa_35_system_prompt_step_1,
    oa_35_system_prompt_step_2,
    oa_35_system_prompt_step_3,
    oa_35_user_prompt_step_1,
    oa_35_user_prompt_step_2,
    oa_35_user_prompt_step_3,
    system_prompt_cv,
    user_prompt_cv,
)
from ...services.resume.schema import EvaluationExtract


async def gpt_mixed_flow(
    parsed_skills: str,
    resume_text: str,
):
    total_tokens = 0
    client = instructor.patch(AsyncOpenAI(api_key=settings.OPENAI_API_KEY))

    # Prompt: parse the resume into skills
    logging.debug("GPT 3.5 - Prompt 1")
    messages = [
        {"role": "system", "content": oa_35_system_prompt_step_1},
        {"role": "user", "content": oa_35_user_prompt_step_1.format(resume=resume_text)},
    ]
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        seed=settings.OPENAI_SEED,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        presence_penalty=settings.OPENAI_PRESENCE_PENALTY,
        frequency_penalty=settings.OPENAI_FREQUENCY_PENALTY,
    )
    total_tokens += response.usage.total_tokens
    logging.info(f"Received response from OpenAI: {response}")

    # Prompt: parse resume skills into JSON
    logging.debug("GPT 3.5 - Prompt 2")
    messages = [
        {"role": "system", "content": oa_35_system_prompt_step_2},
        {
            "role": "user",
            "content": oa_35_user_prompt_step_2.format(parsed_skills=response.choices[0].message.content),
        },
    ]
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        response_model=SkillsExtract,
        response_format={"type": "json_object"},
        seed=settings.OPENAI_SEED,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        presence_penalty=settings.OPENAI_PRESENCE_PENALTY,
        frequency_penalty=settings.OPENAI_FREQUENCY_PENALTY,
        max_retries=2,
    )

    total_tokens += response._raw_response.usage.total_tokens
    # Prompt: match job description skills to resume skills
    logging.debug("GPT 4 - Prompt 3")
    messages = [
        {"role": "system", "content": oa_35_system_prompt_step_3},
        {
            "role": "user",
            "content": oa_35_user_prompt_step_3.format(job_description_skills=parsed_skills, resume_skills=response),
        },
    ]
    response = await client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=messages,
        response_model=EvaluationExtract,
        response_format={"type": "json_object"},
        seed=settings.OPENAI_SEED,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        presence_penalty=settings.OPENAI_PRESENCE_PENALTY,
        frequency_penalty=settings.OPENAI_FREQUENCY_PENALTY,
        max_retries=2,
    )

    total_tokens += response._raw_response.usage.total_tokens
    logging.info(f"Response: {response}")
    logging.info(f"Total tokens: {response}")
    return response


async def gpt4_flow(
    parsed_skills: str,
    resume_text: str,
) -> EvaluationExtract:
    total_tokens = 0
    client = instructor.patch(AsyncOpenAI(api_key=settings.OPENAI_API_KEY))

    logging.debug("GPT 4")
    messages = [
        {"role": "system", "content": system_prompt_cv},
        {
            "role": "user",
            "content": user_prompt_cv.format(job_description_skills=parsed_skills, resume_text=resume_text),
        },
    ]
    response = await client.chat.completions.create(
        model="gpt-4-turbo-0125",
        messages=messages,
        response_model=EvaluationExtract,
        response_format={"type": "json_object"},
        seed=settings.OPENAI_SEED,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        presence_penalty=settings.OPENAI_PRESENCE_PENALTY,
        frequency_penalty=settings.OPENAI_FREQUENCY_PENALTY,
        max_retries=2,
    )

    # Here only response as the message goes through the instructor library
    total_tokens += response._raw_response.usage.total_tokens
    logging.info(f"Response: {response}")
    logging.info(f"Total tokens: {total_tokens}")
    return response


async def oa_resume(
    parsed_skills: str,
    resume_text: str,
) -> EvaluationExtract | None:
    """Send a request to OpenAI asynchronously.

    :param system_prompt: The system prompt to send to OpenAI.
    :param user_prompt: The user prompt to send to OpenAI.
    :param response_model: The response model to use.
    :param is_async: Whether to use the async client or not.
    :return: The parsed skills formatted following the pydantic class.
    """
    if settings.OPENAI_MODEL_NAME == "gpt-3.5-turbo-0125":
        response = await gpt_mixed_flow(parsed_skills=parsed_skills, resume_text=resume_text)
    elif settings.OPENAI_MODEL_NAME == "gpt-4-turbo-preview":
        response = await gpt4_flow(parsed_skills=parsed_skills, resume_text=resume_text)
    else:
        raise ValueError("Invalid GPT model name")

    logging.info(f"Received response from OpenAI: {response}")
    if not response:
        raise ValueError("No content received from OpenAI response")
    return response
