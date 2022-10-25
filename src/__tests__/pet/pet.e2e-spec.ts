import { PetService } from "../../functions/pet/service";
import { HttpCode, PatternResult } from "../../libs/api-gateway";
import { v4 } from "uuid";
import { dynamoDB } from "../../libs/dynamodb";
import { PET_ERROR } from "../../errors";
import { PET_STATUS } from "../../functions/pet/constants";
import { Pet } from "../../functions/pet/entity/pet.entity";
import { UpdatePetDTO } from "../../functions/pet/dto/update-pet.dto";

describe('Fetch Pets', () => {
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;
    let petCreatedForTest: Pet;

    beforeAll(async () => {
        petService = new PetService();
        dynamoTestDb = dynamoDB()

        const petTable = {
            TableName: petService.getTableName(),
            KeySchema: [ 
                {
                    AttributeName: 'id',
                    KeyType: 'HASH',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S',
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, 
                WriteCapacityUnits: 1, 
            }
        };

        await dynamoTestDb.deleteTable({TableName: petService.getTableName()})
        await dynamoTestDb.waitFor('tableNotExists', {TableName: petService.getTableName()}, async function() {
            await dynamoTestDb.createTable(petTable).promise()
        });
        
        petCreatedForTest = (await petService.createPet({
            name: "test",
            status: PET_STATUS.AVAILABLE,
            category: "test",
            tags: [{ key:"test", value:"test" }]
        })).getBody() as Pet
    })

    it('should receive a 400 code -> Not find PetID', async() => {
        let result = await petService.fetchPet(v4())
        expect(result.getCode()).toEqual(HttpCode.BAD_REQUEST);
        expect(JSON.parse(result.toJSON().body).msg).toEqual(PET_ERROR.PET_NOT_FOUND);
    })

    it('should receive a 200 code -> When find a pet', async() => {
        let result = await petService.fetchPet(petCreatedForTest.id)
        expect(result.getCode()).toEqual(HttpCode.SUCCESSFULLY);
        expect(JSON.parse(result.toJSON().body) as Pet).toEqual(petCreatedForTest);
    })

    it('should receive a 500 code -> When have internal issue', async() => {
        let result:PatternResult;
        await dynamoTestDb.waitFor('tableNotExists', {TableName: petService.getTableName()}, async function() {
            result = await petService.fetchPet(petCreatedForTest.id)
        });

        expect(result).toBeUndefined();
    })
})

describe('Insert Pets', () => {
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;

    beforeAll(async () => {
        petService = new PetService();
        dynamoTestDb = dynamoDB()

        const petTable = {
            TableName: petService.getTableName(),
            KeySchema: [ 
                {
                    AttributeName: 'id',
                    KeyType: 'HASH',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S',
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, 
                WriteCapacityUnits: 1, 
            }
        };

        await dynamoTestDb.deleteTable({TableName: petService.getTableName()})
        await dynamoTestDb.waitFor('tableNotExists', {TableName: petService.getTableName()}, async function() {
            await dynamoTestDb.createTable(petTable).promise()
        });
    })

    it('should receive a 200 code -> Created Successfully', async() => {
        let result = await petService.createPet({
            name: "test",
            status: PET_STATUS.AVAILABLE,
            category: "test",
            tags: [{ key:"test", value:"test" }]
        })

        expect(result.getCode()).toEqual(HttpCode.SUCCESSFULLY);
        expect(result.getBody().id !== undefined).toBe(true)

        // -> Check if was inserted correctly.
        let checkCreation = await (await petService.fetchPet(result.getBody().id)).getBody() as Pet
        expect(result.getBody() as Pet).toEqual(checkCreation)
    })

    it('should receive a 500 code -> When have internal issue', async() => {
        let result:PatternResult;
        await dynamoTestDb.waitFor('tableNotExists', {TableName: petService.getTableName()}, async function() {
            result = await petService.createPet({
                name: "test",
                status: PET_STATUS.AVAILABLE,
                category: "test",
                tags: [{ key:"test", value:"test" }]
            })
        });

        expect(result).toBeUndefined();
    })
})

describe('Update Pets', () => {
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;

    beforeAll(async () => {
        petService = new PetService();
        dynamoTestDb = dynamoDB()

        const petTable = {
            TableName: petService.getTableName(),
            KeySchema: [ 
                {
                    AttributeName: 'id',
                    KeyType: 'HASH',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S',
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, 
                WriteCapacityUnits: 1, 
            }
        };

        await dynamoTestDb.deleteTable({TableName: petService.getTableName()})
        await dynamoTestDb.waitFor('tableNotExists', {TableName: petService.getTableName()}, async function() {
            await dynamoTestDb.createTable(petTable).promise()
        });
    })

    it('should receive a 200 code -> Updated Successfully', async() => {
        const result = (await petService.createPet({
            name: "test",
            status: PET_STATUS.AVAILABLE,
            category: "test",
            tags: [{ key:"test", value:"test" }]
        })).getBody() as Pet
        
        const updateResult = new UpdatePetDTO()
        updateResult.name = "tests"
        updateResult.id = result.id
        const resultUpdate = (await petService.updatePet(updateResult))

        expect(resultUpdate.getCode()).toEqual(HttpCode.SUCCESSFULLY);
        expect(resultUpdate.getBody().name).toEqual(updateResult.name)
    })

    it('should receive a 400 code -> Not find PetID', async() => {
        const updateResult = new UpdatePetDTO()
        updateResult.name = "tests"
        updateResult.id = v4();
        const resultUpdate = (await petService.updatePet(updateResult))

        expect(resultUpdate.getCode()).toEqual(HttpCode.BAD_REQUEST);

        expect(JSON.parse(resultUpdate.toJSON().body).msg).toEqual(PET_ERROR.PET_NOT_FOUND);
    })
})

describe('Delete Pets', () => {
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;

    beforeAll(async () => {
        petService = new PetService();
        dynamoTestDb = dynamoDB()

        const petTable = {
            TableName: petService.getTableName(),
            KeySchema: [ 
                {
                    AttributeName: 'id',
                    KeyType: 'HASH',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S',
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, 
                WriteCapacityUnits: 1, 
            }
        };

        await dynamoTestDb.deleteTable({TableName: petService.getTableName()})
        await dynamoTestDb.waitFor('tableNotExists', {TableName: petService.getTableName()}, async function() {
            await dynamoTestDb.createTable(petTable).promise()
        });
    })

    it('should receive a 200 code -> Deleted Successfully', async() => {
        const result = (await petService.createPet({
            name: "test",
            status: PET_STATUS.AVAILABLE,
            category: "test",
            tags: [{ key:"test", value:"test" }]
        })).getBody() as Pet

        let checkResponse = await petService.fetchPet(result.id)
        expect(checkResponse.getCode()).toEqual(HttpCode.SUCCESSFULLY);

        await petService.deletePet(result.id)

        checkResponse = await petService.fetchPet(result.id)
        expect(checkResponse.getCode()).toEqual(HttpCode.BAD_REQUEST);
    })

    it('should receive a 400 code -> Not find PetID', async() => {
        const resultUpdate = await petService.deletePet(v4())
        expect(resultUpdate.getCode()).toEqual(HttpCode.BAD_REQUEST);
        expect(JSON.parse(resultUpdate.toJSON().body).msg).toEqual(PET_ERROR.PET_NOT_FOUND);
    })
})

