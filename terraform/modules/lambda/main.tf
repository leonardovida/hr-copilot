resource "random_string" "r" {
  length  = 16
  special = false
}

# tflint-ignore: terraform_unused_declarations
data "archive_file" "start_ecs" {
  depends_on = [
    random_string.r
  ]

  type             = "zip"
  source_file      = "${path.module}/start_ecs_service/start_ecs_service.py"
  output_file_mode = "0666"
  output_path      = "${path.module}/start_ecs_service/start_ecs_service.zip"
}

# tflint-ignore: terraform_unused_declarations
data "archive_file" "stop_ecs" {
  depends_on = [
    random_string.r
  ]

  type             = "zip"
  source_file      = "${path.module}/stop_ecs_service/stop_ecs_service.py"
  output_file_mode = "0666"
  output_path      = "${path.module}/stop_ecs_service/stop_ecs_service.zip"
}

resource "aws_lambda_function" "stop_ecs_service" {
  filename      = "${path.module}/stop_ecs_service/stop_ecs_service.zip"
  function_name = "stop_ecs_service"
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "stop_ecs_service.lambda_handler"
  runtime       = "python3.12"
  description   = "Stop the ECS service"
}

resource "aws_lambda_function" "start_ecs_service" {
  filename      = "${path.module}/start_ecs_service/start_ecs_service.zip"
  function_name = "start_ecs_service"
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "start_ecs_service.lambda_handler"
  runtime       = "python3.12"
  description   = "Start the ECS service"
}

# STOP
resource "aws_cloudwatch_event_rule" "stop_ecs_service_schedule" {
  name                = "stop_ecs_service_schedule"
  schedule_expression = "cron(0 20 * * ? *)" # This runs every day at 20.00 UTC
}

resource "aws_cloudwatch_event_target" "stop_ecs_service_target" {
  rule      = aws_cloudwatch_event_rule.stop_ecs_service_schedule.name
  target_id = "stopEcsService"
  arn       = aws_lambda_function.stop_ecs_service.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_stop_ecs_service" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stop_ecs_service.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.stop_ecs_service_schedule.arn
}

# START
resource "aws_cloudwatch_event_rule" "start_ecs_service_schedule" {
  name                = "start_ecs_service_schedule"
  schedule_expression = "cron(0 6 * * ? *)" # This runs every day at 6.00 UTC
}

resource "aws_cloudwatch_event_target" "start_ecs_service_target" {
  rule      = aws_cloudwatch_event_rule.start_ecs_service_schedule.name
  target_id = "startEcsService"
  arn       = aws_lambda_function.start_ecs_service.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_start_ecs_service" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.start_ecs_service.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.start_ecs_service_schedule.arn
}
