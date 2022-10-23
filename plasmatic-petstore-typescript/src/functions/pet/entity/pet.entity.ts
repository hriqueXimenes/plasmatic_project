import { PET_STATUS } from "../enum/pet-status.enum";
import { v4 } from "uuid";

export class Pet {
    id: string;
    name: string;
    status: PET_STATUS;
    category: string;
    tags: PetTag[];
    createdAt: string;

    constructor(dto:any) {
        Object.assign(this, dto)
    }

    toDynamoDB(tableName:string):any {
        this.createdAt = new Date().toISOString();
        this.id = v4();
        return {
            Item: {...this},
            TableName: tableName
        }
    }
}

export class PetTag {
    key:string
    value:string
}