terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.27.0"
    }
  }

  backend "s3" {
    bucket = "inf-management"
    key    = "qrgopass/common-io"
    region = "us-east-2"
  }
}

provider "aws" {
  region     = "us-east-2"
}

module "main" {
  source = "../"

  environment = basename(abspath(path.root))
}