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
/////////////////////////////////////////////////////////////// Validation ///////////////////////////////////////////////////////////////

function validation(req, res, next) {
  if (req.session.adminloggedIn == true) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
}

////////////////////////////////////////////////////////////////// Home /////////////////////////////////////////////////////////////////

router.get("/", validation, async (req, res) => {
  let dailysales = await salesHelper.dailySalesReport()
  let monthlysales = await salesHelper.monthlySalesReport()
  let yearlysales = await salesHelper.yearlySalesReport()
  res.render("admin/home", { admin: true, dailysales, monthlysales, yearlysales });
});

router.post("/", function (req, res, next) {
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
});






/////////////////////////////////////////////////////////////////// signin //////////////////////////////////////////////////////////////

router.get("/signin", (req, res, next) => {
  res.render("admin/adminlogin", { signin: true, err_message });
  err_message = "";
});

router.get("/logout", (req, res, next) => {
  req.session.adminloggedIn = false;
  res.redirect("/admin/signin");
});
/////////////////////////////////////////////////////////////Report//////////////////////////////////////////////////

router.get('/salesReport', async (req, res, next) => {
  let DailySalesforDownload = await salesHelper.dailySalesReport()
  let MonthlySalesforDownload = await salesHelper.monthlySalesReport();
  let YearlySalesforDownload = await salesHelper.yearlySalesReport();
  res.render("admin/salesReport", { admin: true, DailySalesforDownload, MonthlySalesforDownload, YearlySalesforDownload });
})

/////////////////////////////////////////////////////////////users/////////////////////////////////////////////////

router.get("/users", (req, res, next) => {
  console.log("Getting all the users data");
  userHelper.getAllUsers().then((users) => {
    console.log(users);
    res.render("admin/adminUser", { admin: true, users });
  });
});

router.post("/change_status", (req, res) => {
  console.log(req.body);
  let userId = req.body.customer_id;
  let status = req.body.status;

  userHelper.userStatus(userId, status).then((response) => {
    console.log(response);
    res.json(response);
  });
});

//////////////////////////////////////////////////////////////product//////////////////////////////////////////////////

router.get("/products", (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/products", { admin: true, products });
  });
});

router.get("/product/add", (req, res) => {

  categoryHelper.getAllCategory().then((categories) => {
    brandHelper.getAllBrand().then((brands) => {
      res.render("admin/addProducts", { admin: true, categories, brands });
    })
  })
});

router.post("/product/add", uploadProduct.array('Img'), (req, res) => {
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
    // let image = req.files.Img
    // image.mv('./public/product-images/' + id + '.png', (err, done) => {
    //   if (!err) {
    //     res.redirect('/admin/product/add');
    //   } else {
    //     console.log(err)
    //   }
    // })
  });
});


router.get("/product/delete/:id", (req, res) => {
  console.log(req.params.id)
  productHelper.deleteProduct(req.params.id).then((response) => {
    res.redirect('/admin/products')
  })
});

router.get("/product/edit/:id", (req, res) => {
  console.log(req.params.id)
  productHelper.getProduct(req.params.id).then((response) => {
    let product = response.product;
    let categories = response.categories;
    let brands = response.brands;
    res.render("admin/editProduct", { admin: true, product, categories, brands })
  })
});

router.post("/product/edit/:id", uploadProduct.array('Img'), (req, res) => {
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

});

/////////////////////////////////////////////////////////Category ////////////////////////////////////////////////////////////////

router.get('/add-category', (req, res) => {
  res.render('admin/addCategory', { admin: true, err_message })
  err_message = "";
});

router.post('/add-category', uploadCategory.array('categoryImg'), (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const category = req.body;
  category.img = fileName

  categoryHelper.addCategory(category).then((id) => {
    res.redirect('/admin/category')
  })
});

router.get('/category', (req, res) => {
  categoryHelper.getAllCategory().then((categories) => {
    console.log(categories)
    res.render('admin/categoryList', { admin: true, categories })
  })
})

router.get('/deleteCategory/:id', (req, res) => {
  let categoryId = req.params.id
  console.log('The ID is :' + categoryId)
  categoryHelper.deleteCategory(categoryId).then((response) => {
    console.log(response)
    res.redirect('/admin/category')
  })
})

router.get('/editCategory/:id', (req, res) => {
  let userId = req.params.id
  console.log(userId);
  categoryHelper.getCategory(userId).then((category) => {
    res.render('admin/editCategory', { admin: true, category })
  })
});

router.post('/editCategory/:id', uploadCategory.array('categoryImg'), (req, res) => {
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
})
//////////////////////////////////////////////////////////////Brand/////////////////////////////////////////////////////////

router.get('/add-brand', (req, res) => {
  res.render('admin/addBrand', { admin: true, err_message })
  err_message = "";
});

router.post('/add-brand', uploadBrand.array('brandImg'), (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const brand = req.body;
  brand.img = fileName

  brandHelper.addBrand(brand).then((id) => {
    console.log(id);

    res.redirect('/admin/brand')
  })
});

router.get('/brand', (req, res) => {
  brandHelper.getAllBrand().then((brands) => {
    console.log(brands)
    res.render('admin/brandList', { admin: true, brands })
  })
})

router.get('/deleteBrand/:id', (req, res) => {
  let brandId = req.params.id
  console.log('The ID is :' + brandId)
  brandHelper.deleteBrand(brandId).then((response) => {
    console.log(response)
    res.redirect('/admin/brand')
  })
})

router.get('/editBrand/:id', (req, res) => {
  let brandId = req.params.id
  console.log(brandId);
  brandHelper.getBrand(brandId).then((brand) => {
    res.render('admin/editBrand', { admin: true, brand })
  })
});

router.post('/editBrand/:id', uploadBrand.array('brandImg'), (req, res) => {
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
    brandHelper.updateBrand(brand , req.params.id).then((response) => {

      res.redirect('/admin/brand');
    });

  })
})
//////////////////////////////////////////////////////////Banner////////////////////////////////////////////////////////////

router.get('/banner', (req, res) => {
  bannerHelper.getAllBanners().then((banners) => {

    res.render('admin/bannerList', { admin: true, banners })
  })
});
router.get('/add-banner', (req, res) => {
  res.render('admin/addBanner', { admin: true })
})

router.post('/add-banner', uploadBanner.array('bannerImg'), (req, res) => {
  const files = req.files
  const fileName = files.map((file) => {
    return file.filename
  })

  const brand = req.body;
  brand.img = fileName

  bannerHelper.addBanner(brand).then((id) => {
    res.redirect('/admin/banner')
  })

});

router.get('/deleteBanner/:id', (req, res) => {
  let bannerId = req.params.id
  console.log('The ID is :' + bannerId)
  bannerHelper.deleteBanner(bannerId).then((response) => {
    console.log(response);
    res.redirect('/admin/banner');
  })
})

router.get('/editBanner/:id',(req, res) => {
  let bannerId = req.params.id
  console.log(bannerId);

  bannerHelper.getBanner(bannerId).then((banner) => {
    res.render('admin/editBanner', { admin: true, banner })
  })
});

router.post('/editBanner/:id',uploadBanner.array('bannerImg'), (req, res) => {
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

})
///////////////////////////////////////////////////////////////////Order////////////////////////////////////////////////////////////////

router.get('/orders', async (req, res) => {
  let orders = await orderHelper.getAllOrders();
  res.render('admin/orderManagement', { admin: true, orders })
})

router.patch('/updateOrders', (req, res) => {
  let orderId = req.body.orderId;
  let status = req.body.status;
  let prodId = req.body.prodId;
  console.log(req.body)
  orderHelper.changeOrderStatus(orderId, status, prodId).then(() => {
    res.json("success");
  })
})

router.get('/product/offer', async (req, res) => {
  let products = await productHelper.getAllProductOffer()
  res.render('admin/offerManagement', { admin: true, products })
})

router.post('/product/addOffer', (req, res) => {
  productHelper.addOffer(req.body.proId, req.body.offer, req.body.proPrice).then((data) => {
    res.json(data);
  })
})
router.delete('/product/deleteOffer', (req, res) => {
  productHelper.deleteOffer(req.body.proId, req.body.oldPrice).then((data) => {
    res.json(data)

  })
})

router.get('/notifications', async (req, res) => {
  console.log("***************************************")
  let orders = await orderHelper.returnApprovalOrders()
  console.log(orders)
  res.render('admin/notifications', { admin: true, orders })
})

router.patch('/returnApproved', async (req, res) => {

  console.log(req.body)
  let status = "Return Approved";

  await orderHelper.changeOrderStatusReturn(req.body.orderId, status, req.body.msg, req.body.proId)
  await orderHelper.refundWallet(req.body.userId, req.body.orderId, req.body.proId)
  res.json(status)
})

router.get('/coupons', (req, res) => {
  couponHelper.getAllCoupon().then((coupons)=>{
    console.log(coupons)
    res.render('admin/coupon', { admin: true, coupons })
  })
})

router.get('/coupons/add', (req, res) => {

  res.render('admin/addCoupon', { admin: true })

})

router.post('/coupons/add', (req, res) => {
 console.log(req.body)
 couponHelper.addCoupon(req.body).then(((response)=>{
  if(response)
  {
    res.json({status : true})
  }else{
    res.json({status : false})
  }
 }))
})

router.delete('/coupons/delete/:id',(req, res) => {

  couponHelper.deleteCoupon(req.params.id).then(()=>{
    res.json("success")
  })
  
})




module.exports = router;
