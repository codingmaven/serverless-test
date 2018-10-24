# Users API

## Setup

Download the DynamoDb-Local jar file for your system [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).
docker run -p 8000:8000 amazon/dynamodb-local

  - Extract the jar file to the root of this repository (the parent of this project folder) under the name: `dynamodb_local`.

Create a `.env` file at the root of the project and add in your own values for these enviornment variables.

  - `AWS_ENDPOINT='http://localhost:8000/'`
  - `AWS_REGION='localhost'`
  - `AWS_ACCESS_KEY_ID='fake-access-key'`
  - `AWS_SECRET_ACCESS_KEY='fake-secret-key'`


## Running

DynamoDB Local

  - Open a terminal at the the folder where you extracted the jar file (Setup section).
    - Run: `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb` to start it on the default port: `8000`.
    - Open a browser at: `http://localhost:8000/shell` to interact with DynamoDB through the interactive shell.

Lambda Functions

  - Run `npm run seed` to seed some test data.
  - Run `npm start` to start the functions locally.

Test by trying to hit an Api endpoint in the Postman. (should add basic auth header)

  - POST `http://localhost:3000/users/` - open api
  - GET `http://localhost:3000/users/` - can be accessed with admin credentials
  - GET `http://localhost:3000/users/{userId}` - can be accessed with any user role
  - PUT `http://localhost:3000/users/{userId}` - can be accessed with any user role
  - DELETE `http://localhost:3000/users/{userId}` - can be accessed with any user role


## Notes
 - I have used jest as an automated testing framework
 - eslint is integrated for consistent coding style
 - Basic Auth is implemented for fast/easy development but that's not the best choice. We can use json web token for production applications.
 - Right now, raw password is stored in dynamodb. This should be encrypted for production use.
