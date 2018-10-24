
// TODO: consider breaking this out into individual suites

describe('Users', () => {
  const mockUserRepository = {
    list: () => [],
    get: id => null,
    put: user => null,
    delete: id => null,
    getByUsername: username => null
  };

  const testUsers = [
    { id: '1', name: 'Jin Erso', username: 'jin', password: 'jinpass', role: 'admin' },
    { id: '2', name: 'Rey', username: 'rey', password: 'reypass', role: 'user' },
    { id: '3', name: 'Kylo Ren', username: 'jin', password: 'kylopass', role: 'admin' }
  ];

  const mockWithStatusCode = jest.fn();
  const mockResponseUtil = {
    withStatusCode: (stat, fn) => mockWithStatusCode
  };

  const mockParseWith = jest.fn();
  const mockRequestUtil = {
    parseWith: (parser) => mockParseWith
  };

  const mockDynamoDbFactory = {
    withProcessEnv: (env) => jest.fn()
  };

  jest.mock('aws-sdk/clients/dynamodb', () => ({ DocumentClient: jest.fn() }));
  jest.mock('../../repositories/user.repository', () => ({ UserRepository: jest.fn(() => mockUserRepository) }));
  jest.mock('../../utils/response.util', () => mockResponseUtil);
  jest.mock('../../utils/request.util', () => mockRequestUtil);

  describe('list handler', () => {
    const { handler } = require('./list');

    beforeEach(() => {
      jest.resetAllMocks();
      mockWithStatusCode.mockImplementation((data) => ({ statusCode: 200, body: JSON.stringify(data) }));
    });

    it('should return a list of users', async () => {
      jest.spyOn(mockUserRepository, 'list').mockResolvedValue(Promise.resolve(testUsers));

      const expectedResponse = {
        statusCode: 200,
        body: JSON.stringify(testUsers)
      };

      const response = await handler({ requestContext: {
        authorizer: {
          user: JSON.stringify(testUsers[0])
        }
      } });

      expect(response).toBeDefined();
      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.list).toHaveBeenCalled();
      expect(mockWithStatusCode).toHaveBeenCalled();
    });
  });

  describe('get handler', () => {
    const { handler } = require('./get');

    beforeEach(() => {
      jest.resetAllMocks();
      mockWithStatusCode.mockImplementation((data) => ({ statusCode: 200, body: JSON.stringify(data) }));
    });

    it('should get a user by id', async () => {
      jest.spyOn(mockUserRepository, 'get').mockImplementation(id => Promise.resolve(testUsers[id] || null));
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      const id = 1;
      const event = {
        pathParameters: { id },
        requestContext: {
          authorizer: {
            user: JSON.stringify(testUsers[0])
          }
        }
      };

      const expectedResponse = {
        statusCode: 200,
        body: JSON.stringify(testUsers[id])
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.get).toHaveBeenCalledWith(id);
      expect(mockWithStatusCode).toHaveBeenCalled();
    });

    it('should return a 404 not found if a user does not exist', async () => {
      jest.spyOn(mockUserRepository, 'get').mockResolvedValue(null);
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      mockWithStatusCode.mockClear();
      mockWithStatusCode.mockImplementation(_ => ({ statusCode: 404 }));

      const id = 1000;
      const event = {
        pathParameters: { id },
        requestContext: {
          authorizer: {
            user: JSON.stringify(testUsers[0])
          }
        }
      };

      const expectedResponse = {
        statusCode: 404
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.get).toHaveBeenCalledWith(id);
      expect(mockWithStatusCode).toHaveBeenCalled();
    });
  });

  describe('add handler', () => {
    const { handler } = require('./add');

    beforeEach(() => {
      jest.resetAllMocks();
      mockWithStatusCode.mockImplementation((data) => ({ statusCode: 201 }));
      mockParseWith.mockImplementation(text => JSON.parse(text));

    });

    it('should create a new user', async () => {
      jest.spyOn(mockUserRepository, 'put').mockImplementation((data) => Promise.resolve(data));
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      const user = {
        id: '4',
        name: 'Han Solo',
        username: 'han',
        password: 'hanpass',
        role: 'admin'
      };

      const event = {
        body: JSON.stringify(user)
      };

      const expectedResponse = {
        statusCode: 201
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.put).toHaveBeenCalledWith(user);
    });
  });

  describe('delete handler', () => {
    const { handler } = require('./delete');

    beforeEach(() => {
      jest.resetAllMocks();
      mockWithStatusCode.mockImplementation(() => ({ statusCode: 204 }));
    });

    it('should delete a user', async () => {
      jest.spyOn(mockUserRepository, 'delete').mockResolvedValue('1');
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      const id = '1';
      const event = {
        pathParameters: { id },
        requestContext: {
          authorizer: {
            user: JSON.stringify(testUsers[0])
          }
        }
      };

      const expectedResponse = {
        statusCode: 204
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('update handler', () => {
    const { handler } = require('./update');

    beforeEach(() => {
      jest.resetAllMocks();
      mockParseWith.mockImplementation(text => JSON.parse(text));
    });

    it('should create a new user', async () => {
      jest.spyOn(mockUserRepository, 'put').mockImplementation((data) => Promise.resolve(data));
      jest.spyOn(mockUserRepository, 'get').mockResolvedValue({ id: '3' });
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      mockWithStatusCode.mockImplementation((data) => ({ statusCode: 200, body: JSON.stringify(data) }));

      const user = {
        id: '3',
        name: 'Darth Vader',
        username: 'darth',
        password: 'darthpass',
        role: 'admin'
      };

      const event = {
        pathParameters: { id: '3' },
        body: JSON.stringify(user),
        requestContext: {
          authorizer: {
            user: JSON.stringify(testUsers[0])
          }
        }
      };

      const expectedResponse = {
        statusCode: 200,
        body: JSON.stringify(user)
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.put).toHaveBeenCalledWith(user);
      expect(mockUserRepository.get).toHaveBeenCalledWith('3');
    });

    it('should return 404 not found if user does not exist', async () => {
      jest.spyOn(mockUserRepository, 'put').mockRejectedValue('unexpected call to put');
      jest.spyOn(mockUserRepository, 'get').mockResolvedValue(null);
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      mockWithStatusCode.mockImplementation(() => ({ statusCode: 404 }));

      const user = {
        id: '3',
        name: 'Darth Vader',
        username: 'darth',
        password: 'darthpass',
        role: 'admin'
      };

      const event = {
        pathParameters: { id: '3' },
        body: JSON.stringify(user),
        requestContext: {
          authorizer: {
            user: JSON.stringify(testUsers[0])
          }
        }
      };

      const expectedResponse = {
        statusCode: 404
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.get).toHaveBeenCalledWith('3');

      expect(mockUserRepository.put).not.toHaveBeenCalledWith(user);
    });

    it('should return 400 bad request if user id does not match', async () => {
      jest.spyOn(mockUserRepository, 'put').mockRejectedValue('unexpected call to put');
      jest.spyOn(mockUserRepository, 'get').mockResolvedValue({ id: '1000' });
      jest.spyOn(mockUserRepository, 'getByUsername').mockImplementation(username => Promise.resolve(testUsers[0] || null));

      mockWithStatusCode.mockImplementation(() => ({ statusCode: 400 }));

      const user = {
        id: '3',
        name: 'Darth Vader',
        username: 'darth',
        password: 'darthpass',
        role: 'admin'
      };

      const event = {
        pathParameters: { id: '3' },
        body: JSON.stringify(user),
        requestContext: {
          authorizer: {
            user: JSON.stringify(testUsers[0])
          }
        }
      };

      const expectedResponse = {
        statusCode: 400
      };

      const response = await handler(event);

      expect(response).toEqual(expectedResponse);
      expect(mockUserRepository.get).toHaveBeenCalledWith('3');

      expect(mockUserRepository.put).not.toHaveBeenCalledWith(user);
    });
  });
});
