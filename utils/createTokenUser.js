const createTokenUser = (user) => {
  const { name, _id, role } = user;
  return {
    name: name,
    userId: _id,
    role: role,
  };
};

module.exports = {createTokenUser}