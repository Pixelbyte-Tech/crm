## Service Module Declarations
## Each service is a separate module for better organization
##################################################################


## Bull Monitor Service
module "bull_monitor" {
  source = "./services/bull-monitor"

  private_subnets = module.vpc.private_subnets

  private_sg_id               = aws_security_group.private_sg.id
  ecs_cluster_arn             = aws_ecs_cluster.cluster.arn
  ecs_task_execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  service_discovery_arn       = aws_service_discovery_service.bull_monitor.arn
  secrets_manager_arn         = aws_secretsmanager_secret.secrets.arn

  aws_lb_target_group = aws_lb_target_group.bull_monitor_tg.arn

  redis_host                  = aws_elasticache_cluster.redis.cache_nodes.0.address
  redis_port                  = aws_elasticache_cluster.redis.cache_nodes.0.port
}

## CRM Service
module "crm" {
  source = "./services/crm"

  private_subnets = module.vpc.private_subnets

  private_sg_id               = aws_security_group.private_sg.id
  ecs_cluster_arn             = aws_ecs_cluster.cluster.arn
  ecs_task_execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  service_discovery_arn       = aws_service_discovery_service.crm.arn
  secrets_manager_arn         = aws_secretsmanager_secret.secrets.arn

  aws_lb_target_group = aws_lb_target_group.crm_tg.arn

  redis_host                  = aws_elasticache_cluster.redis.cache_nodes.0.address
  redis_port                  = aws_elasticache_cluster.redis.cache_nodes.0.port
  rds_address                 = aws_db_instance.postgres.address
  rds_port                    = aws_db_instance.postgres.port
}
