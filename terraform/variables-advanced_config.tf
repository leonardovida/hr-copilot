# Configuration variables also used in the basic configuration setup
# but only not to enable certain modules

variable "create_vpc" {
  type    = bool
  default = false
}

variable "create_alb" {
  type    = bool
  default = false
}

variable "create_app" {
  type    = bool
  default = false
}

variable "create_lambda" {
  type    = bool
  default = false
}

variable "create_secrets" {
  type    = bool
  default = false
}


# ECR variables

variable "ecr_image" {
  type = string
}

variable "host_header" {
  type    = string
  default = "dbc-cv-copilot.vercel.app"
}

variable "app_port" {
  type = number
}

variable "app_desired_count" {
  type    = string
  default = "1"
}

variable "app_health_check_path" {
  type    = string
  default = "/api/health"
}

variable "app_fargate_cpu" {
  type    = string
  default = "256"
}

variable "app_fargate_memory" {
  type    = string
  default = "512"
}

variable "alb_tls_cert_arn" {
  description = "(Optional) The ARN of the certificate that the ALB uses for https"
  type        = string
  default     = ""
}

# Secrets

variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  default     = ""
}

variable "db_password" {
  description = "DB password"
  type        = string
  sensitive   = true
}

# AWS
variable "talent_copilot_aws_access_key_id" {
  description = "AWS access key id"
  type        = string
  sensitive   = true
}

variable "talent_copilot_aws_secret_access_key" {
  description = "AWS secret access key"
  type        = string
  sensitive   = true
}

# Database variables

variable "db_instance_address" {
  description = "DB instance address"
  type        = string
}

variable "db_user" {
  description = "DB user"
  type        = string
}

variable "db_database" {
  description = "DB database"
  type        = string
}

variable "db_port" {
  description = "DB port"
  type        = number
  default     = 5432
}
