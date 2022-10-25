import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoDBClient } from "../../libs/dynamodb";
import { CreatePetDTO } from "./dto/create-pet.dto";
import { Pet } from "./entity/pet.entity";
import * as dotenv from 'dotenv';
import { v4 } from "uuid";
import { UpdatePetDTO } from "./dto/update-pet.dto";
import { FetchPetDTO } from "./dto/fetch-pet";
import { S3 } from "aws-sdk";
import { HttpCode, PatternResult } from "../../libs/api-gateway";
import { PET_ERROR } from "../../errors";


dotenv.config()
export class PetService {

    private tableNamePets: string;
    private dynamoDb: DocumentClient;
    private s3: S3;

    constructor() {
        this.s3 = new S3()
        this.tableNamePets = "pets"
        this.dynamoDb = dynamoDBClient()
    }

    async fetchPets(dto: FetchPetDTO): Promise<PatternResult> {

        try {
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
            return new PatternResult(HttpCode.SUCCESSFULLY, pets.Items as Pet[]);
        } catch (error) {
            return new PatternResult(HttpCode.EXCEPTION, PET_ERROR.PET_EXCEPTION);
        }
    }

    async fetchPet(id: string): Promise<PatternResult> {
        try {
            var params = {
                TableName: this.tableNamePets,
            };

            params["FilterExpression"] = "#id = :id and attribute_not_exists(#deletedAt)";
            params["ExpressionAttributeNames"] = {
                "#id": "id",
                "#deletedAt": "deletedAt",
            }
            params["ExpressionAttributeValues"] = { ":id": id }

            const pet = await this.dynamoDb.scan(params).promise()
            if (pet.Items.length == 0) {
                return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_NOT_FOUND);
            }

            return new PatternResult(HttpCode.SUCCESSFULLY, pet.Items[0] as Pet);

        } catch (error) {
            return new PatternResult(HttpCode.EXCEPTION, PET_ERROR.PET_EXCEPTION);
        }
    }

    async createPet(dto: CreatePetDTO): Promise<PatternResult> {

        try {
            const newPet = new Pet(dto);

            newPet.id = v4();
            newPet.createdAt = new Date().toISOString();

            await this.dynamoDb.put(newPet.toDynamoDB(this.tableNamePets)).promise()
            return new PatternResult(HttpCode.SUCCESSFULLY, newPet);
        } catch (error) {
            return new PatternResult(HttpCode.EXCEPTION, PET_ERROR.PET_EXCEPTION);
        }
    }

    async updatePet(dto: UpdatePetDTO): Promise<PatternResult> {
        try {
            const oldPet = (await this.fetchPet(dto.id)).getBody();

            if (!oldPet) {
                return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_NOT_FOUND);
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

            return new PatternResult(HttpCode.SUCCESSFULLY, result.Attributes as Pet);
        } catch (error) {
            return new PatternResult(HttpCode.EXCEPTION, PET_ERROR.PET_EXCEPTION);
        }
    }

    async deletePet(id: string): Promise<PatternResult> {
        try {
            const oldPet = (await this.fetchPet(id)).getBody();
            if (!oldPet) {
                return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_NOT_FOUND);
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

            return new PatternResult(HttpCode.SUCCESSFULLY, result.Attributes as Pet);
        } catch (error) {
            return new PatternResult(HttpCode.EXCEPTION, PET_ERROR.PET_EXCEPTION);
        }
    }

    async uploadImagePet(filename, data, id: string): Promise<PatternResult> {
        try {
            const oldPet = (await this.fetchPet(id)).getBody();
            if (!oldPet) {
                return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_NOT_FOUND);
            }

            const format = filename.split(".")
            const newFilename = v4() + "." + format[1]
            await this.s3.putObject({ Bucket: "bucket-plasmatic", Key: newFilename, ACL: 'public-read', Body: data, ContentType: "image/png" }).promise();
            if (!oldPet.images) {
                oldPet.images = [];
            }

            oldPet.images.push(newFilename)
            const dto = new UpdatePetDTO();
            dto.id = oldPet.id;
            dto.images = oldPet.images

            await this.updatePet(dto)
            return new PatternResult(HttpCode.SUCCESSFULLY, oldPet);
        } catch (error) {
            return new PatternResult(HttpCode.EXCEPTION, PET_ERROR.PET_EXCEPTION);
        }
    }

    getTableName() {
        return this.tableNamePets
    }
}