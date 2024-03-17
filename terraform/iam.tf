resource "aws_iam_user" "talent_copilot_admin" {
  count = var.environment == "staging" ? 1 : 0
  name  = "talent_copilot_admin"
}

resource "aws_iam_user_policy" "talent_copilot_admin_policy" {
  count = var.environment == "staging" ? 1 : 0
  name  = "talent_copilot_admin-policy"
  user  = aws_iam_user.talent_copilot_admin[0].name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "*"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}
