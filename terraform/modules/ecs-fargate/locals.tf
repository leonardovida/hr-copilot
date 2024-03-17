locals {
  app_name = "${var.prefix}-${var.name}"
  container_variables = {
    app_name                             = local.app_name
    app_image                            = var.app.image
    app_port                             = var.app.port
    fargate_cpu                          = var.app.fargate_cpu
    fargate_memory                       = var.app.fargate_memory
    aws_region                           = var.aws_region
    awslogs-group                        = "/ecs/${local.app_name}"
    talent_copilot_environment           = var.fast_api_environment
    talent_copilot_db_instance_address   = var.database.instance_address
    talent_copilot_db_port               = var.database.port
    talent_copilot_db_user               = var.database.user
    talent_copilot_db_pass               = var.database.password
    talent_copilot_db_base               = var.database.database
    talent_copilot_openai_key            = var.openai_key
    talent_copilot_version               = var.talent_copilot_version
    talent_copilot_openai_seed           = var.talent_copilot_openai_seed
    talent_copilot_openai_temperature    = var.talent_copilot_openai_temperature
    talent_copilot_s3_bucket_name        = var.talent_copilot_s3_bucket_name
    talent_copilot_aws_access_key_id     = var.talent_copilot_aws_access_key_id
    talent_copilot_aws_secret_access_key = var.talent_copilot_aws_secret_access_key
  }
}
