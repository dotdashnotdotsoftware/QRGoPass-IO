terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.99.1"
    }
  }

  backend "s3" {
    bucket = "inf-management"
    key    = "qrgopass/read-lambda"
    region = "us-east-2"
  }
}

provider "aws" {
  region     = "us-east-2"
}

module "main" {
  source = "../"

  environment = basename(abspath(path.root))
  major_node_version = module.mmp.major
}

module "test" {
  source = "../../../scratch-space/terraform/read-env-file"

  env_path = "../../.devcontainer/.env"
}

module "mmp" {
  source = "../../../scratch-space/terraform/major-minor-patch"

  version_string = module.test.env_object.NODE_VERSION
}