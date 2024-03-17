locals {
  certificate_arn = coalesce(var.acm_certificate_arn, var.alb_tls_cert_arn)
}

#tfsec:ignore:aws-elb-alb-not-public
resource "aws_alb" "this" {
  #checkov:skip=CKV2_AWS_20:"Ensure that ALB redirects HTTP requests into HTTPS ones"
  #checkov:skip=CKV2_AWS_28:"Ensure public facing ALB are protected by WAF"
  #checkov:skip=CKV_AWS_91:"Ensure the ELBv2 (Application/Network) has access logging enabled"
  name                       = "${var.prefix}-load-balancer"
  internal                   = false
  load_balancer_type         = "application"
  subnets                    = var.vpc.public_subnets
  security_groups            = [var.security_group_ids.security_group_lb_id]
  idle_timeout               = 600 # 10 minutes
  drop_invalid_header_fields = true
  enable_deletion_protection = false
  tags                       = var.tags
}

resource "aws_alb_target_group" "app" {
  name        = "${var.prefix}-target-group"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }
  tags = var.tags
}

resource "aws_alb_listener" "this" {
  load_balancer_arn = aws_alb.this.id
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = local.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.app.arn
  }
}

resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_alb.this.id
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.app.arn
  }
}
