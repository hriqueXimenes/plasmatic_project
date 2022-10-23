export class CreatePetDTO {
    name: string;
    status: string;
    category: string;
    tags: CreatePetTagDTO[];
}

export class CreatePetTagDTO {
    key: string;
    value: string;
}