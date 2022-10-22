import { formatJSONResponse, formatJSONError } from '@libs/api-gateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePetDTO } from './dto/create-pet.dto';
import { Schema } from './dto/schema';
import { PetService } from './service';


const petService = new PetService();

export const fetchPets = async (): Promise<APIGatewayProxyResult> => {
    const pets = await petService.fetchPets();
    console.log(pets)
    return formatJSONResponse ({
        pets
    })
}

export const createPet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreatePetDTO

    const validateError = Schema.validate(dto).error
    if (validateError) {
        return formatJSONError(validateError.details[0].message)
    }
    
    const pet = await petService.createPet(dto);
    return formatJSONResponse ({
        ...pet
    })
}
