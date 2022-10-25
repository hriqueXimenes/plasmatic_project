import { handlerPath } from '@libs/handler-resolver';

export const fetchOrder = {
    handler: `${handlerPath(__dirname)}/handler.fetchOrder`,
    events: [
        {
            http: {
                method: 'get',
                path: 'order/{id}',
            },
        },
    ],
};

export const createOrder = {
    handler: `${handlerPath(__dirname)}/handler.createOrder`,
    events: [
        {
            http: {
                method: 'post',
                path: 'order',
            },
        },
    ],
};

export const deleteOrder = {
    handler: `${handlerPath(__dirname)}/handler.deleteOrder`,
    events: [
        {
            http: {
                method: 'delete',
                path: 'order/{id}',
            },
        },
    ],
};