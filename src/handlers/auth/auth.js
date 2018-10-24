'use strict';
const { UserRepository } = require('../../repositories/user.repository');
const { withProcessEnv } = require('../../dynamodb.factory');
const docClient = withProcessEnv(process.env)();
const repository = new UserRepository(docClient);

const generatePolicy = (userId, effect, resource, context) => {
  const policy = {
    principalId: userId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    },
    context
  };
  return policy;
};


module.exports.handler = async (event, context, callback) => {

  console.log(event);
  console.log('==================');
  console.log('Authorization: ', event.authorizationToken);
  console.log('==================');

  const authToken = event.authorizationToken;

  const encodedCreds = authToken.split(' ')[1];
  const plainCreds = (Buffer.from(encodedCreds, 'base64')).toString().split(':');
  const username = plainCreds[0];
  const password = plainCreds[1];

  const user = await repository.getByUsername(username);
  if (user.password === password) {
    callback(null, generatePolicy('user', 'Allow', event.methodArn, { user: JSON.stringify(user) }));
  } else {
    callback('Unauthorized');
  }
};
