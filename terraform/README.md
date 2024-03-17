# Terraform setup

This setup was done to reduce the cost of a simple FastAPI application. Initially it was intended to deploy everything on AWS. However, we decided to use Fly.io to deploy the FastAPI application, Neon for a serverless PostgreSQL database and use AWS only for the S3 buckets.

As you will notice, it is a very simple setup reflecting the choices made for this project. It does not try to be general or to cover all the possible use cases.

Note 1: Within the `backend` folder, you will find a complete Docker compose file. Another suggested path to deploy the backend section (but also frontend) of this application is to use a DigitalOcean VM instance (~25$) which should be enough to run the backend and the frontend of this application for at least up to 100 users.

## Configure and deploy this setup

If you wish to use the recommended setup, i.e. using Fly.io then continue reading the next section `basic configuration`, otherwise please skip to `advanced configuration` where we show you all the variables to configure to deploy the app on ECS.

Note that with the basic configuration, the majority of AWS resources are not created. In particular:

- VPC
- ALB
- ECS
- Lambda
- Secrets Manager
- APP -> the main application to spin up the FastAPI on ECS

The only resource being created by terraform is currently the S3 buckets.

Also note that this setup assumes that you have separate CICD pipelines for staging and production in which Terraform variables are set correctly (see below for a brief overview of which variables should be set). This means that deploying the Terraform configuration only once with the default variable will not be enough to deploy both the `staging` (or `testing` or any name you wish) and the `production` environments.

### Basic configuration

Required variables:

- `name` (string) -> the name of the app
- `environment` (string) -> the environment (staging, production)
- `region` (string) -> the AWS region where the app will be deployed. Defaults to 'eu-west-1'.
- `prefix` (string) -> the prefix to use for the resources. Defaults to 'talent-copilot'.

Then resources such as the S3 bucket will be names using a prefix:

- `tc-staging-<s3bucketname>`
- `ttc-production-<s3bucketname>`

### Advanced configuration

- `app_port` (number) -> the port on which the app will be listening. Defaults to 80.
- `ecr_image` (string) -> the ECR image to use for the app. The tag default to 'latest' -> you will need to change this if you wish to use a different tag
- `openai_api_key` (string) -> the OpenAI API key to use for the app
- `db_password` (string) -> the password to use for the database
- `talent_copilot_aws_access_key_id` (string) -> the AWS access key to use for the app
- `talent_copilot_aws_secret_access_key` (string) -> the AWS secret access key to use for the app

This setup is not using AWS RDS as it was too expensive. Instead we setup variables pointing to a managed serverless Postgres database on Neon. If you wish to follow our setup, feel free to create the database on Neon and fill-in the following variables:

- `db_instance_address` (string) -> the address of the database instance

- `db_user` (string) -> the user to use for the database

- `db_database` (string) -> the name of the database

- `db_port` (number) -> the port to use for the database. Defaults to 5432.

- `create_vpc` (bool) -> whether to create the VPC or not. Defaults to false.

- `create_alb` (bool) -> whether to create the ALB or not. Defaults to false.

- `create_app` (bool) -> whether to create the ECS app or not. Defaults to false.

- `create_lambda` (bool) -> whether to create the Lambda or not. Defaults to false.

- `create_secrets` (bool) -> whether to create the Secrets Manager or not. Defaults to false.
