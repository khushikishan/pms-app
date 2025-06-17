require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

//middleware
const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

//json
app.use(express.json());

//db
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  console.log('MongoDB connected');
}).catch(function (error) {
  console.log('MongoDB connection error');
  console.log(error);
});

//routes
const apiRoutes = require('./routes/auth');
app.use('/api', apiRoutes);

//start
app.listen(port, function () {
  console.log('Server running on port ' + port);
});