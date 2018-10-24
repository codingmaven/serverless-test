
require('dotenv/config');

const { UserRepository } = require('../../repositories/user.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withProcessEnv } = require('../../dynamodb.factory');
const { parseWith } = require('../../utils/request.util');
const { canAccess } = require('../../utils/user.util');

const parseJson = parseWith(JSON.parse);
const docClient = withProcessEnv(process.env)();
const repository = new UserRepository(docClient);
const ok = withStatusCode(200, JSON.stringify);
const notFound = withStatusCode(404);

exports.handler = async (event) => {
  const { id } = event.pathParameters;

  const user = JSON.parse(event.requestContext.authorizer.user);
  if (!canAccess(user, 'get', id)) {
    return withStatusCode(403)();
  }

  const foundUser = await repository.get(id);

  if (!foundUser) {
    return notFound();
  }

  return ok(foundUser);
};
