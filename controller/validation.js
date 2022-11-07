const express = require("express");
const session = require("express-session");

const router = express.Router();
const userHelper = require("../helpers/user-helper");
const productHelper = require("../helpers/product-helper");
const bannerHelper = require("../helpers/banner-helper");
const categoryHelper = require("../helpers/category-helper");
const { validateRequestWithBody } = require("twilio/lib/webhooks/webhooks");
const cartHelper = require("../helpers/cart-helper");
const addressHelper = require("../helpers/address-helper");
const orderHelper = require("../helpers/order-helpers");
const paymentHelper = require("../helpers/payment-helper");
const wishlistHelper = require("../helpers/wishlist-helper")
const objectId = require('mongodb').ObjectId;

module.exports.userValidation =  (req, res, next)=>{
    if (req.session.user) {
      if (req.session.user.loggedin == true) {
        next();
      } else {
        res.redirect("/signin");
      }
    } else {
      res.redirect("/signin");
    }
  }