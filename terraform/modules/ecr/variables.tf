variable "environment" {
  description = "The environment to deploy the infrastructure to"
  type        = string
  default     = "staging"
}

variable "role_arn" {
  description = "The role arn"
  type        = string
}
