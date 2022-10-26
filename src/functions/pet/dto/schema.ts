import * as Joi from '@hapi/joi';
import { HttpRequest } from '@libs/api-gateway';
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
            [HttpRequest.PATCH]: (schema) => schema.required(),
            [HttpRequest.POST]: (schema) => schema.forbidden(),
        }),

        // -- name
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .alter({
                [HttpRequest.POST]: (schema) => schema.required(),
            }),
        // -- status
        status: Joi.string().valid(...Object.values(PET_STATUS)).alter({
            [HttpRequest.POST]: (schema) => schema.required(),
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