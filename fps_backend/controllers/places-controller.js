const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

/*
let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: 'u2',
  }
];
*/

const getPlaceById = async(req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}

  try {
    const place = await Place.findById(placeId);
    if (!place) {
      return next(new HttpError('Could not find the place for a provided ID', 404));
    }

    return res.status(200).json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError('Something went wrong, could not find a place', 500));
  }
};

const getPlacesByUserId = async(req, res, next) => {
  const userId = req.params.uid;

  try {
    const places = await Place.find({ creator: userId });
    if (places.length <= 0) {
      return next(new HttpError('Could not find any place with this user id', 404));
    }

    return res.status(200).json({ places: places.map(p => p.toObject({ getters: true })) });
  } catch (err) {
    return next(new HttpError('Something went wrong, please try it again later', 500));
  }
};

const createPlace = async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  // object destructuring syntax in modern JS
  const { title, description, address, creator } = req.body;
  let coordinates = {};

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title: title,
    description: description,
    address: address,
    location: coordinates,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    creator: creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch(err) {
    // console.error(user);
    return next(new HttpError('Could not find user for the provided id', 404));
  }

  let sess;
  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    const result = await createdPlace.save({ session: sess });

    // Actually mongoose grabs the createdPlace id and add it to places property,
    // this trick is attributed to the ref property in model file, ref is FK,
    // ORM guys like EF(Entity Framework) does the same: map an id to an object,
    // vice versa.
    user.places.push(createdPlace);
    await user.save({ session: sess });

    // if only if this operation succeeds, all data will be stored in DB, otherwise
    // all relevant data in DB will be rolled back to the status before
    // sess.startTransaction();
    await sess.commitTransaction();

    return res.status(201).json({ place: result.toObject({ getters: true }) });
  } catch (err) {
    console.error(err);
    return next(new HttpError('Creating place failed, sooo please try it again.', 500));
  } finally {
    sess.endSession();
  }
};

const updatePlace = async(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  await Place.findByIdAndUpdate(
    placeId, {
      title: title,
      description: description,
    },
    { new: true }, // indicates to return the UPDATED value, thus true
    (err, result) => { // callback is a must, otherwise it won't be executed
      if (err) {
        // res.send(err);
        return next(new HttpError('Could not update data for this id, please try it again later', 500));
      }
      return res.send(result.toObject({ getters: true }));
    }
  );
};

const deletePlace = async(req, res, next) => {
  const placeId = req.params.pid;

  await Place.findByIdAndDelete(placeId, (err, result) => {
    if (err) {
      return next(new HttpError('Something went wrong, could not delete place', 500));
    }
    return res.status(200).json({ message: `${result.title} is deleted.` });
  });

  /*
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError('Something went wrong, could not delete place', 500));
  }

  try {
    await place.remove();
    return res.status(204);
  } catch (err) {
    return next(new HttpError('Something went wrong, could not delete place, please try it again later', 500));
  }
  */
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
