const express = require("express");
const session = require("express-session");


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

  module.exports.adminValidation = (req, res, next)=> {
    if (req.session.adminloggedIn == true) {
      next();
    } else {
      res.redirect("/admin/signin");
    }
  }