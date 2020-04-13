const express = require('express');
const bodyParser = require('body-parser');

const placeRoutes = require('./routes/places-routes');

const app = express();

// a filter - only those that start with it are valid
// then it is appended by the '/' in places-routes.js
// the c# equivalent is the attr [Route("api/places")]
app.use('/api/places', placeRoutes); // as a middleware

app.use((err, req, res, next) => {
  if (res.headerSent) {
    // return next and forward the error which means we won't send a response
    // because we did send a response and we can ONLY send ONE response in total
    return next(err);
  }
  res.status(err.code || 500);
  return res.json({ message: err.message || 'An unknown error occurred!' });
});

app.listen(5000);
