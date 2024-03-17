resource "aws_secretsmanager_secret" "openai_key" {
  count       = var.create_secrets ? 1 : 0
  name        = "openai_api_key_2024_01_30"
  description = "OpenAI API Key"
}

resource "aws_secretsmanager_secret_version" "openai_key" {
  count         = var.create_secrets ? 1 : 0
  secret_id     = aws_secretsmanager_secret.openai_key.id
  secret_string = var.openai_api_key
}

resource "aws_secretsmanager_secret" "db_password" {
  count       = var.create_secrets ? 1 : 0
  name        = "postgresql_password_2024_01_30"
  description = "PostgreSQL Password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  count         = var.create_secrets ? 1 : 0
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}
