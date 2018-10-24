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

exports.handler = async (event) => {
  const user = JSON.parse(event.requestContext.authorizer.user);
  if (!canAccess(user, 'list')) {
    return withStatusCode(403)();
  }

  const users = await repository.list();

  return ok(users);
};
