resource "aws_dynamodb_table" "basic-dynamodb-table" {
  name           = "QRGoTransfer"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "UUID"

  attribute {
    name = "UUID"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}