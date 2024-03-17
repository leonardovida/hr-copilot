module "log_bucket" {
  count   = var.create_alb ? 1 : 0
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.0.1"

  bucket        = "${local.prefix}-logs"
  force_destroy = true

  control_object_ownership = true
  object_ownership         = "ObjectWriter"
  acl                      = "log-delivery-write"

  attach_elb_log_delivery_policy    = true
  attach_lb_log_delivery_policy     = true
  attach_access_log_delivery_policy = true

  access_log_delivery_policy_source_accounts = [data.aws_caller_identity.current.account_id]
  access_log_delivery_policy_source_buckets  = ["arn:aws:s3:::*"]
}


module "bucket_documents" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.0.1"

  bucket = "${local.prefix}-documents"

  acl                      = "private"
  force_destroy            = true
  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = true
  }

  tags = local.tags
}
