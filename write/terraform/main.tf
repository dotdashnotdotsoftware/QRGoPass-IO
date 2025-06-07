data "archive_file" "lambda" {
  type        = "zip"
  output_path = "${path.root}/lambda.zip"
  source_file = "${path.root}/../../src/index.js"
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "${local.service}-iam-for-lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_lambda_function" "lambda" {
  filename      = data.archive_file.lambda.output_path
  function_name = "${local.service}-lambda-function"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "index.handler"
  memory_size   = 128
  reserved_concurrent_executions = 3

  source_code_hash = data.archive_file.lambda.output_base64sha256

  runtime = "nodejs${var.major_node_version}.x"

  environment {
    variables = {
        TABLE_NAME = "QRGoTransfer"
    }
  }
}

resource "aws_cloudwatch_log_group" "example" {
  name              = "/aws/lambda/${resource.aws_lambda_function.lambda.function_name}"
  retention_in_days = 1
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:PutItem"
    ]

    resources = [data.aws_dynamodb_table.transfer_table.arn]
  }
}

data "aws_dynamodb_table" "transfer_table" {
  name = "QRGoTransfer"
}

resource "aws_iam_policy" "lambda_permissions" {
  name        = "${local.service}-lambda-policy"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.lambda_permissions.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_permissions.arn
}