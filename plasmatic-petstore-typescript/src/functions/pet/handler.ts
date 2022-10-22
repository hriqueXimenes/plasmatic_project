import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePetDTO } from './dto/create-pet.dto';
import { PetService } from './service';
//import { PetService } from './service';

const petService = new PetService();

export const fetchPets = middyfy(async (): Promise<APIGatewayProxyResult> => {
    const pets = await petService.fetchPets();
    console.log(pets)
    return formatJSONResponse ({
        pets
    })
})

export const createPet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreatePetDTO
    const pet = await petService.createPet(dto);
    return formatJSONResponse ({
        ...pet
    })
}
