const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Hi there 🙋‍♀️',
  });
});


module.exports = app