variable "aws_region" {
  description = "The AWS region things are created in"
  type        = string
  default     = "eu-west-1"
}

variable "name" {
  type = string
}

variable "prefix" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "security_group_ids" {
  type = object({
    security_group_lb_id        = string
    security_group_ecs_tasks_id = string
  })
}

variable "vpc" {
  type = object({
    vpc_id          = string
    public_subnets  = list(string)
    private_subnets = list(string)
  })
}

# App Variables
variable "app" {
  type = object({
    host_header       = string
    image             = string
    port              = string
    desired_count     = string
    health_check_path = string
    fargate_cpu       = string
    fargate_memory    = string
  })
}

variable "target_groups" {
  type = object({
    aws_alb_target_group_id = string
  })
}

variable "database" {
  type = object({
    password         = string
    database         = string
    user             = string
    instance_address = string
    port             = number
  })
}

variable "openai_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}

variable "fast_api_environment" {
  description = "FastAPI environment"
  type        = string
  default     = "staging"
}

variable "talent_copilot_version" {
  description = "Talent Copilot version"
  type        = string
  default     = "0.1.0"
}

variable "talent_copilot_openai_seed" {
  description = "OpenAI seed"
  type        = string
  default     = "12345"
}

variable "talent_copilot_openai_temperature" {
  description = "OpenAI temperature"
  type        = string
  default     = "0.0"
}

variable "talent_copilot_s3_bucket_name" {
  description = "Talent Copilot S3 bucket name"
  type        = string
  default     = "tc-staging-documents"
}

variable "talent_copilot_aws_access_key_id" {
  description = "Talent Copilot AWS access key id"
  type        = string
}

variable "talent_copilot_aws_secret_access_key" {
  description = "Talent Copilot AWS secret access key"
  type        = string
}
