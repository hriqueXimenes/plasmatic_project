import { PatternResult, HttpCode, HttpRequest } from '../../libs/api-gateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateOrderDTO } from './dto/create-order';
import { ValidateOrderDTO } from './dto/schema';
import { OrderService } from './service';
import { ORDER_ERROR } from '../../errors';
import { EVENT } from './constants';
import { LoggerService } from '../../libs/log';


const orderServicer = new OrderService();

export const fetchOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    LoggerService.accessLog(EVENT.FETCH_ORDER_TRIGGERED)

    if (!event.pathParameters?.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, ORDER_ERROR.ORDER_ID_MANDATORY).toJSON()
    }

    return (await orderServicer.fetchOrder(event.pathParameters.id)).toJSON();
}

export const createOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreateOrderDTO
    LoggerService.accessLog(EVENT.CREATE_ORDER_TRIGGERED, dto)

    const validateError = ValidateOrderDTO(dto, HttpRequest.POST).error
    if (validateError) {
        return new PatternResult(HttpCode.BAD_REQUEST, validateError.details[0].message).toJSON()
    }

    return (await orderServicer.createOrder(dto)).toJSON();
}

export const deleteOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    LoggerService.accessLog(EVENT.DELETE_ORDER_TRIGGERED, event.pathParameters?.id)
    if (!event.pathParameters?.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, ORDER_ERROR.ORDER_ID_MANDATORY).toJSON()
    }

    return (await orderServicer.deleteOrder(event.pathParameters?.id)).toJSON();
}