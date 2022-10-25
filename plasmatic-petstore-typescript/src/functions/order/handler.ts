import { formatJSONError } from '@libs/api-gateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateOrderDTO } from './dto/create-order';
import { ValidateOrderDTO } from './dto/schema';
import { OrderService } from './service';


const orderServicer = new OrderService();

export const fetchOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return formatJSONError("Id parameter is mandatory")
    }

    const order = await orderServicer.fetchOrder(event.pathParameters.id);
    return order.toJSON()
}

export const createOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreateOrderDTO

    const validateError = ValidateOrderDTO(dto, "post").error
    if (validateError) {
        return formatJSONError(validateError.details[0].message)
    }

    const order = await orderServicer.createOrder(dto);
    return order.toJSON();
}

export const deleteOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return formatJSONError("Id parameter is mandatory")
    }

    const order = await orderServicer.deleteOrder(event.pathParameters.id);
    return order.toJSON()
}