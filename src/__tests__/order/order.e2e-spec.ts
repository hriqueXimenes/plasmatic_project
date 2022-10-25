import { PetService } from "../../functions/pet/service";
import { HttpCode } from "../../libs/api-gateway";
import { v4 } from "uuid";
import { dynamoDB } from "../../libs/dynamodb";
import { ORDER_ERROR } from "../../errors";
import { PET_STATUS } from "../../functions/pet/constants";
import { Pet } from "../../functions/pet/entity/pet.entity";
import { OrderService } from "../../functions/order/service";
import { OrderRO } from "../../functions/order/ro/order.ro";

describe('Fetch Orders', () => {
    let orderService: OrderService;
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;
    let petCreatedForTest: Pet;
    let orderCreatedForTest: OrderRO;

    beforeAll(async () => {
        orderService = new OrderService();
        petService = new PetService();
        dynamoTestDb = dynamoDB()

        const petTable = {
            TableName: orderService.getTableName(),
            KeySchema: [ 
                {
                    AttributeName: 'id',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'petid',
                    KeyType: 'RANGE',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'petid',
                    AttributeType: 'S',
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1, 
                WriteCapacityUnits: 1, 
            }
        };

        await dynamoTestDb.deleteTable({TableName: orderService.getTableName()})
        await dynamoTestDb.waitFor('tableNotExists', {TableName: orderService.getTableName()}, async function() {
            await dynamoTestDb.createTable(petTable).promise()
        });
        
        petCreatedForTest = (await petService.createPet({
            name: "test",
            status: PET_STATUS.AVAILABLE,
            category: "test",
            tags: [{ key:"test", value:"test" }]
        })).getBody() as Pet

        orderCreatedForTest = (await orderService.createOrder({
            products: [{
                petid: petCreatedForTest.id,
                quantity: 5
            }]
        })).getBody() as OrderRO
    })

    it('should receive a 400 code -> Not find OrderID', async() => {
        let result = await orderService.fetchOrder(v4())
        expect(result.getCode()).toEqual(HttpCode.BAD_REQUEST);
        expect(JSON.parse(result.toJSON().body).msg).toEqual(ORDER_ERROR.ORDER_NOT_FOUND);
    })

    it('should receive a 200 code -> When find a order', async() => {
        let result = await orderService.fetchOrder(orderCreatedForTest.id)
        expect(result.getCode()).toEqual(HttpCode.SUCCESSFULLY);
        expect(JSON.parse(result.toJSON().body) as OrderRO).toEqual(orderCreatedForTest);
    })
})

describe('Insert Orders', () => {
    let orderService: OrderService;
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;
    let petCreatedForTest: Pet;

    beforeAll(async () => {
        orderService = new OrderService();
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

    it('should receive a 200 code -> Created Successfully', async() => {
        let result = await orderService.createOrder({
            products: [{
                petid: petCreatedForTest.id,
                quantity: 5
            }]
        });

        expect(result.getCode()).toEqual(HttpCode.SUCCESSFULLY);
        expect(result.getBody().id !== undefined).toBe(true)

        // -> Check if was inserted correctly.
        let checkCreation = await (await orderService.fetchOrder(result.getBody().id)).getBody() as OrderRO
        expect(result.getBody() as OrderRO).toEqual(checkCreation)
    })
})

describe('Delete Orders', () => {
    let orderService: OrderService;
    let petService: PetService;
    let dynamoTestDb: AWS.DynamoDB;
    let petCreatedForTest: Pet;

    beforeAll(async () => {
        orderService = new OrderService();
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

    it('should receive a 400 code -> Not find OrderID', async() => {
        let result = await orderService.deleteOrder(v4())
        expect(result.getCode()).toEqual(HttpCode.BAD_REQUEST);
        expect(JSON.parse(result.toJSON().body).msg).toEqual(ORDER_ERROR.ORDER_NOT_FOUND);
    })

    it('should receive a 200 code -> Deleted Successfully', async() => {
        let result = await orderService.createOrder({
            products: [{
                petid: petCreatedForTest.id,
                quantity: 5
            }]
        });

        expect(result.getCode()).toEqual(HttpCode.SUCCESSFULLY);
        expect(result.getBody().id !== undefined).toBe(true)

        
        let checkResponse = await orderService.fetchOrder(result.getBody().id)
        expect(checkResponse.getCode()).toEqual(HttpCode.SUCCESSFULLY);

        await orderService.deleteOrder(result.getBody().id)

        checkResponse = await orderService.fetchOrder(result.getBody().id)
        expect(checkResponse.getCode()).toEqual(HttpCode.BAD_REQUEST);
    })
})