const {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError(
      `Authentication invalid, you are not an admin user`
    );
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role }; // sets req.user to current user info
    next();
  } catch (error) {
    throw new UnauthenticatedError(`Authentication invalid`);
  }
};

const authorizePermissions = (...roles) => {
    // authorizes permissions for roles
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
