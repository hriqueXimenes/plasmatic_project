import { PET_STATUS } from "../constants";

export class Pet {
    id: string;
    name: string;
    status: PET_STATUS;
    category: string;
    tags: PetTag[];
    images: string[];

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

export class PetTag {
    key:string
    value:string
}