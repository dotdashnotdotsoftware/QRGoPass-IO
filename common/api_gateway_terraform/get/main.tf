resource "aws_api_gateway_method" "get" {
  rest_api_id   = var.api_id
  resource_id   = var.root_resource_id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters   = {
    "method.request.querystring.UUID" = true
  }

  request_validator_id = aws_api_gateway_request_validator.request_validator.id
}

resource "aws_api_gateway_request_validator" "request_validator" {
  name = "Validate query string parameters and headers"
  rest_api_id = "${var.api_id}"
  validate_request_body = false
  validate_request_parameters = true
}

resource "aws_api_gateway_integration" "get_integration" {
  rest_api_id             = var.api_id
  resource_id             = var.root_resource_id
  http_method             = aws_api_gateway_method.get.http_method
  integration_http_method = "POST"
  type                    = "AWS"

  request_templates       = {
    "application/json" = jsonencode(
      {
        UUID = "$input.params('UUID')"
      }
    )
  }

  // TODO, investigate usage of AWS_PROXY instead once I have the flexibility to manage multiple envs
  cache_key_parameters    = tolist([])
  cache_namespace         = var.root_resource_id
  content_handling        = "CONVERT_TO_TEXT"
  passthrough_behavior    = "WHEN_NO_MATCH"

  uri                     = data.aws_lambda_function.read_lambda.invoke_arn
}

data "aws_lambda_function" "read_lambda" {
  function_name = "qrgopass-read-lambda-function"
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = var.api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.get.http_method
  status_code = "200"

  response_models = {
    "application/json" = var.response_name
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = false
  }
}

resource "aws_api_gateway_integration_response" "get_integration_response" {
  rest_api_id = var.api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.get.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code

  response_templates = {
    "application/json" = ""
  }

  response_parameters = {
    // TODO, implement CORS properly
    //"method.response.header.Access-Control-Allow-Origin" = "'https://www.qrgopass.com'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = data.aws_lambda_function.read_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.id}:${var.api_id}/*/${aws_api_gateway_method.get.http_method}/"
}