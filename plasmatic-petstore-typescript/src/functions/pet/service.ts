import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import { CreatePetDTO } from "./dto/create-pet.dto";
import { Pet } from "./entity/pet.entity";
import * as dotenv from 'dotenv';
import { v4 } from "uuid";

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

    async createPet(dto:CreatePetDTO): Promise<Pet> {

        const newPet = dto as Pet;
        newPet.id = v4();
        newPet.createdAt = new Date().toISOString()

        await this.dynamoDb.put({
            TableName: this.tableName,
            Item: dto
        }).promise();
        
        return dto as Pet;
    }
}