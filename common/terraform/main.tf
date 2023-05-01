resource "aws_api_gateway_rest_api" "api" {
  name        = "QRGoPassWrite"
  description = "The API for the app"
}

resource "aws_api_gateway_method" "post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_rest_api.api.root_resource_id
  http_method   = "POST"
  authorization = "NONE"

  request_models = {
    "application/json" = aws_api_gateway_model.data_update.name
  }

  request_validator_id = aws_api_gateway_request_validator.request_validator.id
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

resource "aws_api_gateway_request_validator" "request_validator" {
  name = "Validate body"
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  validate_request_body = true
  validate_request_parameters = false
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_rest_api.api.root_resource_id
  http_method = aws_api_gateway_method.post.http_method
  status_code = "200"

  response_models = {
    "application/json" = aws_api_gateway_model.empty_response.name
  }
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

resource "aws_api_gateway_integration" "post_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_rest_api.api.root_resource_id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS"

  // TODO, investigate usage of AWS_PROXY instead once I have the flexibility to manage multiple envs
  cache_key_parameters    = tolist([])
  cache_namespace         = aws_api_gateway_rest_api.api.root_resource_id
  content_handling        = "CONVERT_TO_TEXT"
  passthrough_behavior    = "WHEN_NO_MATCH"

  uri                     = data.aws_lambda_function.read_lambda.invoke_arn
}

data "aws_lambda_function" "read_lambda" {
  function_name = "qrgopass-write-lambda-function"
}

resource "aws_api_gateway_integration_response" "post_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_rest_api.api.root_resource_id
  http_method = aws_api_gateway_method.post.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code

  response_templates = {
    "application/json" = ""
  }
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