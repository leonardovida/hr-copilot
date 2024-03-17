locals {
  region      = var.region
  name        = var.name
  environment = var.environment
  prefix      = "${var.prefix}-${local.environment}"

  # VPC
  cidr = "10.0.0.0/16"
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)

  # Tags
  tags = {
    Name        = local.name
    Workspace   = terraform.workspace
    Author      = data.aws_caller_identity.current.id
    Environment = local.environment
  }
}
