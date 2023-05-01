resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.api_id
  resource_id   = var.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_response_200" {
  rest_api_id = var.api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_models = {
    "application/json" = var.response_name
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = var.api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options_response_200.status_code

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    // TODO, implement CORS support
    // "method.response.header.Access-Control-Allow-Origin"  = "'https://www.qrgopass.com'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id             = var.api_id
  resource_id             = var.root_resource_id
  http_method             = aws_api_gateway_method.options.http_method
  type                    = "MOCK"

  request_parameters = {}
  request_templates = {
    "application/json" = jsonencode({"statusCode": 200})
  }

  cache_key_parameters    = tolist([])
  cache_namespace         = var.root_resource_id
  passthrough_behavior    = "WHEN_NO_MATCH"
}