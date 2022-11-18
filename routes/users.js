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
const couponHelper = require('../helpers/coupon-helpers')
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
const { userHomePage, categoryPage, forgetPasswordModal, forgetPasswordModalVerify, forgetPasswordChangePasswordModal, viewProductPage, cartPage, addProductToCart, deleteProductInCart, updateProductQuantityInCart, checkoutPage, placeOrder, razorPayVerifyPayment, orderPage, orderCancel, orderRetryPayment, addressAddRequest, addressDeleteRequest,  addressGetRequest, addressEditRequest, paypalVerifyRequest, transcationFailurePage, transcationSuccessfulPage } = require("../controller/userController");
const { signInSubmit, signInPage, registerSubmit, logOut, loginOtpPage, loginOtpSendCode, loginOtpVerifyCode } = require("../controller/userSigninController");
const { Router, response } = require("express");


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
router.get("/products", async(req,res)=>{
  let user = req.session.user;
  let categories = await categoryHelper.getAllCategory()

  if (req.session.user) {
    let cartCount = await cartHelper.getCartCount(req.session.user._id)
    req.session.user.cartCount = cartCount;
  }
  productHelper.getAllProducts().then((products) => {
    let category
    
    res.render("user/category-page", { products,categories, user });
  });

})

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
router.get('/order/cancel', orderCancel)

//<------------------------------------------Order Retry Payment---------------------------------------------->
router.post('/retryPayment', orderRetryPayment)




//______________________________________________________________ Address ___________________________________________________
router.post('/addAddress', addressAddRequest)

router.delete('/deleteAddress/:id', addressDeleteRequest)

router.get('/getAddress/:id', addressGetRequest)

router.put('/editAddress', addressEditRequest)

//____________________________________________paypal_____________________________________________________


router.get('/paypal/success/:id', paypalVerifyRequest);

router.get('/order-confirmed/:id', transcationSuccessfulPage)

router.get('/order-pending/:id', transcationFailurePage)


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

router.get('/orders/trackOrder/:proId/:orderId',userValidation, async(req,res)=>{
  let user = req.session.user
  let order = await orderHelper.getProductOrder(req.params.orderId , req.params.proId)
res.render('user/trackOrder',{user , order})
})

router.post('/orders/returnOrder',userValidation , (req,res)=>{
 console.log(req.body)
 let status = "Return Requested"
 orderHelper.changeOrderStatusReturn(req.body.orderId , status , req.body.msg , req.body.proId ).then(()=>{
  res.json(status)
 }) 
 
})

router.get('/search',async(req,res)=>{
let keyword = req.query.q;
console.log(keyword)
let products = await productHelper.searchProduct(keyword)
console.log(products.length)
if(products.length == 1)
{
  let product = products[0]
  res.render('user/product-viewer', {product})
}else
{
  res.render('user/category-page',{products})
}
})

router.post('/search',(req,res)=>{
  let payload = req.body.payload
   productHelper.searchSuggestion(payload).then((search)=>{
    res.json(search)
   })
})

router.get('/couponCheck',(req,res)=>{
  let coupon = req.query.coupon;
  console.log(coupon)
 couponHelper.getCoupon(coupon).then((data)=>{
  res.json(data)
 }).catch((err)=>{
  console.log("catch")
  res.json(err=false)
 })

})

module.exports = router;
