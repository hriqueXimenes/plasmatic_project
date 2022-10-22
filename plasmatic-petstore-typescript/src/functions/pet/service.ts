import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import { Pet } from "./entity/pet.entity";
import * as dotenv from 'dotenv';

dotenv.config()
export class PetService {

    private tableName:string;
    private dynamoDb:DocumentClient;

    constructor() { 
        this.tableName = process.env.DYNAMO_TABLE_PETS
        this.dynamoDb = dynamoDBClient()
    }
    
    async fetchPets(): Promise<Pet[]> {
        const pets = await this.dynamoDb.scan({
            TableName: this.tableName,
        }).promise()
        
        return pets.Items as Pet[];
    }
}