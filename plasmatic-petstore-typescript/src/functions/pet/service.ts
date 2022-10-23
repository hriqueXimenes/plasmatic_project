import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import { CreatePetDTO } from "./dto/create-pet.dto";
import { Pet } from "./entity/pet.entity";
import * as dotenv from 'dotenv';
import { v4 } from "uuid";
import { UpdatePetDTO } from "./dto/update-pet.dto";
import { FetchPetDTO } from "./dto/fetch-pet";


dotenv.config()
export class PetService {

    private tableNamePets: string;
    private dynamoDb: DocumentClient;

    constructor() {
        this.tableNamePets = "pets"
        this.dynamoDb = dynamoDBClient()
    }

    async fetchPets(dto: FetchPetDTO): Promise<Pet[]> {

        let filterExp = "attribute_not_exists(#deletedAt)"
        let expressionAttr = {
            "#deletedAt": "deletedAt",
        }
        let expressionAttrVal = undefined


        if (dto.status) {
            filterExp = "#status = :status and attribute_not_exists(#deletedAt)"
            expressionAttr["#status"] = "status"
            expressionAttrVal = { ":status": dto.status }
        }

        let params = {
            FilterExpression: filterExp,
            ExpressionAttributeNames: expressionAttr,
            ExpressionAttributeValues: expressionAttrVal,
            TableName: this.tableNamePets,
        };

        const pets = await this.dynamoDb.scan(params).promise()
        return pets.Items as Pet[];
    }

    async fetchPet(id: string): Promise<Pet> {

        var params = {
            TableName: this.tableNamePets,
        };

        params["FilterExpression"] = "#id = :id and attribute_not_exists(#deletedAt)";
        params["ExpressionAttributeNames"] = {
            "#id": "id",
            "#deletedAt": "deletedAt",
        }
        params["ExpressionAttributeValues"] = { ":id": id }

        const pets = await this.dynamoDb.scan(params).promise()
        return pets.Items[0] as Pet;
    }

    async createPet(dto: CreatePetDTO): Promise<Pet> {

        const newPet = new Pet(dto);

        newPet.id = v4();
        newPet.createdAt = new Date().toISOString();

        await this.dynamoDb.put(newPet.toDynamoDB(this.tableNamePets)).promise()

        return newPet;
    }

    async updatePet(dto: UpdatePetDTO): Promise<Pet> {
        try {
            const oldPet = await this.fetchPet(dto.id);
            if (!oldPet) {
                throw Error('pin not found');
            }

            Object.assign(oldPet, dto)
            oldPet.updatedAt = new Date().toISOString();

            delete oldPet.id
            const result = await this.dynamoDb.update({
                TableName: this.tableNamePets,
                Key: { id: dto.id },
                UpdateExpression: 'set ' + Object.keys(oldPet).map(k => `#${k} = :${k}`).join(', '),
                ExpressionAttributeNames: Object.entries(oldPet).reduce((acc, cur) => ({ ...acc, [`#${cur[0]}`]: cur[0] }), {}),
                ExpressionAttributeValues: Object.entries(oldPet).reduce((acc, cur) => ({ ...acc, [`:${cur[0]}`]: cur[1] }), {}),
                ReturnValues: "ALL_NEW"
            }).promise();

            return result.Attributes as Pet;
        } catch (error) {
            throw error;
        }
    }

    async deletePet(id: string): Promise<Pet> {
        try {
            const oldPet = await this.fetchPet(id);
            if (!oldPet) {
                throw Error('pin not found');
            }

            oldPet.deletedAt = new Date().toISOString();
            delete oldPet.id
            const result = await this.dynamoDb.update({
                TableName: this.tableNamePets,
                Key: { id: id },
                UpdateExpression: 'set ' + Object.keys(oldPet).map(k => `#${k} = :${k}`).join(', '),
                ExpressionAttributeNames: Object.entries(oldPet).reduce((acc, cur) => ({ ...acc, [`#${cur[0]}`]: cur[0] }), {}),
                ExpressionAttributeValues: Object.entries(oldPet).reduce((acc, cur) => ({ ...acc, [`:${cur[0]}`]: cur[1] }), {}),
                ReturnValues: "ALL_NEW"
            }).promise();

            return result.Attributes as Pet;
        } catch (error) {
            throw error;
        }
    }
}