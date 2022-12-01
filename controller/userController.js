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
const couponHelper = require('../helpers/coupon-helpers')
const brandHelper = require('../helpers/brand-helper')

const objectId = require('mongodb').ObjectId;


const dotenv = require('dotenv').config()
const client = require("twilio")(
  process.env.TWILIO_SECRET_SID_ID,
  process.env.TWILIO_SECRET_KEY
);

const paypal = require('paypal-rest-sdk');
const salesHelper = require("../helpers/sales-helper");

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});


//<-----------------------------Declarations------------------------------------------------------------>

 

module.exports.userHomePage = (req, res, next) => {
  bannerHelper.getAllBanners().then((banners) => {
    categoryHelper.getAllCategory().then((categories) => {
      productHelper.getAllProducts().then(async (products) => {
        let brands = await brandHelper.getAllBrand()
        let topSellingProducts = await salesHelper.topSellingProducts()
        if (req.session.user) {
          let cartCount = await cartHelper.getCartCount(req.session.user._id)
          req.session.user.cartCount = cartCount;  
          console.log(req.session.user);
          let user = req.session.user;
          res.render("user/home", { user, banners, categories, products , brands , topSellingProducts });
        } else {
          res.render("user/home", { banners, categories, products , brands , topSellingProducts});
        }
      });
    });
  });
}


module.exports.categoryPage = async (req, res) => {
   let user = req.session.user;
   let page = {};
   page.total = await productHelper.categoryProductsCount(req.params.id)

  page.perPage = 3 ;
  page.pages = Math.ceil(page.total /page.perPage );

  page.pageNumber =(req.query.page == null) ? 1 : parseInt(req.query.page);
  page.startFrom = (page.pageNumber - 1)*page.perPage;
  console.log(page)

  if (req.session.user) {
    let cartCount = await cartHelper.getCartCount(req.session.user._id)
    req.session.user.cartCount = cartCount;
  }
  productHelper.categoryProducts(req.params.id , page).then(async(products) => {
    page.perPage = products.length
   let category = await categoryHelper.getCategory(req.params.id)
    res.render("user/category-page", { products, category, user ,page});
  });
}


module.exports.brandPage  = async(req,res)=>{

  let user = req.session.user;
  let page = {};
  
  page.total = await productHelper.brandProductsCount(req.params.id)

 page.perPage = 3 ;
 page.pages = Math.ceil(page.total /page.perPage );

 page.pageNumber =(req.query.page == null) ? 1 : req.query.page;
 page.startFrom = (page.pageNumber - 1)*page.perPage;


 if (req.session.user) {
   let cartCount = await cartHelper.getCartCount(req.session.user._id)
   req.session.user.cartCount = cartCount;
 }
 let products = await productHelper.brandProducts(req.params.id , page)
 page.perPage = products.length
 console.log(products)
  let brand = await brandHelper.getBrand(req.params.id)
  res.render("user/category-page", { products, brand, user , page});
}



module.exports.allProductsPage = async(req,res)=>{
  let user = req.session.user;
  let categories = await categoryHelper.getAllCategory() 
 
  if (req.session.user) {
    let cartCount = await cartHelper.getCartCount(req.session.user._id)
    req.session.user.cartCount = cartCount;
  }
  productHelper.getAllProducts().then((products) => {
    
    res.render("user/category-page", { products,categories, user });
  });

}

module.exports.forgetPasswordModal = (req, res) => {
  userHelper.getPhoneNumber(req.body.phoneNumber).then((response) => {
    if (response.status) {
      if (response.user.email == req.body.email) {
        client.verify
          .services(process.env.TWILIO_SECRET_SERVICE_ID) // Change service ID
          .verifications.create({
            to: `+91${req.body.phoneNumber}`,
            channel: "sms",
          })
          .then((data) => {
            response.phoneNumber = req.body.phoneNumber;
            res.json(response)
          }).catch((err) => {
            console.log(err)
          })
      }
      else {
        response.message = "The Username is not linked to the given Mobile Number"
        response.status = false;
        console.log(response.message)
        res.json(response)
      }
    }
    else {
      console.log(response.message)
      res.json(response)
    }
  })
}


module.exports.editUserDetails = (req, res) => {
  let userId = req.session.user._id;
  let userData = req.body;
  req.session.user.fname = userData.fname;
  req.session.user.lname = userData.lname;
  req.session.user.about = userData.about;
  req.session.user.img = userData.img;

  userHelper.updateUser(userData, userId).then((data) => {
    res.json("success")
  })
}

module.exports.category = async(req,res,next)=>{
  res.locals.categories= await categoryHelper.getAllCategory()
  res.locals.brands= await brandHelper.getAllBrand()
  next()
 }

module.exports.forgetPasswordModalVerify = (req, res) => {
  let phoneNumber = req.params.id
  req.session.phoneNumber = phoneNumber;
  client.verify
    .services(process.env.TWILIO_SECRET_SERVICE_ID) // Change service ID
    .verificationChecks.create({
      to: `+91${phoneNumber}`,
      code: req.body.otp,
    })
    .then((data) => {
      if (data.status === "approved") {
        let response = {
          message: "OTP is Verified!!",
          status: true
        };
        res.json(response)
      } else {
        let response = {
          message: "OTP is Invalid!!",
          data: data,
          status: false
        };
        console.log(response)
        res.json(response)
      }
    })
}

module.exports.forgetPasswordChangePasswordModal = (req, res) => {
  console.log(req.body);
  let passwordData = req.body.newPassword;
  let phoneNumber = req.session.phoneNumber;
  console.log(req.session.phoneNumber)
  userHelper.forgetPasswordchangePassword(phoneNumber, passwordData).then((data) => {
    console.log(data.data)
    res.json(data);
  })
}

module.exports.viewProductPage = async(req, res) => {
  productHelper.getProduct(req.params.id).then((response) => {
    product = response.product;
    let user = req.session.user;
    res.render("user/product-viewer", { product, user  });
  });
}

module.exports.cartPage = (req, res) => {
  let userId = req.session.user._id
  cartHelper.getCart(userId).then(async (cartProducts) => {
    let cartCount = await cartHelper.getCartCount(req.session.user._id)
    req.session.user.cartCount = cartCount;
    let user = req.session.user;
    console.log(cartProducts);
    cartHelper.totalCartPrice(userId).then((cartTotal) => {
      res.render("user/cart", { user, cartProducts, cartTotal });
    })
  });
}

module.exports.addProductToCart = (req, res) => {
  let qty = req.body.qty;
  let proId = req.params.id;
  let response = {};

  if (req.session.user) {
    console.log("directed");
    cartHelper.addToCart(proId, qty, req.session.user._id).then(async (data) => {
      console.log(data);
      let cartCount = await cartHelper.getCartCount(req.session.user._id)
      response.status = "directed";
      response.cartCount = cartCount
      res.json(response);
    });
  } else {
    console.log("redirect");
    response.status = "redirect";
    res.json(response);
  }
}

module.exports.deleteProductInCart = (req, res) => {
  let productId = req.params.id;
  let userId = req.session.user._id;
  console.log(userId);
  console.log(productId);
  cartHelper.deleteCartProduct(userId, productId).then(async () => {
    let cartTotal = await cartHelper.totalCartPrice(userId)
    let cartCount = await cartHelper.getCartCount(req.session.user._id)
    let response = {
      cartCount: cartCount
    }

    if (cartTotal) {
      response.cartTotal = cartTotal.total
    }
    else {
      response.cartTotal = 0
    }
    res.json(response);

  });
}

module.exports.updateProductQuantityInCart = (req, res) => {
  let productId = req.body.productId;
  let userId = req.session.user._id;
  let quantity = req.body.quantity;

  cartHelper.quantityChange(userId, productId, quantity).then(async (data) => {
    console.log(data);
    let cartTotal = await cartHelper.totalCartPrice(userId)
    res.json(cartTotal.total);
  })
}

module.exports.checkoutPage = (req, res) => {
  let user = req.session.user
  let userId = user._id
  cartHelper.getCart(userId).then((cartProducts) => {
    if (cartProducts.length != 0) {

      console.log(cartProducts.length)
      cartHelper.totalCartPrice(userId).then(async (cartTotal) => {
        let addresses = await addressHelper.getAddresses(userId);
        let wallet = await orderHelper.getWallet(userId)
        let coupons = await couponHelper.getAllCoupon()
        res.render('user/checkout', { user, cartProducts, cartTotal, addresses, wallet , coupons });
      })
    }
    else {
      res.redirect('/dashboard/orders');
    }

  })
}

module.exports.placeOrder = async (req, res) => {
  
  let data = req.body;
  data.userId = req.session.user._id;
  cartTotal = await cartHelper.totalCartPrice(data.userId);
  let wallet = await orderHelper.getWallet(data.userId)
  
  if(data.coupon)
  {
    cartTotal.total = parseInt(data.couponAmount);
    await couponHelper.updateUserCoupon( data.userId , data.coupon )
    data.coupon = await couponHelper.getCoupon(data.coupon)
    
  }
  data.orderTotal = cartTotal.total; 


  if (data.walletCheck) {
    data.total = parseInt(cartTotal.total) - parseInt(wallet.walletTotal)
    if (data.total <= 0) {
     wallet.walletTotal = wallet.walletTotal - cartTotal.total;
      wallet.debit = - cartTotal.total;
      data.total = 0
      console.log("NO Money is payed ")
      console.log(wallet.debit)
    } else {
      wallet.debit = - parseInt(wallet.walletTotal)
      wallet.walletTotal = 0
    }
  } else {
    data.total = parseInt(cartTotal.total)
  }

  data.orderTime = new Date();
  let d = new Date()
  data.date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  data.month = d.getMonth() + 1;
  data.year = d.getFullYear();
  data.userId = objectId(data.userId)
  data.address = await addressHelper.getUserAddress(data.address)
  data.products = await cartHelper.getCart(data.userId);
  data.total = parseInt(data.total);
  if (data.payment == 'COD') {

    data.paymentStatus = "Placed"
    data.status = "Order Placed"
  }
  else {
    data.paymentStatus = "Pending";
    data.status = "Payment Pending"
  } 
  data.products.forEach((product)=>{
    product.shippingStatus = "Preparing for Dispatch";
  })
  console.log(data)
  orderHelper.addOrder(data).then(async(orderId) => {

    if (data.payment == 'COD') {
      cartHelper.removeAllProducts(req.session.user._id).then(async (msg) => {
        let cartCount = await cartHelper.getCartCount(req.session.user._id)
        req.session.user.cartCount = cartCount;


        if (data.walletCheck) {
          await orderHelper.updateWallet(data.userId, wallet.walletTotal, wallet.debit , orderId)
        }
        res.json("success")
      })
    }
    else if (data.payment == 'razorPay') {
      paymentHelper.generateRazorPay(orderId, data.total).then((response) => {
        cartHelper.removeAllProducts(req.session.user._id).then(async (msg) => {
          let cartCount = await cartHelper.getCartCount(req.session.user._id)
          req.session.user.cartCount = cartCount;

          let order = {
            response: response,
            payment: data.payment
          }

          if (data.walletCheck) {
            await orderHelper.updateWallet(data.userId, wallet.walletTotal, wallet.debit , orderId)
          }
          res.json(order)
        })
      })
        .catch(async (err) => {
          let order = {
            err: err,
            payment: data.payment
          }
          await orderHelper.deleteOrder(orderId)
          res.json(order)
        })
    }
    else if (data.payment == 'payPal') {
      paymentHelper.generatePayPal(orderId, data.total).then((response) => {

        cartHelper.removeAllProducts(req.session.user._id).then(async (msg) => {
          let cartCount = await cartHelper.getCartCount(req.session.user._id)
          req.session.user.cartCount = cartCount;

          let order = {
            response: response,
            payment: data.payment
          }

          if (data.walletCheck) {
            await orderHelper.updateWallet(data.userId, wallet.walletTotal, wallet.debit ,orderId)
          }
          res.json(order)
        })
      })
      .catch(async(err)=>{
        console.log("Catched")
        let order = {
          err: err,
          payment: data.payment
        }
        await orderHelper.deleteOrder(orderId)
        res.json(order); 

      })
    }

  })
  // res.json("sucess")
}

module.exports.razorPayVerifyPayment = (req, res) => {
  paymentHelper.verifyPayment(req.body).then(() => {
    paymentHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment successful")
      res.json({ status: true });
    })
  }).catch((err) => {
    console.log(err)
    res.json({ status: false })
  })
}


module.exports.orderPage = async (req, res) => {
  let user = req.session.user
  let userId = req.session.user._id;
  let addresses = await addressHelper.getAddresses(userId)
  let orders = await orderHelper.getOrders(userId)
  let wallet = await orderHelper.getWallet(userId)
  console.log(wallet)
  // await paymentHelper.createInvoice().then((invoice)=>{
  // console.log('PDF base64 string: ', invoice.pdf);
  console.log(user)
  console.log(orders);
  res.render('user/orders', { user, addresses, orders, wallet })
}

module.exports.orderCancel = (req, res) => {
  console.log(req.query);
 orderHelper.refundWallet(req.session.user._id , req.query.orderId , req.query.proId).then(()=>{
     orderHelper.cancelOrder(req.query.orderId , req.query.proId , req.query.qty).then((data) => {
      console.log(data)
      res.json("success") 
    })
  })
} 

module.exports.orderRetryPayment = (req, res) => {
  let payment = req.body.payment;
  let orderId = req.body.orderId
  let total = req.body.total;
  console.log(orderId)
  if (payment == 'razorPay') {
    paymentHelper.generateRazorPay(orderId, total).then((response) => {
      let order = {
        response: response,
        payment: payment
      }
      res.json(order)
    })
  }
  else if (payment == 'payPal') {
    paymentHelper.generatePayPal(orderId, total).then((response) => {
      let order = {
        response: response,
        payment: payment
      }
      res.json(order)
    })

  }
}
module.exports.addressAddRequest = (req, res) => {
  console.log(req.body)
  let userId = req.session.user._id
  addressHelper.addAddress(userId, req.body).then(() => {
    res.json(req.body)
  })
}

module.exports.addressDeleteRequest = (req, res) => {
  addressId = req.params.id
  addressHelper.deleteAddress(addressId).then((data) => {
    console.log(data);
    res.json(data);
  })
}

module.exports.addressGetRequest = async (req, res) => {
  console.log(req.params.id);
  let addressId = req.params.id;
  req.session.addressId = addressId;
  let address = await addressHelper.getUserAddress(addressId)
  console.log(address);
  res.json(address)
}

module.exports.addressEditRequest = async (req, res) => {
  let address = req.body;
  let addressId = req.session.addressId
  addressHelper.editUserAddress(addressId, address).then((data) => {
    console.log(data);
    res.json("updated")
  })
}

module.exports.paypalVerifyRequest = (req, res) => {
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
}

module.exports.transcationSuccessfulPage = (req, res) => {
  orderId = req.params.id;
  res.render('user/order-success', { signin: true, orderId })
}
module.exports.transcationFailurePage = (req, res) => {
  orderId = req.params.id;
  res.render('user/order-failed', { signin: true, orderId })
}
 
module.exports.changePasswordRequest = (req, res) => {
  console.log(req.body);
  let passwordData = req.body;
  let userId = req.session.user._id;
  userHelper.changePassword(userId, passwordData).then((data) => {
    res.json(data)
  })
}

module.exports.wishlistPage = async (req, res) => {
  let user = req.session.user;

  let wishlist = await wishlistHelper.getWishlist(req.session.user._id)
  console.log(wishlist);
  res.render('user/wishList', { user, wishlist })
}

module.exports.addtoWishlistRequest = (req, res) => {
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
}
module.exports.deleteWishlistRequest = (req, res) => {
  let proId = req.params.id;
  let userId = req.session.user._id;
  console.log(userId);
  wishlistHelper.deleteWishlistProduct(userId, proId).then((data) => {
    res.json("deleted")
  })
}

module.exports.trackOrderPage = async(req,res)=>{
  let user = req.session.user
  let order = await orderHelper.getProductOrder(req.params.orderId , req.params.proId)
res.render('user/trackOrder',{user , order})
}

module.exports.returnUserRequest = (req,res)=>{
  console.log(req.body)
  let status = "Return Requested"
  orderHelper.changeOrderStatusReturn(req.body.orderId , status , req.body.msg , req.body.proId ).then(()=>{
   res.json(status)
  }) 
 }

 module.exports.searchPage = async(req,res)=>{
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
  }

  module.exports.searchRequest =(req,res)=>{
    let payload = req.body.payload
     productHelper.searchSuggestion(payload).then((search)=>{
      res.json(search)
     })
  }

  module.exports.couponCheckRequest  = (req,res)=>{
    let coupon = req.query.coupon;
    console.log(coupon)
   couponHelper.getCoupon(coupon ,req.session.user._id).then((data)=>{
    res.json(data)
   }).catch((err)=>{
    console.log("catch")
    res.json(err)
   })
  }