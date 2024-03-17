# Lambda functions to close and startup the ECS cluster
# currently used to reduce $ spent
module "lambda" {
  count  = var.create_lambda ? 1 : 0
  source = "./modules/lambda"
}
