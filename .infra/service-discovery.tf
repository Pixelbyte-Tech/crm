## Service Discovery
##################################################################

resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "crm-${local.env}.local"
  description = "Private DNS namespace for CRM services"
  vpc         = module.vpc.vpc_id
}

resource "aws_service_discovery_service" "analytics" {
  name = "analytics"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "crm" {
  name = "broker"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "bull_monitor" {
  name = "bull-monitor"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "compliance" {
  name = "compliance"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "gateway" {
  name = "gateway"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "payment" {
  name = "payment"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "prop" {
  name = "prop"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}

resource "aws_service_discovery_service" "user" {
  name = "user"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  tags = {
    project = "crm-${local.env}"
  }
}