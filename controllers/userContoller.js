const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const allUsers = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ allUsers });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new BadRequestError("No user found. Please login or register");
  }
  res.status(StatusCodes.OK).json({ currentUser });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Please enter fields to be updated");
  }

  //* update user with findOneAndUpdate()
  // const user = await User.findOneAndUpdate(
  //   { _id: req.user.userId },
  //   { name: name, email: email },
  //   { new: true, runValidators: true }
  // );

  //* update user with User.save()
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Password is incorrect please try again");
  }
  user.password = newPassword;
  await user.save(); // hashes password as it invokes pre method in User model

  res.send(`hey ${user.name}, your password has been updated`);
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
