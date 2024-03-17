# ALB
output "alb_hostname" {
  value = (
    length(module.alb.aws_alb_dns_name) > 0 ? module.alb.aws_alb_dns_name : null
  )
}
