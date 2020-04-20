const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placeRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// a filter - only those that start with it are valid
// then it is appended by the '/' in places-routes.js
// the c# equivalent is the attr [Route("api/places")]
app.use('/api/places', placeRoutes); // as a middleware
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  throw new HttpError('Could not find this route.', 404);
});

app.use((err, req, res, next) => {
  if (res.headerSent) {
    // return next and forward the error which means we won't send a response
    // because we did send a response and we can ONLY send ONE response in total
    return next(err);
  }
  res.status(err.code || 500);
  return res.json({ message: err.message || 'An unknown error occurred!' });
});

// places is the DB name, if it exists just open it otherwise crete then open it
mongoose.connect('mongodb+srv://jerry:kgXYke6a1tR6vFzH@cluster0-hiwha.mongodb.net/places?retryWrites=true&w=majority')
        .then(() => {
          app.listen(5000);
        })
        .catch(err => {
          console.error(err);
        });
