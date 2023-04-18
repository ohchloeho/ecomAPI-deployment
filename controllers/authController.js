const User = require("../models/User");
const {
  BadRequestError,
  UnauthenticatedError,
  CustomAPIError,
} = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesToResponse,createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError(
      "Please ensure name, email and password fields are not empty"
    );
  }
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }

  // only first registered user is admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  if (!user) {
    throw new BadRequestError("Registration Error");
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Email not found");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Password");
  }
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user });
};

const logout = async (req, res) => {
  // removes cookies on logout
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = { register, login, logout };
