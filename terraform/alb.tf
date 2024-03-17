module "alb" {
  count  = var.create_alb ? 1 : 0
  source = "./modules/alb"

  prefix = local.prefix
  vpc = {
    vpc_id          = module.vpc.vpc_id
    public_subnets  = module.vpc.public_subnets
    private_subnets = module.vpc.private_subnets
  }
  security_group_ids = {
    security_group_lb_id        = aws_security_group.lb.id
    security_group_ecs_tasks_id = aws_security_group.ecs_tasks.id
  }

  health_check_path   = "/api/health"
  alb_tls_cert_arn    = var.alb_tls_cert_arn
  acm_certificate_arn = module.app.acm_certificate_arn
}
