import { handlerPath } from '@libs/handler-resolver';

export const fetchPets = {
    handler: `${handlerPath(__dirname)}/handler.fetchPets`,
    events: [
        {
            http: {
                method: 'get',
                path: 'pet',
            },
        },
    ],
};