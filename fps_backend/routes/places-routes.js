const express = require('express');
const { check } = require('express-validator');

const router = express.Router();
// They are OK too, but we need the controller name as the namespace
// for the neatness and readability if more controllers are involved
/*
const { getPlaceById, getPlacesByUserId } = require('../controllers/places-controller');
router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);
*/

// placeController is the module name of place-controller.js - a naming convention
const placeController = require('../controllers/places-controller');

// the '/' is a must to be appended on the '/api/places' in app.js, furthermore
// if it's a Dynamic Route Segment, then we need append a semicolon :, i.e. '/:'
router.get('/:pid', placeController.getPlaceById);
router.get('/user/:uid', placeController.getPlacesByUserId);
router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placeController.createPlace
);
router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placeController.updatePlace
);
router.delete('/:pid', placeController.deletePlace);

module.exports = router;
