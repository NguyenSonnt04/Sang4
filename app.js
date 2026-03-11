var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')



var app = express();

// Pure API server - no view engine needed

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/roles', require('./routes/roles'));


//connect
mongoose.connect('mongodb+srv://son2004ntt_db_user:4UJ0yruq9JA64rBV@cluster0.wazkmon.mongodb.net/');
mongoose.connection.on('connected', function () {
  console.log("connected");
})
mongoose.connection.on('disconnected', function () {
  console.log("connected");
})


// 404 handler
app.use(function (req, res, next) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} không tồn tại` });
});

// Error handler - trả JSON thay vì render view
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
