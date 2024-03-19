# HR Copilot

> \[!WARNING\]
> This repository is in a work in progress state and things might and will change.

This is a FastAPI app with a simple frontend to simplify the recruitment process of new candidates.

### What it does

Currently it provides the following:

- Ingest new job descriptions (new 'jobs') via text or parsing the job description PDF
- Ingest new resumes (new 'candidates') via text or parsing the resume PDF
- Process the job descriptions and resumes to extract the relevant information. This uses GPT4-turbo currently but it will be substituted with Claude Haiku to reduce parsing costs.
- Use these relevant information to:
  - Score the resumes against the job descriptions. This is done by evaluating the extracted skills from the job description (currently classified as `required`, `nice-to-have` and `hard` and `soft`) and comparing them to the job description using a powerful reasoning LLM (currently GPT4-turbo)
  - Provide a simple interface for users (i.e. recruiters) to view the scores and the explanation of each of the comparison between job descriptions and resumes

### What it will do

- Grade base systems (A,B, C, D)
- Allow the definition of custom "metrics" (i.e. dimensions) to use to parse and extract information about the job description and the resume. Think about "average duration in a company", "front-facing vs. backoffice-facing roles", etc.
- Use the parsed informations to create a rejection/acceptance email to send to the candidate with an explanation.
- Reverse search: given resumes (which are then parsed), search and index across internal (and/or external) job boards scraping descriptions and matching them to resumes. Once this is done, provide the top resumes for each job description to be sent or proposed.
- "Chat with the resumes" functionality, in which we RAG across the resumes and surface the top resumes after a back and forth with the user

## Stack

The current tech stack looks like this:

- FastAPI + PostgreSQL for the backend, deployed via Fly.io (but that could easily be ECS or any server with a docker compose) and soon deployed on a VM.
  - The FastAPI part builds on the great work by [`igorbenav`](https://github.com/igorbenav), both using his `fastcrud` project and his FastAPI boilerplate.
- Next.js + TypeScript for the frontend website, deployed via Vercel
  - This is a simple frontend leveraging shadcn/ui
- OpenAI for parsing and evaluating the job description and the resumes being uploaded
  - If we see fit in the future, to be switched to a fine-tuned version using feedback and queries
  - After the chat functionality will be introduced, we will be fine tuning an embedding model to improve RAG performance.
- A very simple Terraform module for building the infrastructure required.
  - Mainly this creates S3 buckets, but it also has a commented-out option of moving to ECS (though currently not used)
  - This module should NOT be used when deploying on a VM or using LiteFS from Fly.io

## Running the service

- Consult the `GUIDE_DEVELOPMENT.md` for a more detailed guide on how to run the service locally.
- Consult the `GUIDE_DEPLOYMENT.md` for suggestions on how to deploy the service in production.
