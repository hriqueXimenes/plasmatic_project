import { PET_STATUS } from '../constants';

export class CreatePetDTO {
    name: string;
    status: PET_STATUS;
    category: string;
    tags: CreatePetTagDTO[];
}

export class CreatePetTagDTO {
    key: string;
    value: string;
}