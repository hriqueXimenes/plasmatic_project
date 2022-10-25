import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import * as dotenv from 'dotenv';
import { v4 } from "uuid";
import { Order } from "./entity/order.entity";
import { CreateOrderDTO } from "./dto/create-order";
import { ORDER_STATUS } from "./constants";
import { PetService } from "../../functions/pet/service";
import { OrderRO } from "./ro/order.ro";
import { HttpCode, PatternResult } from "../../libs/api-gateway";
import { ORDER_ERROR, PET_ERROR } from "../../errors";
import { LoggerService } from "../../libs/log";


dotenv.config()
export class OrderService {

    private petService: PetService;
    private tableNameOrders: string;
    private dynamoDb: DocumentClient;

    constructor() {
        this.petService = new PetService()
        this.tableNameOrders = "orders"
        this.dynamoDb = dynamoDBClient()
    }

    async fetchOrder(id: string): Promise<PatternResult> {

        try {
            var params = {
                TableName: this.tableNameOrders,
            };

            params["FilterExpression"] = "#id = :id and attribute_not_exists(#deletedAt)";
            params["ExpressionAttributeNames"] = {
                "#id": "id",
                "#deletedAt": "deletedAt",
            }
            params["ExpressionAttributeValues"] = { ":id": id }

            const orders = await this.dynamoDb.scan(params).promise()
            if (orders.Items?.length == 0) {
                return new PatternResult(HttpCode.BAD_REQUEST, ORDER_ERROR.ORDER_NOT_FOUND);
            }

            return new PatternResult(HttpCode.SUCCESSFULLY, new OrderRO(orders.Items as Order[]));
        } catch (error) {
            LoggerService.error("Error to fetch order", error)
            return new PatternResult(HttpCode.EXCEPTION, ORDER_ERROR.ORDER_EXCEPTION);
        }
    }

    async createOrder(dto: CreateOrderDTO): Promise<PatternResult> {

        try {
            const newOrders: Order[] = [];
            const orderId = v4();
            for (let i = 0; i < dto.products.length; i++) {
                const pet = (await this.petService.fetchPet(dto.products[i].petid)).getBody()
                if (!pet) {
                    return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_NOT_FOUND + ` - petid: ${dto.products[i].petid}`);
                }

                const newOrder = new Order(dto.products[i]);

                newOrder.createdAt = new Date().toISOString();
                newOrder.status = ORDER_STATUS.PLACED;
                newOrder.quantity = dto.products[i].quantity;
                newOrder.id = orderId;
                newOrders.push(newOrder)
            }

            const paramOrder = {
                RequestItems: {
                    [this.tableNameOrders]: newOrders.map(item => ({
                        PutRequest: {
                            Item: item
                        }
                    }))
                }
            }

            await this.dynamoDb.batchWrite(paramOrder).promise()

            return new PatternResult(HttpCode.SUCCESSFULLY, new OrderRO(newOrders));
        }
        catch (error) {
            LoggerService.error("Error to create orders", error)
            return new PatternResult(HttpCode.EXCEPTION, ORDER_ERROR.ORDER_EXCEPTION);
        }
    }

    async deleteOrder(id: string): Promise<PatternResult> {
        try {
            const oldOrder = (await this.fetchOrder(id)).getBody();
            if (!oldOrder || !oldOrder.products) {
                return new PatternResult(HttpCode.BAD_REQUEST, ORDER_ERROR.ORDER_NOT_FOUND);
            }

            oldOrder.deletedAt = new Date().toISOString()
            oldOrder.status = ORDER_STATUS.CANCELED
            for (let i = 0; i < oldOrder.products.length; i++) {
                const deleteOrder = {
                    deletedAt: oldOrder.deletedAt,
                    status: oldOrder.status
                }

                const params = {
                    TableName: this.tableNameOrders,
                    Key: { id: oldOrder.id, petid: oldOrder.products[i].petid },
                    UpdateExpression: 'set ' + Object.keys(deleteOrder).map(k => `#${k} = :${k}`).join(', '),
                    ExpressionAttributeNames: Object.entries(deleteOrder).reduce((acc, cur) => ({ ...acc, [`#${cur[0]}`]: cur[0] }), {}),
                    ExpressionAttributeValues: Object.entries(deleteOrder).reduce((acc, cur) => ({ ...acc, [`:${cur[0]}`]: cur[1] }), {}),
                    ReturnValues: "ALL_NEW"
                }

                await this.dynamoDb.update(params).promise();
            }

            return new PatternResult(HttpCode.SUCCESSFULLY, oldOrder);
        } catch (error) {
            LoggerService.error("Error to delete order", error)
            return new PatternResult(HttpCode.EXCEPTION, ORDER_ERROR.ORDER_EXCEPTION);
        }
    }

    getTableName() {
        return this.tableNameOrders
    }
}