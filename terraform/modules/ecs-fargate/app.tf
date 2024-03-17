module "ecr" {
  source   = "../ecr"
  role_arn = aws_iam_role.ecs_task_execution_role.arn
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.app_name
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.app.fargate_cpu
  memory                   = var.app.fargate_memory
  container_definitions    = templatefile("${path.module}/templates/ecs/app.json.tmpl", local.container_variables)

  tags = {
    Version = 0.1
  }
}

resource "aws_ecs_service" "app" {
  name            = local.app_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [var.security_group_ids.security_group_ecs_tasks_id]
    subnets         = var.vpc.private_subnets
  }

  load_balancer {
    target_group_arn = var.target_groups.aws_alb_target_group_id
    container_name   = local.app_name
    container_port   = var.app.port
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution_role
  ]
}

resource "aws_service_discovery_private_dns_namespace" "app" {
  name        = "${local.app_name}.${terraform.workspace}.local"
  description = "${local.app_name} private dns namespace"
  vpc         = var.vpc.vpc_id
}
