import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const HttpCode = {
  Successfully: 400,
  BadRequest: 400,
  Exception: 500
}

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: HttpCode.Successfully,
    body: JSON.stringify(response)
  }
}

export const formatJSONError = (msg:string) => {
  return {
    statusCode: HttpCode.BadRequest,
    body: JSON.stringify({
      code:HttpCode.BadRequest,
      message: msg
    })
  }
}

export const formatJSONException = () => {
  return {
    statusCode: HttpCode.Exception,
    body: null
  }
}
