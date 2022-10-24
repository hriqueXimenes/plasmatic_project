import type { AWS } from '@serverless/typescript';
import { fetchPet, fetchPets, createPet, updatePet, deletePet, uploadImagePet } from './src/functions/pet/index';
import { fetchOrder, createOrder, deleteOrder } from './src/functions/order/route';
import * as dotenv from 'dotenv';

dotenv.config()
const serverlessConfiguration: AWS = {
  service: 'aws-serverless-typescript-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    apiGateway: {
      binaryMediaTypes: [
        '*/*'],
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [{
          Effect: "Allow",
          Action: [
            "dynamodb:DescribeTable",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          Resource: "arn:aws:dynamodb:us-east-1:*:table/*",
        },
        {
          Effect: "Allow",
          Action: [
            "s3:PutObject",
            "s3:PutObjectAcl",
          ],
          Resource: "arn:aws:s3:::bucket-plasmatic/*",
        }],
      },
    },
  },
  // import the function via paths
  functions: { fetchPet, fetchPets, createPet, updatePet, deletePet, uploadImagePet, fetchOrder, createOrder, deleteOrder },
  package: { individually: true },
  custom:{
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb:{
      start:{
        port: 5000,
        inMemory: true,
        migrate: true,
      },
      stages: "dev"
    }
  },
  resources: {
    Resources: {
      PetTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: 'pets',
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
        }
      },
      PetTagsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: 'orders',
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S",
          }, {
            AttributeName: "petid",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "petid",
            KeyType: "HASH"
          },
          {
            AttributeName: "id",
            KeyType: "RANGE"
          },
        ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
        }
      },
      Bucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "bucket-plasmatic"
        }
      }
    },
  }
};
module.exports = serverlessConfiguration;