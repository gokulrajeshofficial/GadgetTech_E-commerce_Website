const express = require("express");
const router = express.Router();


//<---------------------------------------------Importing Contollers------------------------------------->
const { userValidation } = require('../controller/validation');
const { userHomePage, categoryPage, forgetPasswordModal, forgetPasswordModalVerify, forgetPasswordChangePasswordModal, viewProductPage, cartPage, addProductToCart, deleteProductInCart, updateProductQuantityInCart, checkoutPage, placeOrder, razorPayVerifyPayment, orderPage, orderCancel, orderRetryPayment, addressAddRequest, addressDeleteRequest,  addressGetRequest, addressEditRequest, paypalVerifyRequest, transcationFailurePage, transcationSuccessfulPage, category, allProductsPage, editUserDetails,  changePasswordRequest, brandPage, addtoWishlistRequest, deleteWishlistRequest, trackOrderPage, returnUserRequest, searchPage, searchRequest, couponCheckRequest, wishlistPage } = require("../controller/userController");
const { signInSubmit, signInPage, registerSubmit, logOut, loginOtpPage, loginOtpSendCode, loginOtpVerifyCode } = require("../controller/userSigninController");



//<---------------------------------------------Home Page------------------------------------->
router.get("/",category, userHomePage);

//<---------------------------------------------Sigin Page------------------------------------->
router.get("/signin",category, signInPage);

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
router.get("/category/:id" ,category, categoryPage);

//<----------------------------------------- Brand Page -------------------------------------->
router.get("/brand/:id" ,category, brandPage);

//<--------------------------------------All Product Page -------------------------------------->
router.get("/products",category, allProductsPage)

//<--------------------------------------Product View Page -------------------------------------->
router.get("/product/:id",category, viewProductPage)

//<-----------------------------------------Cart Page ---------------------------------------->
router.get("/cart", userValidation,category, cartPage);

//<--------------------------------Product Add to Cart ---------------------------------------->
router.post("/add-to-cart/:id", addProductToCart);

//<--------------------------------Product delete from  Cart ---------------------------------------->
router.get("/cart/delete/:id", userValidation, deleteProductInCart);

//<--------------------------------Product quanity update from  Cart ---------------------------------------->
router.post('/cart/quantityUpdate', updateProductQuantityInCart)

//<----------------------------------------Wishlist Page---------------------------------------------->
router.get('/wishlist', userValidation,category, wishlistPage)

//<--------------------------------------Add to wishlist ---------------------------------------------->
router.post("/add-to-wishlist", addtoWishlistRequest);

//<-----------------------------------Delete Product from Wishlist----------------------------------------->
router.delete('/wishlist/delete/:id', deleteWishlistRequest)

//<----------------------------------------Checkout Page ------------------------------------------->
router.get('/checkout', userValidation,category, checkoutPage)

//<-------------------------------------Place Order Request ------------------------------------------->
router.post('/placeOrder', userValidation, placeOrder)
 
//<-------------------------------Verify the payment for Razorpay ---------------------------------------->
router.post('/verify-payment', razorPayVerifyPayment)

//<-------------------------------------------Order Page---------------------------------------------->
router.get('/dashboard/:option', userValidation,category, orderPage)

//<------------------------------------------Order Cancel---------------------------------------------->
router.get('/order/cancel', orderCancel)

//<------------------------------------------Order Retry Payment---------------------------------------------->
router.post('/retryPayment', orderRetryPayment)

//<------------------------------------------Add Address---------------------------------------------->
router.post('/addAddress', addressAddRequest)

//<------------------------------------------Delete Address---------------------------------------------->
router.delete('/deleteAddress/:id', addressDeleteRequest)

//<------------------------------------------Get Address ---------------------------------------------->
router.get('/getAddress/:id', addressGetRequest)
 
//<------------------------------------------Edit Address---------------------------------------------->
router.put('/editAddress', addressEditRequest)

//<---------------------------------------Paypal Verifying payment Success ---------------------------------------->
router.get('/paypal/success/:id', paypalVerifyRequest);

//<---------------------------------------Transcation Sucessful Page------------------------------------------>
router.get('/order-confirmed/:id', transcationSuccessfulPage)

//<----------------------------------------Transcation Failed Page---------------------------------------------->
router.get('/order-pending/:id', transcationFailurePage)

//<----------------------------------------Edit User Details---------------------------------------------->
router.put('/userDetails/edit', editUserDetails)

//<----------------------------------------Change Password---------------------------------------------->
router.patch('/changePassword', changePasswordRequest)


//<-----------------------------------Track Order Page----------------------------------------->
router.get('/orders/trackOrder/:proId/:orderId',userValidation,category, trackOrderPage)

//<----------------------------------- Return Request----------------------------------------->
router.post('/orders/returnOrder',userValidation , returnUserRequest)

//<-------------------------------------Search Page----------------------------------------->
router.get('/search',category,searchPage)

//<-------------------------------------Search Request----------------------------------------->
router.post('/search',searchRequest)

//<-------------------------------------Coupon Check----------------------------------------->
router.get('/couponCheck',couponCheckRequest)

module.exports = router;
