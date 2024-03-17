# security.tf

#tfsec:ignore:no-public-egress-sgr tfsec:ignore:no-public-ingress-sgr
resource "aws_security_group" "lb" {
  count       = var.create_vpc ? 1 : 0
  name        = "${local.prefix}-load-balancer-security-group"
  description = "Access to the ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description      = "Ingress ${var.app_port} access for ALB"
    protocol         = "tcp"
    from_port        = var.app_port
    to_port          = var.app_port
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "Ingress HTTPS access for ALB"
    protocol         = "tcp"
    from_port        = 443
    to_port          = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "Ingress HTTP access for ALB"
    protocol         = "tcp"
    from_port        = 80
    to_port          = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    description      = "Egress access for ALB"
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  tags = local.tags
}

# Traffic to the ECS task should only come from the ALB
#tfsec:ignore:no-public-egress-sgr
resource "aws_security_group" "ecs_tasks" {
  count       = var.create_vpc ? 1 : 0
  name        = "${local.prefix}-ecs-tasks-security-group"
  description = "Allow inbound access from the ALB only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Ingress access for ECS task (but only from ALB)"
    protocol        = "tcp"
    from_port       = var.app_port
    to_port         = var.app_port
    security_groups = [aws_security_group.lb.id]
  }

  # This is needed as the ECS task needs to be able to connect to the internet to pull the docker image
  # To connect to OpenAI, database, etc.
  # TODO:
  egress {
    description      = "Egress access for ECS task"
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  #   egress {
  #   description = "Egress access for ECS task to OpenAI API"
  #   protocol    = "tcp"
  #   from_port   = 0
  #   to_port     = 65535
  #   cidr_blocks = ["api.ip.address/32"] # fill-in
  # }

  # egress {
  #   description     = "Egress access for ECS task to ALB"
  #   protocol        = "tcp"
  #   from_port       = 0
  #   to_port         = 65535
  #   security_groups = [aws_security_group.lb.id]
  # }

  # # Egress access to the Neon.tech server
  # egress {
  #   description = "Egress access for ECS task to PostgreSQL server"
  #   protocol    = "tcp"
  #   from_port   = 5432
  #   to_port     = 5432
  #   cidr_blocks = ["api.ip.address/32"] # fill-in
  # }

  tags = local.tags
}
