
const checkRole = (user, role) => {
  if (role === 'user') {
    return user.role === 'user' || user.role === 'admin';
  }

  if (role === 'admin') {
    return user.role === 'admin';
  }

  return false;
};

const canAccess = (user, api, id) => {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'user') {
    switch (api) {
      case 'list':
        return false;
      case 'get':
        return parseInt(user.id) === parseInt(id);
      case 'delete':
        return parseInt(user.id) === parseInt(id);
      case 'update':
        return parseInt(user.id) === parseInt(id);
      default:
        return false;
    }
  }

  return false;
};

module.exports = {
  checkRole,
  canAccess
};
