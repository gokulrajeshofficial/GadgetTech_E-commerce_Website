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
const dotenv = require('dotenv').config()

const client = require("twilio")(
  process.env.TWILIO_SECRET_SID_ID,
  process.env.TWILIO_SECRET_KEY
);


module.exports.signInPage = (req, res, next) => {
    res.render("user/login");
  }
  
  module.exports.signInSubmit = (req, res, next) => {
    userHelper.loginIn(req.body).then(async (response) => {
      if (response.status && response.user.status) {
        error1 = "";
        req.session.user = response.user;
        req.session.user.loggedin = true;
        let cartCount = await cartHelper.getCartCount(req.session.user._id)
        req.session.user.cartCount = cartCount;
        let status = "success";
        res.json(status);
      } else {
        if (response.status == false) {
          let status = "* Invalid user name or password";
          res.json(status);
        } else {
          let status = "* User is blocked";
          res.json(status);
        }
      }
    });
  }
  
  module.exports.registerSubmit = (req, res, next) => {
    delete req.body.confirmpassword;
    req.body.status = true;
    console.log(req.body);
    userHelper.addUser(req.body).then((response) => {
      console.log(response);
  
      res.json(response);
    });
  }
  
  module.exports.logOut = (req, res, next) => {
    delete req.session.user;
    res.redirect("/");
  }

  module.exports.loginOtpPage = (req, res, next) => {
    res.render("user/loginotp");
  }

  module.exports.loginOtpSendCode = (req, res) => {
    console.log("The Phone number is : " + req.body.phonenumber);
    userHelper.getPhoneNumber(req.body.phonenumber).then((response) => {
      req.session.user = response.user;
      if (response.status == true) {
        client.verify
          .services(process.env.TWILIO_SECRET_SERVICE_ID) // Change service ID
          .verifications.create({
            to: `+91${req.body.phonenumber}`,
            channel: "sms",
          })
          .then((data) => {
            let response = {
              status: true,
              message: "Verification is sent!!",
              phonenumber: req.body.phonenumber,
              data,
            };
            res.json(response)
            console.log(response.message);
          }).catch((err) => {
            let response = {
              status: false,
              message: "Run out of SMS services!!",
              data: err
            }
            console.log(response.message)
            res.json(response)
          })
      } else {
        delete req.session.user;
        message = "Mobile Number is not linked to any accounts";
        console.log(message)
        res.json({ message, status: false })
      }
    })
  }

  module.exports.loginOtpVerifyCode  = (req, res) => {
    console.log('Verify enter');
    let phonenumber = req.body.phonenumber
    client.verify
      .services(process.env.TWILIO_SECRET_SERVICE_ID) // Change service ID
      .verificationChecks.create({
        to: `+91${phonenumber}`,
        code: req.body.code,
      })
      .then((data) => {
        if (data.status === "approved") {
          let response = {
            message: "User is Verified!!",
            status: true
          };
  
          console.log(response.message);
          userHelper.getPhoneNumber(phonenumber).then((response) => {
            req.session.user = response.user;
            req.session.user.loggedin = true;
            console.log(req.session.user);
            res.json(response)
          })
        } else {
          delete req.session.user;
          let response = {
            message: "User is not Verified!!",
            status: false,
            data: data,
          };
          delete usertransfer;
          error1 = response.message;
          res.json(response)
        }
      })
  }