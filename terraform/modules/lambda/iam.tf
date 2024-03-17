data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com", "ecs.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "iam_policy_for_lambda" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "ecs:*"
    ]

    resources = [
      "arn:aws:logs:*:*:*",
      "arn:aws:ecs:*:*:*"
    ]

    effect = "Allow"
  }
}

resource "aws_iam_role" "lambda_execution_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json

  inline_policy {
    name   = "aws_iam_policy_for_terraform_aws_lambda_role"
    policy = data.aws_iam_policy_document.iam_policy_for_lambda.json
  }
}
