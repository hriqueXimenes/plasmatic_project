import * as Joi from '@hapi/joi';
import { PET_STATUS } from '../enum/pet-status.enum';

let tags = Joi.object().keys({
    key: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
    value: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
})

export const Schema = Joi.object({
    // -- name
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    // -- status
    status: Joi.string().valid(...Object.values(PET_STATUS)).required(),
    
    // -- category
    category: Joi.string()
    .alphanum()
    .min(3)
    .max(30),

    // -- tags
    tags: Joi.array().items(tags)
})