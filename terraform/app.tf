module "app" {
  count  = var.create_app ? 1 : 0
  source = "./modules/ecs-fargate"
  name   = local.name
  prefix = local.prefix
  app = {
    host_header       = var.host_header
    image             = var.ecr_image
    port              = var.app_port
    desired_count     = var.app_desired_count
    health_check_path = var.app_health_check_path
    fargate_cpu       = var.app_fargate_cpu
    fargate_memory    = var.app_fargate_memory
  }

  # Networking
  vpc = {
    vpc_id          = module.vpc.vpc_id
    public_subnets  = module.vpc.public_subnets
    private_subnets = module.vpc.private_subnets
  }
  security_group_ids = {
    security_group_lb_id        = aws_security_group.lb.id
    security_group_ecs_tasks_id = aws_security_group.ecs_tasks.id
  }

  target_groups = {
    aws_alb_target_group_id = module.alb.aws_alb_target_group_app_id
  }

  openai_key = data.aws_secretsmanager_secret_version.openai_key.secret_string
  database = {
    password         = var.db_password
    database         = var.db_database
    user             = var.db_user
    instance_address = var.db_instance_address
    port             = var.db_port
  }

  talent_copilot_s3_bucket_name        = module.bucket_documents.s3_bucket_id
  talent_copilot_aws_access_key_id     = var.talent_copilot_aws_access_key_id
  talent_copilot_aws_secret_access_key = var.talent_copilot_aws_secret_access_key

  tags = local.tags
}
