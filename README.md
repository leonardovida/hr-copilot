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

- FastAPI + PostgreSQL for the backend, deployed via Fly.io (but that could easily be ECS or any server with a docker compose)
  - The FastAPI part builds on the great work by [`igorbenav`](https://github.com/igorbenav), both using his `fastcrud` project and his FastAPI boilerplate.
- Next.js + TypeScript for the frontend website, deployed via Vercel
  - This is a simple frontend leveraging shadcn/ui
- OpenAI for parsing and evaluating the job description and the resumes being uploaded
  - to be switched to a fine-tuned version using feedback and queries
- A very simple Terraform module for building the infrastructure required.
  - Mainly this creates S3 buckets, but it also has a commented-out option of moving to ECS (though currently not used)

## Running the service

- Consult the `GUIDE_LOCAL.md` for a more detailed guide on how to run the service locally.
- Consult the `GUIDE_PRODUCTION.md` for suggestions on how to deploy the service in production.
