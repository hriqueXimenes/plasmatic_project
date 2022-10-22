import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { PetService } from './service';
//import { PetService } from './service';

const petService = new PetService();

export const fetchPets = middyfy(async (): Promise<APIGatewayProxyResult> => {
    const pets = petService.fetchPets();
    return formatJSONResponse ({
        pets
    })
})

export const main = middyfy(fetchPets);
