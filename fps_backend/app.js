const express = require('express');
const bodyParser = require('body-parser');

const placeRoutes = require('./routes/places-routes');

const app = express();

app.use(placeRoutes); // as a middleware

app.listen(5000);
