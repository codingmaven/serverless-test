/*global spyOn*/
/*global fail*/

const { UserRepository } = require('./user.repository');

describe('Users Repository', () => {
  /** @type {AWS.DynamoDB.DocumentClient} */
  const mockDocClient = {
    scan: params => { },
    // query: params => mockAwsRequest,
    get: params => { },
    put: params => { },
    delete: params => { }
    // update: params => { }
  };

  const mockUsers = [
    { id: '1', name: 'Jin Erso' },
    { id: '2', name: 'Luke Skywalker' },
    { id: '3', name: 'Darth Vadar' }
  ];

  const createAwsRequest = (data = null, resolveOrReject = true, errMsg = 'error') => {
    return {
      promise: () => resolveOrReject ? Promise.resolve(data) : Promise.reject(new Error('error'))
    };
  };

  /** @type {UsersRepository} */
  let respository;

  beforeEach(() => {
    respository = new UserRepository(mockDocClient);
  });

  it('should construct a new respository', () => {
    expect(respository).toBeDefined();
  });

  it('should list users', async () => {
    const expectedResult = {
      Items: mockUsers.slice()
    };

    spyOn(mockDocClient, 'scan').and.returnValues(createAwsRequest(expectedResult), createAwsRequest({ Items: null }));

    const awsParams = {
      TableName: 'users'
    };

    const results = await respository.list();

    expect(results).toEqual(expectedResult.Items);
    expect(results.length).toBe(3);
    expect(mockDocClient.scan).toHaveBeenCalledWith(awsParams);

    const emptyResults = await respository.list();

    expect(emptyResults).toEqual([]);
  });

  it('should throw an error when listing fails', async () => {
    spyOn(mockDocClient, 'scan').and.returnValue(createAwsRequest(null, false));

    try {
      await respository.list();

      fail('listing should have failed with an error');
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toEqual('error');
    }
  });

  it('should get a user by id', async () => {
    const expectedResult = {
      Item: Object.assign({}, mockUsers[0])
    };

    spyOn(mockDocClient, 'get').and.returnValue(createAwsRequest(expectedResult));

    const id = '1';
    const awsParams = {
      TableName: 'users',
      Key: { id }
    };

    const user = await respository.get(id);

    expect(user).toBeDefined();
    expect(user).toEqual(expectedResult.Item);
    expect(mockDocClient.get).toHaveBeenCalledWith(awsParams);
  });

  it('should put a new item in the db', async () => {
    spyOn(mockDocClient, 'put').and.returnValue(createAwsRequest());

    const newUser = {
      id: '4',
      name: 'Han Solo'
    };

    const awsParams = {
      TableName: 'users',
      Item: newUser
    };

    const user = await respository.put(newUser);

    expect(user).toBeDefined();
    expect(mockDocClient.put).toHaveBeenCalledWith(awsParams);
  });

  it('should delete a user, by id', async () => {
    spyOn(mockDocClient, 'delete').and.returnValue(createAwsRequest());

    const id = '1';
    const awsParams = { TableName: 'users', Key: { id } };

    const deletedid = await respository.delete(id);

    expect(deletedid).toBe(id);
    expect(mockDocClient.delete).toHaveBeenCalledWith(awsParams);
  });
});
