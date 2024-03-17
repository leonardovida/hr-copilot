module "vpc" {
  count  = var.create_vpc ? 1 : 0
  source = "git::https://github.com/terraform-aws-modules/terraform-aws-vpc.git?ref=26c38a66f12e7c6c93b6a2ba127ad68981a48671" # commit hash of version 5.0.0
  name   = var.name

  cidr                 = local.cidr
  azs                  = local.azs
  public_subnets       = [for k, v in local.azs : cidrsubnet(local.cidr, 8, k)]
  private_subnets      = [for k, v in local.azs : cidrsubnet(local.cidr, 8, k + 10)]
  enable_nat_gateway   = false
  single_nat_gateway   = false
  enable_dns_hostnames = false
  tags                 = local.tags
}
