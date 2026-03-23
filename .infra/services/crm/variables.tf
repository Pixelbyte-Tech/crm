variable "private_subnets" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "private_sg_id" {
  description = "Private security group ID"
  type        = string
}

variable "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "service_discovery_arn" {
  description = "Service discovery namespace ARN"
  type        = string
}

variable "secrets_manager_arn" {
  description = "Secrets Manager ARN"
  type        = string
}

variable "aws_lb_target_group" {
  description = "Target group ARN for the service"
  type        = string
}

variable "redis_host" {
  description = "Redis host"
  type        = string
}

variable "redis_port" {
  description = "Redis port"
  type        = string
}

variable "rds_address" {
  description = "RDS address"
  type        = string
}

variable "rds_port" {
  description = "RDS port"
  type        = string
}