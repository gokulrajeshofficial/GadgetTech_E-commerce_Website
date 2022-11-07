const express = require("express");
const router = express.Router();

const session = require("express-session");


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

const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});


//<---------------------------------------------Importing Contollers------------------------------------->
const { userValidation } = require('../controller/validation');
const { userHomePage, categoryPage, forgetPasswordModal, forgetPasswordModalVerify, forgetPasswordChangePasswordModal, viewProductPage, cartPage, addProductToCart, deleteProductInCart, updateProductQuantityInCart, checkoutPage, placeOrder, razorPayVerifyPayment, orderPage, orderCancel, orderRetryPayment } = require("../controller/userController");
const { signInSubmit, signInPage, registerSubmit, logOut, loginOtpPage, loginOtpSendCode, loginOtpVerifyCode } = require("../controller/userSigninController");


//<---------------------------------------------Home Page------------------------------------->
router.get("/", userHomePage);

//<---------------------------------------------Sigin Page------------------------------------->
router.get("/signin", signInPage);

//<-------------------------------------------Sigin Submit------------------------------------->
router.post("/login", signInSubmit);

//<-----------------------------------------Register Submit----------------------------------->
router.post("/register", registerSubmit);

//<-------------------------------------------- Logout --------------------------------------->
router.get("/logout", logOut);

//<----------------------------------------- Login OTP Page -------------------------------------->
router.get("/loginotp", loginOtpPage);

//<-------------------------------------- Login OTP Send code -------------------------------------->
router.post("/loginotp/sendcode", loginOtpSendCode)

//<--------------------------------------- Login OTP Verify Page -------------------------------------->
router.post("/loginotp/verify", loginOtpVerifyCode)

//<--------------------------------------- Forget Password Page -------------------------------------->
router.post('/forgetPassword', forgetPasswordModal)

//<---------------------------------- Forget Password Otp Verification --------------------------------->
router.post('/forgetPassword/verifyOtp/:id', forgetPasswordModalVerify)

//<--------------------------------------- Forget Password change -------------------------------------->
router.patch('/forgetPassword/changePassword', forgetPasswordChangePasswordModal)

//<----------------------------------------- Category Page -------------------------------------->
router.get("/category/:id", categoryPage);

//<--------------------------------------Product View Page -------------------------------------->
router.get("/product/:id", viewProductPage)

//<-----------------------------------------Cart Page ---------------------------------------->
router.get("/cart", userValidation, cartPage);

//<--------------------------------Product Add to Cart ---------------------------------------->
router.post("/add-to-cart/:id", addProductToCart);

//<--------------------------------Product delete from  Cart ---------------------------------------->
router.get("/cart/delete/:id", userValidation, deleteProductInCart);

//<--------------------------------Product quanity update from  Cart ---------------------------------------->
router.post('/cart/quantityUpdate', updateProductQuantityInCart)

//<----------------------------------------Checkout Page ------------------------------------------->
router.get('/checkout', userValidation, checkoutPage)

//<-------------------------------------Place Order Request ------------------------------------------->
router.post('/placeOrder', userValidation, placeOrder)

//<-------------------------------Verify the payment for Razorpay ---------------------------------------->
router.post('/verify-payment', razorPayVerifyPayment)

//<-------------------------------------------Order Page---------------------------------------------->
router.get('/orders', userValidation, orderPage)

//<------------------------------------------Order Cancel---------------------------------------------->
router.get('/order/cancel/:id', orderCancel)

//<------------------------------------------Order Retry Payment---------------------------------------------->
router.post('/retryPayment', orderRetryPayment)




//______________________________________________________________ Address ___________________________________________________
router.post('/addAddress', (req, res) => {
  console.log(req.body)
  let userId = req.session.user._id
  addressHelper.addAddress(userId, req.body).then(() => {
    res.json(req.body)
  })
})
router.delete('/deleteAddress/:id', (req, res) => {
  addressId = req.params.id
  addressHelper.deleteAddress(addressId).then((data) => {
    console.log(data);
    res.json(data);
  })
})

router.get('/getAddress/:id', async (req, res) => {
  console.log(req.params.id);
  let addressId = req.params.id;
  req.session.addressId = addressId;
  let address = await addressHelper.getUserAddress(addressId)
  console.log(address);
  res.json(address)
})

router.put('/editAddress', async (req, res) => {
  let address = req.body;
  let addressId = req.session.addressId
  addressHelper.editUserAddress(addressId, address).then((data) => {
    console.log(data);
    res.json("updated")
  })
})

//____________________________________________paypal_____________________________________________________


router.get('/paypal/success/:id', (req, res) => {
  const orderId = req.params.id;
  console.log(orderId)
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      paymentHelper.changePaymentStatus(orderId).then(() => {
        res.redirect('/order-confirmed/' + orderId);
      })

    }
  });
});

router.get('/order-confirmed/:id', (req, res) => {
  orderId = req.params.id;
  res.render('user/order-success', { signin: true, orderId })
})

router.get('/order-pending/:id', (req, res) => {
  orderId = req.params.id;
  res.render('user/order-failed', { signin: true, orderId })
})


//______________________________________________________________User ________________________________________________________________
router.put('/userDetails/edit', (req, res) => {
  let userId = req.session.user._id;
  let userData = req.body;
  req.session.user.fname = userData.fname;
  req.session.user.lname = userData.lname;
  req.session.user.about = userData.about;
  req.session.user.img = userData.img;

  userHelper.updateUser(userData, userId).then((data) => {
    res.json("success")
  })
})

router.patch('/changePassword', (req, res) => {
  console.log(req.body);
  let passwordData = req.body;
  let userId = req.session.user._id;
  userHelper.changePassword(userId, passwordData).then((data) => {
    res.json(data)
  })


})

//______________________________________________________________________Wishlist _____________________________________________________

router.get('/wishlist', userValidation, async (req, res) => {
  let user = req.session.user;

  let wishlist = await wishlistHelper.getWishlist(req.session.user._id)
  console.log(wishlist);
  res.render('user/wishList', { user, wishlist })
})


router.post("/add-to-wishlist", (req, res) => {
  let proId = req.body.proId;

  if (req.session.user) {
    console.log("directed");
    wishlistHelper.addToWishlist(proId, req.session.user._id).then((data) => {
      console.log(data);
      let response = "";
      res.json(response);
    });
  } else {
    console.log("redirect");
    let response = "redirect";
    res.json(response);
  }
});

router.delete('/wishlist/delete/:id', (req, res) => {
  let proId = req.params.id;
  let userId = req.session.user._id;
  console.log(userId);
  wishlistHelper.deleteWishlistProduct(userId, proId).then((data) => {
    res.json("deleted")
  })
})




module.exports = router;
