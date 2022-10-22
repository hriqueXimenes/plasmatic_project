import * as Joi from '@hapi/joi';
import { PET_STATUS } from '../enum/pet-status.enum';

export const Schema = Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    status: Joi.string().valid(...Object.values(PET_STATUS)).required(),
})