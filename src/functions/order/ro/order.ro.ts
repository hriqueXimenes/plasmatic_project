import { ORDER_STATUS } from "../constants";
import { Order } from "../entity/order.entity";

export class OrderRO {
    id: string;
    status: ORDER_STATUS;
    products: any;

    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(entity:Order[]) {
        if (entity.length == 0) {
            return
        }

        this.id = entity[0].id;
        this.status = entity[0].status;
        this.products = entity.map(e => ({
            petid: e.petid,
            quantity: e.quantity
        }))
    }
}