## ECR Repository
###############################################################################
resource "aws_ecr_repository" "sample" {
  name = local.env == "staging" ? "crm-${local.env}-sample" : "crm-sample"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    project = local.env == "staging" ? "crm-${local.env}" : "project"
  }
}

## Log Group
###############################################################################
resource "aws_cloudwatch_log_group" "sample" {
  name              = "/ecs/crm-${local.env}-sample"
  retention_in_days = 7

  lifecycle {
    prevent_destroy = false
  }

  tags = {
    project = "crm-${local.env}"
  }
}

## Task Definition & Service
###############################################################################
resource "aws_ecs_task_definition" "sample" {
  family                   = "crm-${local.env}-sample"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.env == "staging" ? "256" : "768"
  memory                   = local.env == "staging" ? "512" : "2048"
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_execution_role_arn

  container_definitions = templatefile("services/sample/task.json", {
    aws_region              = "us-east-1"
    image_uri               = "${aws_ecr_repository.sample.repository_url}:latest"
    logs_group              = aws_cloudwatch_log_group.sample.name
    secrets_manager_arn     = var.secrets_manager_arn
    env                     = local.env

    redis_host              = var.redis_host
    redis_port              = var.redis_port
    rds_address             = var.rds_address
    rds_port                = var.rds_port
  })

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_ecs_service" "sample" {
  name            = "sample"
  cluster         = var.ecs_cluster_arn
  task_definition  = aws_ecs_task_definition.sample.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    container_name = "sample"
    container_port = 3000
    target_group_arn = var.aws_lb_target_group
  }

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [var.private_sg_id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = var.service_discovery_arn
    container_name = "sample"
  }

  tags = {
    project = "crm-${local.env}"
  }
}