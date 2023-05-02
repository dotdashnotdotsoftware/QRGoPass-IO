resource "aws_api_gateway_rest_api" "api" {
  name        = "QRGoPassWrite"
  description = "The API for the app"
}

module "options" {
  source = "./options"

  api_id = aws_api_gateway_rest_api.api.id
  root_resource_id = aws_api_gateway_rest_api.api.root_resource_id
  response_name = aws_api_gateway_model.empty_response.name
}

module "get" {
  source = "./get"

  api_id = aws_api_gateway_rest_api.api.id
  root_resource_id = aws_api_gateway_rest_api.api.root_resource_id
  response_name = aws_api_gateway_model.empty_response.name
}

module "post" {
  source = "./post"

  api_id = aws_api_gateway_rest_api.api.id
  root_resource_id = aws_api_gateway_rest_api.api.root_resource_id
  empty_response_name = aws_api_gateway_model.empty_response.name
  data_response_name = aws_api_gateway_model.data_update.name
}

resource "aws_api_gateway_model" "data_update" {
  rest_api_id  = aws_api_gateway_rest_api.api.id
  name         = "DataUpdate"
  description  = "Data update model"
  content_type = "application/json"

  schema = jsonencode({
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "DataUpdateModel",
    "type": "object",
    "properties": {
        "UUID": { "type": "string" },
        "V": { "type": "integer" },
        "Data": { "type": "object" }
    }
})
}

resource "aws_api_gateway_model" "empty_response" {
  rest_api_id  = aws_api_gateway_rest_api.api.id
  name         = "Empty"
  description  = "This is a default empty schema model"
  content_type = "application/json"

  schema = jsonencode({
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title" : "Empty Schema",
  "type" : "object"
})
}

// Pretty sure I can remove this in the future...
resource "aws_api_gateway_model" "error_response" {
  rest_api_id  = aws_api_gateway_rest_api.api.id
  name         = "Error"
  description  = "This is a default error schema model"
  content_type = "application/json"

  schema = jsonencode({
  "$schema" : "http://json-schema.org/draft-04/schema#",
  "title" : "Error Schema",
  "type" : "object",
  "properties" : {
    "message" : { "type" : "string" }
  }
})
}