output "aws_alb_target_group_app_id" {
  value = aws_alb_target_group.app.id
}

output "aws_alb_id" {
  value = aws_alb.this.id
}

output "aws_alb_dns_name" {
  value = aws_alb.this.dns_name
}
