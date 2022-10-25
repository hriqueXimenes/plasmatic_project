# Plasmatic - Technical Project

This project uses [petstore](https://petstore.swagger.io/) as a reference.

# Getting Started

## Prerequisites

- [NodeJS 16](https://nodejs.org/en/)
- [Serverless](https://www.serverless.com/)

## Installation

### Deploy Locally
The project is using serverless-offline lib to deploy it locally.\
To deploy in AWS, make sure to set up your credentials with AWS CLI.

- Run `yarn` to install the project dependencies
- Run `serverless offline start` to deploy this stack locally
- You can use the postman collection in the root of the project to make API calls.

### Deploy AWS

- Run `yarn` to install the project dependencies
- Run `serverless deploy` to deploy this stack on AWS

### Run Tests

- Run `yarn` to install the project dependencies
- Run `serverless offline start` to create the environment
- `yarn run jest`

## Endpoints
 - GET - `{url}/dev/pet/{id}`
 - GET - `{url}/dev/pet`
 - POST - `{url}/dev/pet`
 - PATCH - `{url}/dev/pet`
 - DELETE - `{url}/dev/pet/{id}`
 - POST - `{url}/dev/pet/{id}/image`

 - GET - `{url}/dev/order/{id}`
 - POST - `{url}/dev/order`
 - DELETE - `{url}/dev/order/{id}`


## Contact

Henrique Ximenes - hriqueximenes@gmail.com