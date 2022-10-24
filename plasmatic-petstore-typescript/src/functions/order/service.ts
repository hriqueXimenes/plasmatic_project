import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import * as dotenv from 'dotenv';
import { v4 } from "uuid";
import { Order } from "./entity/order.entity";
import { CreateOrderDTO } from "./dto/create-order";
import { ORDER_STATUS } from "./constants";
import { PetService } from "@functions/pet/service";
import { OrderRO } from "./ro/order.ro";


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

    async fetchOrder(id: string): Promise<OrderRO> {

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
        return new OrderRO(orders.Items as Order[]);
    }

    async createOrder(dto: CreateOrderDTO): Promise<OrderRO> {

        const newOrders:Order[] = [];
        const orderId = v4();
        for (let i = 0; i < dto.products.length; i++) {
            const pet = await this.petService.fetchPet(dto.products[i].petid)
            if (!pet) {
                throw Error('pet not found');
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

        return new OrderRO(newOrders);
    }

    async deleteOrder(id:string): Promise<OrderRO> {
        try {
            const oldOrder = await this.fetchOrder(id);
            if (!oldOrder || !oldOrder.products) {
                throw Error('order not found');
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

                console.log(params)

                await this.dynamoDb.update(params).promise();
            }

            return oldOrder;
        } catch (error) {
            throw error;
        }
    }
}