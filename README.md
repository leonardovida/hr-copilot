# HR Copilot

This is a FastAPI app with a simple frontend to simplify the recruitment process of new candidates.

Currently it provides the following:

- Ingest new job descriptions (new 'jobs') via either copy/past or PDF
- Ingest new resumes (new 'candidates') via either copy/past or PDF
- Parse the job descriptions and resumes to extract the relevant information
- Score the resumes against the job descriptions
- Provide a simple interface for users to view the scores and the parsed information

## Stack

Overall the techstack looks like this:

- Next.js + TypeScript for the frontend website, deployed via Vercel
- FastAPI + PostgreSQL for the backend, deployed via Fly.io (but that could easily be ECS or any server with a docker compose)
- Terraform for the infrastructure
- OpenAI for the LLM model, soon to be switched to a fine-tuned version using feedback and queries

## Running the service

- Consult the `GUIDE_LOCAL.md` for a more detailed guide on how to run the service locally.
- Consult the `GUIDE_PRODUCTION.md` for suggestions on how to deploy the service in production.
