data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "root_zone_id" {
  name = "/repo/prm-deductions-base-infra/output/root-zone-id"
}

data "aws_ssm_parameter" "private_zone_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/private-root-zone-id"
}

data "aws_ssm_parameter" "authorization_keys" {
  name = "/repo/${var.environment}/prm-deductions-component-template/user-input/${var.component_name}-authorization-keys"
}

data "aws_ssm_parameter" "gp2gp_authorization_keys" {
  name = "/repo/${var.environment}/prm-deductions-component-template/user-input/gp2gp-adaptor-authorization-keys"
}

data "aws_ssm_parameter" "db-username" {
  name = "/repo/${var.environment}/prm-deductions-base-infra/user-input/state-db-username"
}

data "aws_ssm_parameter" "db-password" {
  name = "/repo/${var.environment}/prm-deductions-base-infra/user-input/state-db-password"
}

data "aws_ssm_parameter" "rds_endpoint" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/private-rds-endpoint"
}

data "aws_ssm_parameter" "gp2gp_url" {
  name = "/repo/${var.environment}/prm-deductions-gp-to-repo/user-input/gp2gp-adaptor-url"
}

data "aws_ssm_parameter" "deductions_private_ecs_cluster_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-ecs-cluster-id"
}

data "aws_ssm_parameter" "deductions_private_gp_to_repo_sg_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-gp-to-repo-sg-id"
}

data "aws_ssm_parameter" "deductions_private_private_subnets" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-private-subnets"
}

data "aws_ssm_parameter" "deductions_private_vpc_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/private-vpc-id"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpl_arn" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-int-alb-httpl-arn"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpsl_arn" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-int-alb-httpsl-arn"
}

data "aws_ssm_parameter" "deductions_private_alb_internal_dns" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-alb-internal-dns"
}
