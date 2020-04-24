const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async(req, res, next) => {
  try {
    // return all properties but password - exclude it!
    const users = await User.find({}, '-password');
    if (users.length === 0) {
      return new HttpError('There is no user yet.', 202);
    }
    return res.status(200).json({ users: users.map(u => u.toObject({ getters: true })) });
  } catch (error) {
    return next(new HttpError('Something went wrong, please try it again later.', 500));
  }
};

const signup = async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { name, email, password } = req.body;
  const image = 'https://i.epochtimes.com/assets/uploads/2020/04/download-48-600x400.jpg';
  const places = []; // TODO, here is sole a placeholder

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch(err) {
    return next(new HttpError('Signing up failed, please try it again later.', 500));
  }

  if (existingUser) {
    return next(new HttpError('User exists already, please login instead.', 422));
  }

  try {
    const createdUser = new User({
      name: name,
      email: email,
      password: password,
      image: image,
      places: places
    });
    const result = await createdUser.save();
    return res.status(201).json({ user: result.toObject({ getters: true }) });
  } catch(err) {
    return next(new HttpError('Signing up failed, please try it again later.', 500));
  }
};

const login = async(req, res, next) => {
  const { email, password } = req.body;

  try {
    const identifiedUser = await User.findOne({ email: email });
    if (!identifiedUser || identifiedUser.password !== password) {
      return next(new HttpError('Could not identify user, credentials seem to be wrong.', 401));
    }
    return res.status(200).json({ message: 'Logged in!' });
  } catch(err) {
    return next(new HttpError('Something went wrong, please try it again later.', 401));
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
