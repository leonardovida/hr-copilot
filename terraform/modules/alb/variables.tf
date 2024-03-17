variable "tags" {
  description = "A map of tags to add to the ALB"
  type        = map(string)
  default     = {}
}

variable "prefix" {
  description = "The prefix for the ALB"
  type        = string
}

variable "alb_tls_cert_arn" {
  description = "The ARN of the TLS certificate to use for the ALB"
  type        = string
}

variable "acm_certificate_arn" {
  description = "The ARN of the ACM certificate to use for the ALB"
  type        = string
}

variable "health_check_path" {
  description = "The path to use for the health check"
  type        = string
}

variable "vpc" {
  type = object({
    vpc_id          = string
    public_subnets  = list(string)
    private_subnets = list(string)
  })
}

variable "security_group_ids" {
  type = object({
    security_group_lb_id        = string
    security_group_ecs_tasks_id = string
  })
}
