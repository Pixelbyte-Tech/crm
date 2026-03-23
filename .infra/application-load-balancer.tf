## Application Load Balancer
##################################################################

resource "aws_lb" "alb" {
  name               = "crm-${local.env}-alb"
  load_balancer_type = "application"
  subnets            = module.vpc.public_subnets
  security_groups    = [aws_security_group.private_sg.id]

  tags = {
    project = "crm-${local.env}"
  }
}

## Listeners
##################################################################

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn    = aws_acm_certificate_validation.crm_cert.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_listener" "analytics" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 4000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.analytics_tg.arn
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_listener" "bull_monitor" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 8091
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.bull_monitor_tg.arn
  }

  tags = {
    project = "crm-${local.env}"
  }
}

## Target Groups
##################################################################

resource "aws_lb_target_group" "analytics_tg" {
  name        = "crm-${local.env}-analytics-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/readyz"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "crm_tg" {
  name        = "crm-${local.env}-crm-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health/ping"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "bull_monitor_tg" {
  name        = "crm-${local.env}-bull-monitor-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health/ping"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "compliance_tg" {
  name        = "crm-${local.env}-compliance-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health/ping"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "frontend_tg" {
  name        = "crm-${local.env}-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "gateway_tg" {
  name        = "crm-${local.env}-gateway-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/__health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

resource "aws_lb_target_group" "payment_tg" {
  name        = "crm-${local.env}-payment-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health/ping"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "prop_tg" {
  name        = "crm-${local.env}-prop-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health/ping"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_lb_target_group" "user_tg" {
  name        = "crm-${local.env}-user-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health/ping"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    project = "crm-${local.env}"
  }
}

## ALB Listener Rules
##################################################################

resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

## Certificates
##################################################################

resource "aws_acm_certificate" "crm_cert" {
  domain_name       = local.environment_variables.domain
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${local.environment_variables.domain}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_acm_certificate_validation" "crm_cert" {
  certificate_arn = aws_acm_certificate.crm_cert.arn
}
