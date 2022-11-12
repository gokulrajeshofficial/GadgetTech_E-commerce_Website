var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var session = require('express-session');
var app = express();
var db = require('./config/connect')
var Handlebars = require('handlebars');
const nocache = require("nocache");
const { ObjectId } = require('mongodb');
const multer = require('multer');
const dotenv = require('dotenv').config()
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials'
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SESSION_KEY , resave: true, saveUninitialized: true, cookie: { maxAge: 6000000 } }));
app.use(nocache());


db.connect((err) => {
  if (err) { console.log("Database is not connected"); }
  else { console.log("Database is connected") }
})

Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
Handlebars.registerHelper("checkStatus", function (value, options) {
  if (value == 'Payment Pending') 
  { return true; }
  else {
    return false;
  }
});

Handlebars.registerHelper("checkDeliveredCancelled", function (value, options) {
  if (value == 'Delivered' || value == 'Cancelled' || value == 'Return Requested') { return true; }
  else {
    return false;
  }
});

Handlebars.registerHelper("checkDeliveredOrder", function (value, options) {
  if (value == 'Delivered' ) { return true; }
  else {
    return false;
  }
}); 
Handlebars.registerHelper("checkDelivered", function (value, options) {
  if (value == 'Delivered' || value == 'Return Requested') { return true; }
  else {
    return false;
  }
});
Handlebars.registerHelper("checkOrdered", function (value, options) {
  if (value == 'Preparing for Dispatch') { return true; }
  else {
    return false;
  }
});
Handlebars.registerHelper("checkShipped", function (value, options) {
  if (value == 'Shipped') { return true; }
  else {
    return false;
  }
}); 

Handlebars.registerHelper("checkReturned", function (value, options) {
  if (value == 'Return Approved') { return true; }
  else {
    return false;
  }
})


Handlebars.registerHelper("checkpaymentStatus", function (value, options) {
  if (value != 'Pending') { return true; }
  else { return false; }
});

Handlebars.registerHelper("categoryPremium", function (value, options) {
  if (value.category == "Laptop") {
    value = true
  }
  else {
    value = false
  }
  return value;
});


Handlebars.registerHelper("checkDebit", function (value, options) {
  if (value > 0) {
    value = true
  }
  else {
    value = false
  }
  return value ;
});


Handlebars.registerHelper("totalProduct", function (quantity, price) {
  price = parseInt(price)
  quantity = parseInt(quantity)
  total = price * quantity
  console.log(price)
  return parseInt(total);
});

Handlebars.registerHelper("checkquantity", (quantity) => {
  if (quantity > 0) {
    return true
  } else {
    return false
  }
})


app.use('/', usersRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
