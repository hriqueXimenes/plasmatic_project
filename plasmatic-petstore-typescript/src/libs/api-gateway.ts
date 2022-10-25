import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>


export enum HttpCode {
  SUCCESSFULLY = 200,
  BAD_REQUEST = 400,
  EXCEPTION = 500,
  NOT_FOUND = 404
}

export class PatternResult {
  private statusCode: HttpCode;
  private body: any;

  constructor(statusCode:HttpCode, body:any) {
    this.statusCode = statusCode;
    this.body = body;
  }

  toJSON() {
    let body = this.body
    if (this.statusCode != HttpCode.SUCCESSFULLY) {
      body = {
        code: this.statusCode,
        msg: this.body
      }
    }

    return {
      statusCode: this.statusCode,
      body: JSON.stringify(body)
    }
  }

  getBody() {
    if (this.statusCode != HttpCode.SUCCESSFULLY) {
      return undefined;
    }

    return this.body;
  }
}

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: HttpCode.SUCCESSFULLY,
    body: JSON.stringify(response)
  }
}

export const formatJSONError = (msg:string) => {
  return {
    statusCode: HttpCode.BAD_REQUEST,
    body: JSON.stringify({
      code:HttpCode.SUCCESSFULLY,
      message: msg
    })
  }
}

export const formatJSONException = () => {
  return {
    statusCode: HttpCode.EXCEPTION,
    body: null
  }
}
