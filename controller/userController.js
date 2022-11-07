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

const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});


let error1 = "";
let status = "";
let usertransfer;

//<-----------------------------Declarations------------------------------------------------------------>



module.exports.userHomePage = (req, res, next) => {
  bannerHelper.getAllBanners().then((banners) => {
    categoryHelper.getAllCategory().then((categories) => {
      productHelper.getAllProducts().then(async (products) => {

        if (req.session.user) {
          let cartCount = await cartHelper.getCartCount(req.session.user._id)
          req.session.user.cartCount = cartCount;
          console.log(req.session.user);
          let user = req.session.user;
          res.render("user/home", { user, banners, categories, products });
        } else {
          res.render("user/home", { banners, categories, products });
        }
      });
    });
  });
}


module.exports.categoryPage = async (req, res) => {
  let user = req.session.user;
  if (req.session.user) {
    let cartCount = await cartHelper.getCartCount(req.session.user._id)
    req.session.user.cartCount = cartCount;
  }
  productHelper.categoryProducts(req.params.id).then((products) => {
    let category = {
      _id: objectId(products[0].Category._id),
      category: products[0].Category.category,
    };

    console.log(req.session.user);
    console.log(category);
    res.render("user/category-page", { products, category, user });
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

module.exports.viewProductPage = (req, res) => {
  productHelper.getProduct(req.params.id).then((response) => {
    product = response.product;
    let user = req.session.user;
    res.render("user/product-viewer", { product, user });
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

        res.render('user/checkout', { user, cartProducts, cartTotal, addresses });
      })
    }
    else {
      res.redirect('/');
    }

  })
}

module.exports.placeOrder = async (req, res) => {
  let data = req.body;
  cartTotal = await cartHelper.totalCartPrice(data.userId);
  data.total = cartTotal.total
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
    data.status = "Preparing for Dispatch"
  }
  else {
    data.paymentStatus = "Pending";
    data.status = "Payment Pending"
  }

  console.log(data)
  orderHelper.addOrder(data).then((orderId) => {
    if (data.payment == 'COD') {
      cartHelper.removeAllProducts(req.session.user._id).then(async (msg) => {
        let cartCount = await cartHelper.getCartCount(req.session.user._id)
        req.session.user.cartCount = cartCount;
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
          res.json(order)
        })
      })
    }

  })
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


module.exports.orderPage =  async (req, res) => {
  let user = req.session.user
  let userId = req.session.user._id;
  let addresses = await addressHelper.getAddresses(userId)
  let orders = await orderHelper.getOrders(userId)
  // await paymentHelper.createInvoice().then((invoice)=>{
  // console.log('PDF base64 string: ', invoice.pdf);
  console.log(user)
  console.log(orders);
  res.render('user/orders', { user, addresses, orders })
}

module.exports.orderCancel = (req, res) => {
  console.log(req.params.id);
  orderHelper.cancelOrder(req.params.id).then((data) => {
    console.log(data)
    res.json("success")
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
