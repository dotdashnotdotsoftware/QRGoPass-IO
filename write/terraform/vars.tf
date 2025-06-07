variable "environment" {
  type = string
}

variable "major_node_version" {
  type = string
}

locals {
  service = "qrgopass-write"
}