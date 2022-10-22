import { PET_STATUS } from "../enum/pet-status.enum";

export class Pet {
    id: string;
    name: string;
    status: PET_STATUS;
    createdAt: string;
}