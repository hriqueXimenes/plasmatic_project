import { PatternResult, HttpCode } from '../../libs/api-gateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateOrderDTO } from './dto/create-order';
import { ValidateOrderDTO } from './dto/schema';
import { OrderService } from './service';
import { ORDER_ERROR } from '../../errors';


const orderServicer = new OrderService();

export const fetchOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, ORDER_ERROR.ORDER_ID_MANDATORY).toJSON()
    }

    const order = await orderServicer.fetchOrder(event.pathParameters.id);
    return order.toJSON()
}

export const createOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreateOrderDTO

    const validateError = ValidateOrderDTO(dto, "post").error
    if (validateError) {
        return new PatternResult(HttpCode.BAD_REQUEST, validateError.details[0].message).toJSON()
    }

    const order = await orderServicer.createOrder(dto);
    return order.toJSON();
}

export const deleteOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, ORDER_ERROR.ORDER_ID_MANDATORY).toJSON()
    }

    const order = await orderServicer.deleteOrder(event.pathParameters.id);
    return order.toJSON()
}