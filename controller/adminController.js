var express = require("express");
var router = express.Router();
var userHelper = require("../helpers/user-helper");
var productHelper = require("../helpers/product-helper");
var categoryHelper = require('../helpers/category-helper')
var brandHelper = require('../helpers/brand-helper')
var bannerHelper = require('../helpers/banner-helper')
const orderHelper = require('../helpers/order-helpers')
const couponHelper = require('../helpers/coupon-helpers')
const salesHelper = require('../helpers/sales-helper')
const { uploadProduct, uploadBanner, uploadBrand, uploadCategory } = require('../public/javascripts/multer');
const { updateBanner } = require("../helpers/banner-helper");
let err_message = "";
const admincredentials = {
  username: "admin",
  password: "admin",
};




module.exports.adminDashboardPage = async (req, res) => {
  let dailysales = await salesHelper.dailySalesReport()
  let monthlysales = await salesHelper.monthlySalesReport()
  let yearlysales = await salesHelper.yearlySalesReport()
  let topSellingProducts = await salesHelper.topSellingProducts()
  res.render("admin/home", { admin: true, dailysales, monthlysales, yearlysales, topSellingProducts });
}

module.exports.signInRequest = function (req, res, next) {
  console.log(req.body);
  if (
    admincredentials.username == req.body.username &&
    admincredentials.password == req.body.password
  ) {
    req.session.adminloggedIn = true;
    res.redirect("/admin");
  } else {
    err_message = "Username or Password is wrong";
    res.redirect("/admin/signin");
  }
}

module.exports.signInPage = (req, res, next) => {
  res.render("admin/adminlogin", { signin: true, err_message });
  err_message = "";
}

module.exports.logout = (req, res, next) => {
  req.session.adminloggedIn = false;
  res.redirect("/admin/signin");
}

module.exports.salesReportPage = async (req, res, next) => {
  let DailySalesforDownload = await salesHelper.dailySalesReport()
  let MonthlySalesforDownload = await salesHelper.monthlySalesReport();
  let YearlySalesforDownload = await salesHelper.yearlySalesReport();
  res.render("admin/salesReport", { admin: true, DailySalesforDownload, MonthlySalesforDownload, YearlySalesforDownload });
}

module.exports.userListPage = (req, res, next) => {
  console.log("Getting all the users data");
  userHelper.getAllUsers().then((users) => {
    console.log(users);
    res.render("admin/adminUser", { admin: true, users });
  });
}
module.exports.userStatusChange = (req, res) => {
  console.log(req.body);
  let userId = req.body.customer_id;
  let status = req.body.status;

  userHelper.userStatus(userId, status).then((response) => {
    console.log(response);
    res.json(response);
  });
}
module.exports.adminPoductListPage = (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/products", { admin: true, products });
  });
}
module.exports.addProductPage = (req, res) => {

  categoryHelper.getAllCategory().then((categories) => {
    brandHelper.getAllBrand().then((brands) => {
      res.render("admin/addProducts", { admin: true, categories, brands });
    })
  })
}
module.exports.addProductRequest = (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const product = req.body;
  product.img = fileName

  productHelper.addProduct(product).then((id) => {
    console.log(id);

    res.redirect('/admin/product/add');
  });
}
module.exports.deleteProductRequest = (req, res) => {
  console.log(req.params.id)
  productHelper.deleteProduct(req.params.id).then((response) => {
    res.json(response);
  })
}
module.exports.editProductPage = (req, res) => {
  console.log(req.params.id)
  productHelper.getProduct(req.params.id).then((response) => {
    let product = response.product;
    let categories = response.categories;
    let brands = response.brands;
    res.render("admin/editProduct", { admin: true, product, categories, brands })
  })
}
module.exports.editProductRequest = (req, res) => {
  id = req.params.id
  console.log(req.params.id)
  console.log(req.body)

  productHelper.getProduct(id).then((products) => {
    if (req.files != 0) {
      const files = req.files;
      console.log(files)
      const fileName = files.map((file) => {
        return file.filename
      })

      var product = req.body
      product.img = fileName
    } else {
      var product = req.body
      product.img = products.img
    }

    productHelper.updateProduct(product, req.params.id).then((response) => {
      res.redirect('/admin/products')

    })
  })
}

module.exports.addCategoryPage = (req, res) => {
  res.render('admin/addCategory', { admin: true, err_message })
  err_message = "";
}

module.exports.addCategoryRequest = (req, res) => {
  console.log(req.body);
  console.log(req.files);

  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const category = req.body;
  category.img = fileName

  categoryHelper.addCategory(category).then((response) => {
    if (response.message) {
      err_message = response.message;
      res.redirect('/admin/add-category')
    } else {
      res.redirect('/admin/category')
    }

  })
}

module.exports.categoryList = (req, res) => {
  categoryHelper.getAllCategory().then((categories) => {
    console.log(categories)
    res.render('admin/categoryList', { admin: true, categories })
  })
}

module.exports.deleteCategoryRequest = (req, res) => {
  let categoryId = req.params.id
  console.log('The ID is :' + categoryId)
  categoryHelper.deleteCategory(categoryId).then((response) => {
    console.log(response)
    res.json({})
  })
}
module.exports.editCategoryPage = (req, res) => {
  let userId = req.params.id
  console.log(userId);
  categoryHelper.getCategory(userId).then((category) => {
    res.render('admin/editCategory', { admin: true, category })
  })
}
module.exports.editCategoryRequest = (req, res) => {
  console.log("Reached Post method")
  console.log(req.body)
  console.log(req.params.id)
  id = req.params.id

  categoryHelper.getCategory(id).then((categories) => {
    if (req.files != 0) {
      const files = req.files;
      console.log(files)
      const fileName = files.map((file) => {
        return file.filename
      })

      var category = req.body
      category.img = fileName
    } else {
      var category = req.body
      category.img = categories.img
    }

    categoryHelper.updateCategory(category, req.params.id).then((response) => {

      res.redirect('/admin/category')

    });

  })
}
module.exports.addBrandPage = (req, res) => {
  res.render('admin/addBrand', { admin: true, err_message })
  err_message = "";
}

module.exports.addBrandRequest = (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const brand = req.body;
  brand.img = fileName

  brandHelper.addBrand(brand).then((response) => {
    console.log(response);
    if (response.message) {
      err_message = response.message
      res.redirect('/admin/add-brand')
    } else {
      res.redirect('/admin/brand')
    }

  })
}
module.exports.brandListPage = (req, res) => {
  brandHelper.getAllBrand().then((brands) => {
    console.log(brands)
    res.render('admin/brandList', { admin: true, brands })
  })
}

module.exports.deleteBrandRequest = (req, res) => {
  let brandId = req.params.id
  console.log('The ID is :' + brandId)
  brandHelper.deleteBrand(brandId).then((response) => {
    console.log(response)
    res.redirect('/admin/brand')
  })
}

module.exports.editBrandPage = (req, res) => {
  let brandId = req.params.id
  console.log(brandId);
  brandHelper.getBrand(brandId).then((brand) => {
    res.render('admin/editBrand', { admin: true, brand })
  })
}

module.exports.editBrandRequest = (req, res) => {
  console.log("Reached Post method")
  console.log(req.body)
  console.log(req.params.id)
  id = req.params.id

  brandHelper.getBrand(id).then((brands) => {
    if (req.files != 0) {
      const files = req.files;
      console.log(files)
      const fileName = files.map((file) => {
        return file.filename
      })

      var brand = req.body
      brand.img = fileName
    } else {
      var brand = req.body
      brand.img = brands.img
    }
    brandHelper.updateBrand(brand, req.params.id).then((response) => {

      res.redirect('/admin/brand');
    });

  })
}

module.exports.bannerPage = (req, res) => {
  bannerHelper.getAllBanners().then((banners) => {

    res.render('admin/bannerList', { admin: true, banners })
  })
}

module.exports.addBannerRequest = (req, res) => {
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const brand = req.body;
  brand.img = fileName

  bannerHelper.addBanner(brand).then((id) => {
    res.redirect('/admin/banner')
  })

}

module.exports.addBannerPage = (req, res) => {
  res.render('admin/addBanner', { admin: true })
}

module.exports.deleteBannerRequest = (req, res) => {
  let bannerId = req.params.id
  console.log('The ID is :' + bannerId)
  bannerHelper.deleteBanner(bannerId).then((response) => {
    console.log(response);
    res.redirect('/admin/banner');
  })
}

module.exports.editBannerPage = (req, res) => {
  let bannerId = req.params.id
  console.log(bannerId);

  bannerHelper.getBanner(bannerId).then((banner) => {
    res.render('admin/editBanner', { admin: true, banner })
  })
}

module.exports.editBannerRequest = (req, res) => {
  console.log("Reached Post method")
  console.log(req.body)
  console.log(req.params.id)
  id = req.params.id
  bannerHelper.getBanner(id).then((banners) => {
    if (req.files != 0) {
      const files = req.files;
      console.log(files)
      const fileName = files.map((file) => {
        return file.filename
      })

      var banner = req.body
      banner.img = fileName
    } else {
      var banner = req.body
      banner.img = banners.img
    }
    bannerHelper.updateBanner(banner, req.params.id).then((response) => {
      res.redirect('/admin/Banner');
    });
  })
}

module.exports.adminOrderList = async (req, res) => {
  let orders = await orderHelper.getAllOrders();
  res.render('admin/orderManagement', { admin: true, orders })
}

module.exports.updateOrderRequest = (req, res) => {
  let orderId = req.body.orderId;
  let status = req.body.status;
  let prodId = req.body.prodId;
  console.log(req.body)
  orderHelper.changeOrderStatus(orderId, status, prodId).then(() => {
    res.json("success");
  })
}

module.exports.adminOfferPage = async (req, res) => {
  let products = await productHelper.getAllProductOffer()
  res.render('admin/offerManagement', { admin: true, products })
}

module.exports.addOfferRequest = (req, res) => {
  productHelper.addOffer(req.body.proId, req.body.offer, req.body.proPrice).then((data) => {
    res.json(data);
  })
}

module.exports.deleteOfferRequest  = (req, res) => {
  productHelper.deleteOffer(req.body.proId, req.body.oldPrice).then((data) => {
    res.json(data)
  })
}


module.exports.returnNotifications  =  async (req, res) => {
  let orders = await orderHelper.returnApprovalOrders()
  console.log(orders)
  res.render('admin/notifications', { admin: true, orders })
}


module.exports.returnApproval = async (req, res) => {

  console.log(req.body)
  let status = "Return Approved";

  await orderHelper.changeOrderStatusReturn(req.body.orderId, status, req.body.msg, req.body.proId)
  await orderHelper.refundWallet(req.body.userId, req.body.orderId, req.body.proId)
  res.json(status)
}

module.exports.couponList = (req, res) => {
  couponHelper.getAllCoupon().then((coupons)=>{
    console.log(coupons)
    res.render('admin/coupon', { admin: true, coupons })
  })
}


module.exports.addCouponPage = (req, res) => {

  res.render('admin/addCoupon', { admin: true })

}


module.exports.addCouponRequest = (req, res) => {
  console.log(req.body)
  couponHelper.addCoupon(req.body).then(((response)=>{
   if(response)
   {
     res.json({status : true})
   }else{
     res.json({status : false})
   }
  }))
 }

module.exports.deleteCouponRequest = (req, res) => {

  couponHelper.deleteCoupon(req.params.id).then(()=>{
    res.json("success")
  })
  
}

