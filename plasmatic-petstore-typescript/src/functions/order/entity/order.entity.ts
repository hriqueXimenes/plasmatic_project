import { ORDER_STATUS } from "../constants";

export class Order {
    id: string;
    petid: string;
    quantity: number;
    status: ORDER_STATUS;
    
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(dto:any) {
        Object.assign(this, dto)
    }

    toDynamoDB(tableName:string):any {
        return {
            Item: {...this},
            TableName: tableName
        }
    }
}