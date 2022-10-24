import { formatJSONResponse, formatJSONError, formatJSONException } from '@libs/api-gateway';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePetDTO } from './dto/create-pet.dto';
import { FetchPetDTO } from './dto/fetch-pet';
import { ValidatePetDTO } from './dto/schema';
import { UpdatePetDTO } from './dto/update-pet.dto';
import { PetService } from './service';
import parseMultipart from 'parse-multipart';
import fs from "fs";


const petService = new PetService();

export const fetchPets = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dto = new FetchPetDTO()
        Object.assign(dto, event.queryStringParameters)

        const validateError = ValidatePetDTO(dto, "get").error
        if (validateError) {
            return formatJSONError(validateError.details[0].message)
        }

        const pets = await petService.fetchPets(dto);
        return formatJSONResponse({
            pets
        })
    } catch (error) {
        return formatJSONException()
    }
}

export const fetchPet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return formatJSONError("Id parameter is mandatory")
    }

    try {
        const pets = await petService.fetchPet(event.pathParameters.id);
        return formatJSONResponse({
            ...pets
        })
    } catch (error) {
        return formatJSONException()
    }
}

export const createPet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as CreatePetDTO

    const validateError = ValidatePetDTO(dto, "post").error
    if (validateError) {
        return formatJSONError(validateError.details[0].message)
    }

    try {
        const pet = await petService.createPet(dto);
        return formatJSONResponse({
            ...pet
        })
    } catch (error) {
        return formatJSONException()
    }
}

export const updatePet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dto = JSON.parse(event.body) as UpdatePetDTO

    const validateError = ValidatePetDTO(dto, "patch").error
    if (validateError) {
        return formatJSONError(validateError.details[0].message)
    }

    try {
        const pet = await petService.updatePet(dto);
        return formatJSONResponse({
            ...pet
        })
    } catch (error) {
        return formatJSONException()
    }
}

export const deletePet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters.id) {
        return formatJSONError("Id parameter is mandatory")
    }

    try {
        const pet = await petService.deletePet(event.pathParameters.id);
        return formatJSONResponse({
            ...pet
        })
    } catch (error) {
        return formatJSONException()
    }
}

export const uploadImagePet = async (event): Promise<APIGatewayProxyResult> => {
    //serverless-offline don't convert multipart to base64 - need to deploy in AWS.
    if (!event.pathParameters.id) {
        return formatJSONError("Id parameter is mandatory")
    }

    try {
        const { filename, data } = extractFile(event)
        const pet = await petService.uploadImagePet(filename, data, event.pathParameters.id);


        return formatJSONResponse({
            ...pet
        })
    } catch (error) {
        console.log(error)
        return formatJSONException()
    }
}

function extractFile(event) {
    
    const boundary = parseMultipart.getBoundary(event.headers['Content-Type'])
    let parts = parseMultipart.Parse(Buffer.from(event.body, "base64"), boundary);

    if (!parts.filename) {
        parts = parseMultipart.Parse(Buffer.from(event.body), boundary);
    }

     const [{ filename, data }] = parts
   
    return {
      filename,
      data
    }
  }
