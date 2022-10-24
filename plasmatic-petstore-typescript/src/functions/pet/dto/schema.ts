import * as Joi from '@hapi/joi';
import { PET_STATUS } from '../constants';

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

export const ValidatePetDTO = (dto, requestType) => {
    let schema = Joi.object({
        // -- id
        id: Joi.string().alter({
            patch: (schema) => schema.required(),
            post: (schema) => schema.forbidden(),
        }),

        // -- name
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .alter({
                post: (schema) => schema.required(),
            }),
        // -- status
        status: Joi.string().valid(...Object.values(PET_STATUS)).alter({
            post: (schema) => schema.required(),
        }),

        // -- category
        category: Joi.string()
            .alphanum()
            .min(3)
            .max(30),

        // -- tags
        tags: Joi.array().items(tags)
    })

    return schema.tailor(requestType).validate(dto);
}