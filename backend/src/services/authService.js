const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const ApiError = require('../utils/ApiError');

const createUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw ApiError.conflict('Email address is already registered');
  }
  return User.create(userData);
};

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  generateToken,
};
