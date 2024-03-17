# Basic configuration variables

variable "name" {
  type = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "region" {
  description = "The region to deploy the infrastructure to"
  type        = string
  default     = "eu-west-1"
}

variable "prefix" {
  type    = string
  default = "tc"
}
