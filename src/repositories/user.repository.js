/**
 * The Contact Repository
 */
class UserRepository {
  get _baseParams() {
    return {
      TableName: 'users'
    };
  }

  /**
   * Contructs a new user repository
   * @param {AWS.DynamoDB.DocumentClient} documentClient The Document Client
   */
  constructor(documentClient) {
    this._documentClient = documentClient;
  }

  /**
   * Gets a list of users
   * @returns {Promise<Models.User[]>} A list of users
   */
  async list() {
    const params = this._createParamObject();
    const response = await this._documentClient.scan(params).promise();

    return response.Items || [];
  }

  /**
   * Gets a user by id
   * @param {string} id The user id
   * @returns {Promise<Models.User>} The user
   */
  async get(id) {
    const params = this._createParamObject({ Key: { id } });
    const response = await this._documentClient.get(params).promise();

    return response.Item;
  }

  /**
   * Gets a user by username
   * @param {string} username The username
   * @returns {Promise<Models.User>} The user
   */
  async getByUsername(username) {
    const params = this._createParamObject({
      FilterExpression: '#username = :username',
      ExpressionAttributeNames:{
        '#username': 'username'
      },
      ExpressionAttributeValues: {
        ':username':username
      }
    });
    const response = await this._documentClient.scan(params).promise();

    return response.Items[0];
  }

  /**
   * Add or replace a user
   * @param {Models.User} user The user
   * @returns {Promise<Models.User>} The user
   */
  async put(user) {
    const params = this._createParamObject({ Item: user });
    await this._documentClient.put(params).promise();

    return user;
  }

  /**
   * Deletes a user by id
   * @param {string} id The user id
   * @return {Promise<string>} The id of the deleted user
   */
  async delete(id) {
    const params = this._createParamObject({ Key: { id } });
    await this._documentClient.delete(params).promise();

    return id;
  }

  _createParamObject(additionalArgs = {}) {
    return Object.assign({}, this._baseParams, additionalArgs);
  }
}

exports.UserRepository = UserRepository;
