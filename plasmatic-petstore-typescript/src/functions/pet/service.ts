import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import { CreatePetDTO } from "./dto/create-pet.dto";
import { Pet } from "./entity/pet.entity";
import * as dotenv from 'dotenv';


dotenv.config()
export class PetService {

    private tableNamePets: string;
    private dynamoDb: DocumentClient;

    constructor() {
        this.tableNamePets = "pets"
        this.dynamoDb = dynamoDBClient()
    }

    async fetchPets(): Promise<Pet[]> {
        const pets = await this.dynamoDb.scan({
            TableName: this.tableNamePets,
        }).promise()

        return pets.Items as Pet[];
    }

    async createPet(dto: CreatePetDTO): Promise<Pet> {

        const newPet = new Pet(dto);
        const transactionItem = [
        {
            Put: newPet.toDynamoDB(this.tableNamePets)
        }]

        await this.dynamoDb.transactWrite({
            TransactItems: transactionItem,
        }).promise()

        return newPet;
    }
}