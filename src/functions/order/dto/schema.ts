import * as Joi from '@hapi/joi';
import { HttpRequest } from '@libs/api-gateway';

export const ValidateOrderDTO = (dto, requestType) => {
    let schema = Joi.object({
        // -- id
        id: Joi.string().alter({
            [HttpRequest.PATCH]: (schema) => schema.required(),
            [HttpRequest.POST]: (schema) => schema.forbidden(),
        }),

        // -- products
        products: Joi.array().items(products).unique((a, b) => a.petid == b.petid).required()
    })

    return schema.tailor(requestType).validate(dto);
}

let products = Joi.object().keys({
    // -- petid
    petid: Joi.string().required(),
    quantity: Joi.number().integer().min(1).max(999).required(),
})