import { PET_STATUS } from '../constants';

export class UpdatePetDTO {
    id: string;
    name: string;
    status: PET_STATUS;
    category: string;
    tags: UpdatePetTagDTO[];
}

export class UpdatePetTagDTO {
    key: string;
    value: string;
}