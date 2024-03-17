import logging

import instructor
from openai import AsyncOpenAI

from ...core.config import settings
from ...services.job_description.prompt import (
    oa_35_system_prompt_step_1,
    oa_35_system_prompt_step_2,
    oa_35_user_prompt_step_1,
    oa_35_user_prompt_step_2,
    system_prompt_job_description,
    user_prompt_job_description,
)
from ...services.job_description.schema import SkillsExtract


async def gpt35_flow(
    job_description: str,
    response_model: SkillsExtract,
):
    total_tokens = 0
    client = instructor.patch(AsyncOpenAI(api_key=settings.OPENAI_API_KEY))

    # Prompt 1
    logging.debug("GPT 3.5 - Prompt 1")
    messages = [
        {"role": "system", "content": oa_35_system_prompt_step_1},
        {
            "role": "user",
            "content": oa_35_user_prompt_step_1.format(job_description=job_description),
        },
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
    logging.info(f"Response\n\n{response}\n\n")

    # Prompt 2
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
        response_model=response_model,
        response_format={"type": "json_object"},
        seed=settings.OPENAI_SEED,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        presence_penalty=settings.OPENAI_PRESENCE_PENALTY,
        frequency_penalty=settings.OPENAI_FREQUENCY_PENALTY,
    )

    # Here only response as the message goes through the instructor library
    total_tokens += response._raw_response.usage.total_tokens
    logging.info(f"Response: {response}")
    logging.info(f"Total tokens: {total_tokens}")
    return response


async def gpt4_flow(
    job_description: str,
    response_model: SkillsExtract,
):
    total_tokens = 0
    client = instructor.patch(AsyncOpenAI(api_key=settings.OPENAI_API_KEY))

    logging.debug("GPT 4")
    messages = [
        {"role": "system", "content": system_prompt_job_description},
        {
            "role": "user",
            "content": user_prompt_job_description.format(job_description=job_description),
        },
    ]
    response = await client.chat.completions.create(
        model="gpt-4-turbo-0125",
        messages=messages,
        response_model=response_model,
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


async def oa_job_description(
    job_description: str,
    response_model: SkillsExtract,
) -> SkillsExtract:
    """Send a request to OpenAI asynchronously.

    :param system_prompt: The system prompt to send to OpenAI.
    :param user_prompt: The user prompt to send to OpenAI.
    :param response_model: The response model to use.
    :param is_async: Whether to use the async client or not.
    :return: The parsed skills formatted following the pydantic class.
    """
    if settings.OPENAI_MODEL_NAME == "gpt-3.5-turbo-0125":
        response = await gpt35_flow(job_description, response_model)
    elif settings.OPENAI_MODEL_NAME == "gpt-4-turbo-preview":
        response = await gpt4_flow(job_description, response_model)
    else:
        raise ValueError("Invalid GPT model name")

    logging.info(f"Received response from OpenAI: {response}")
    if not response:
        raise ValueError("No content received from OpenAI response")
    return response
