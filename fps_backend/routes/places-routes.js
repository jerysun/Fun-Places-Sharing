const express = require('express');
const router = express.Router();
const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u2'
  },
  {
    id: 'p2',
    title: 'Empire State Building Again!',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u2'
  }
];

// the '/' is a must to be appended on the '/api/places' in app.js, furthermore
// if it's a Dynamic Route Segment, then we need append a semicolon :, i.e. '/:'
router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}
  const place = DUMMY_PLACES.find(p => p.id === placeId);
  if (!place) {
    // synchronous. It'll trigger the error handling middleware in app.js
    throw new HttpError('Could not find the place for a provided ID', 404);
  }
  res.json({ place: place });
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);
  if (places.length <= 0) {
    // asynchronous; It'll trigger the error handling middleware in app.js
    return next(new HttpError('Could not find any place with this user id', 404));
  }
  return res.json({ places: places });
});

module.exports = router;
