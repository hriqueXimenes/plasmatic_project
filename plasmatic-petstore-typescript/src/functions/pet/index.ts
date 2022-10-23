import { handlerPath } from '@libs/handler-resolver';

export const fetchPet = {
    handler: `${handlerPath(__dirname)}/handler.fetchPet`,
    events: [
        {
            http: {
                method: 'get',
                path: 'pet/{id}',
            },
        },
    ],
};

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

export const createPet = {
    handler: `${handlerPath(__dirname)}/handler.createPet`,
    events: [
        {
            http: {
                method: 'post',
                path: 'pet',
            },
        },
    ],
};

export const updatePet = {
    handler: `${handlerPath(__dirname)}/handler.updatePet`,
    events: [
        {
            http: {
                method: 'patch',
                path: 'pet',
            },
        },
    ],
};

export const deletePet = {
    handler: `${handlerPath(__dirname)}/handler.deletePet`,
    events: [
        {
            http: {
                method: 'delete',
                path: 'pet/{id}',
            },
        },
    ],
};