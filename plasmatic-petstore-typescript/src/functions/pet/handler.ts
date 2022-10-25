import { HttpCode, PatternResult } from '@libs/api-gateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePetDTO } from './dto/create-pet.dto';
import { FetchPetDTO } from './dto/fetch-pet';
import { ValidatePetDTO } from './dto/schema';
import { UpdatePetDTO } from './dto/update-pet.dto';
import { PetService } from './service';
import parseMultipart from 'parse-multipart';
import { PET_ERROR } from 'src/errors';


const petService = new PetService();

export const fetchPets = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = new FetchPetDTO()
    Object.assign(dto, event.queryStringParameters)

    const validateError = ValidatePetDTO(dto, "get").error
    if (validateError) {
        return new PatternResult(HttpCode.BAD_REQUEST, validateError.details[0].message).toJSON()
    }

    const result = await petService.fetchPets(dto);
    return result.toJSON()
}

export const fetchPet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_ID_MANDATORY).toJSON()
    }

    const pets = await petService.fetchPet(event.pathParameters.id);
    return pets.toJSON();
}

export const createPet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreatePetDTO

    const validateError = ValidatePetDTO(dto, "post").error
    if (validateError) {
        return new PatternResult(HttpCode.BAD_REQUEST, validateError.details[0].message).toJSON()
    }

    const pet = await petService.createPet(dto);
    return pet.toJSON();
}

export const updatePet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as UpdatePetDTO

    const validateError = ValidatePetDTO(dto, "patch").error
    if (validateError) {
        return new PatternResult(HttpCode.BAD_REQUEST, validateError.details[0].message).toJSON()
    }

    const pet = await petService.updatePet(dto);
    return pet.toJSON();
}

export const deletePet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_ID_MANDATORY).toJSON()
    }

    const pet = await petService.deletePet(event.pathParameters.id);
    return pet.toJSON();
}

export const uploadImagePet = async (event): Promise<APIGatewayProxyResult> => {
    //serverless-offline don't convert multipart to base64 - need to deploy in AWS.
    if (!event.pathParameters.id) {
        return new PatternResult(HttpCode.BAD_REQUEST, PET_ERROR.PET_ID_MANDATORY).toJSON()
    }

    const boundary = parseMultipart.getBoundary(event.headers['Content-Type'])
    let parts = parseMultipart.Parse(Buffer.from(event.body, "base64"), boundary);
    

    if (!parts.filename) {
        parts = parseMultipart.Parse(Buffer.from(event.body), boundary);
    }

    const [{ filename, data }] = parts

    const pet = await petService.uploadImagePet(filename, data, event.pathParameters.id);
    return pet.toJSON();

}