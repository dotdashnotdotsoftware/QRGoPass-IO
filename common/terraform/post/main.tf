resource "aws_api_gateway_method" "post" {
  rest_api_id   = var.api_id
  resource_id   = var.root_resource_id
  http_method   = "POST"
  authorization = "NONE"

  request_models = {
    "application/json" = var.data_response_name
  }

  request_validator_id = aws_api_gateway_request_validator.request_validator.id
}

resource "aws_api_gateway_request_validator" "request_validator" {
  name = "Validate body"
  rest_api_id = var.api_id
  validate_request_body = true
  validate_request_parameters = false
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = var.api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.post.http_method
  status_code = "200"

  response_models = {
    "application/json" = var.empty_response_name
  }
}

resource "aws_api_gateway_integration" "post_integration" {
  rest_api_id             = var.api_id
  resource_id             = var.root_resource_id
  http_method             = aws_api_gateway_method.post.http_method
  integration_http_method = "POST"
  type                    = "AWS"

  // TODO, investigate usage of AWS_PROXY instead once I have the flexibility to manage multiple envs
  cache_key_parameters    = tolist([])
  cache_namespace         = var.root_resource_id
  content_handling        = "CONVERT_TO_TEXT"
  passthrough_behavior    = "WHEN_NO_MATCH"

  uri                     = data.aws_lambda_function.read_lambda.invoke_arn
}

data "aws_lambda_function" "read_lambda" {
  function_name = "qrgopass-write-lambda-function"
}

resource "aws_api_gateway_integration_response" "post_integration_response" {
  rest_api_id = var.api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.post.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code

  response_templates = {
    "application/json" = ""
  }
}