var express = require("express");
var router = express.Router();

const { uploadProduct, uploadBanner, uploadBrand, uploadCategory } = require('../public/javascripts/multer');


const {  adminDashboardPage, signInRequest, signInPage, logout, salesReportPage, userListPage, userStatusChange, adminPoductListPage, addProductPage, addProductRequest, deleteProductRequest, editProductPage, editProductRequest, addCategoryPage, addCategoryRequest, categoryList, deleteCategoryRequest, editCategoryRequest, editCategoryPage, addBrandPage, addBrandRequest, brandListPage, deleteBrandRequest, editBrandPage, editBrandRequest, bannerPage, addBannerRequest, addBannerPage, deleteBannerRequest, editBannerPage, editBannerRequest, adminOrderList, updateOrderRequest, adminOfferPage, addOfferRequest, deleteOfferRequest, returnNotifications, returnApproval, couponList, addCouponPage, addCouponRequest, deleteCouponRequest,  } = require("../controller/adminController");
const { adminValidation } = require("../controller/validation");


//<------------------------------------------------------------ Home ----------------------------------------------------------------->
router.get("/", adminValidation ,adminDashboardPage);

//<---------------------------------------------------Admin Signin Request ----------------------------------------------------------->
router.post("/", signInRequest);

//<---------------------------------------------------Admin Signin Page ----------------------------------------------------------->
router.get("/signin", signInPage);

//<-------------------------------------------------Admin Logout Request ----------------------------------------------------------->
router.get("/logout", logout)

//<---------------------------------------------------Admin Sales Report Page ----------------------------------------------------------->
router.get('/salesReport',adminValidation, salesReportPage)

//<---------------------------------------------------Admin User List Page----------------------------------------------------------->
router.get("/users",adminValidation, userListPage);

//<---------------------------------------------------Admin User block/unblock ----------------------------------------------------------->
router.post("/change_status",adminValidation, userStatusChange);

//<---------------------------------------------------Admin Product Page ----------------------------------------------------------->
router.get("/products",adminValidation, adminPoductListPage);

//<-----------------------------------------------Admin Add Product Page -------------------------------------------------------->
router.get("/product/add", adminValidation , addProductPage);

//<----------------------------------------------Admin Add product Request ----------------------------------------------------------->
router.post("/product/add", uploadProduct.array('Img'), addProductRequest);


//<-----------------------------------------------Admin Delete Product Request ----------------------------------------------------------->
router.delete("/product/delete/:id", deleteProductRequest);

//<---------------------------------------------------Admin Edit Product Page ----------------------------------------------------------->

router.get("/product/edit/:id",adminValidation, editProductPage);
//<--------------------------------------------------Admin Edit Product Request -------------------------------------------------------->

router.post("/product/edit/:id", uploadProduct.array('Img'), editProductRequest);

//<---------------------------------------------------Admin Add Category Page ----------------------------------------------------------->
router.get('/add-category',adminValidation, addCategoryPage);

//<------------------------------------------------Admin Add Category Request----------------------------------------------------------->
router.post('/add-category', uploadCategory.array('categoryImg'), addCategoryRequest)

//<---------------------------------------------------Admin CategoryList Page ----------------------------------------------------------->
router.get('/category',adminValidation, categoryList)

//<----------------------------------------------Admin Delete category ----------------------------------------------------------->
router.delete('/deleteCategory/:id', deleteCategoryRequest)

//<----------------------------------------------Admin Edit Category Page ------------------------------------------------------>
router.get('/editCategory/:id',adminValidation, editCategoryPage);

//<---------------------------------------------Admin Edit Category Request -------------------------------------------------------->
router.post('/editCategory/:id', uploadCategory.array('categoryImg'), editCategoryRequest)

//<-----------------------------------------------Admin Add Brand Page ------------------------------------------------------->
router.get('/add-brand',adminValidation, addBrandPage);

//<-----------------------------------------------Admin Add Brand Request ---------------------------------------------------->
router.post('/add-brand', uploadBrand.array('brandImg'), addBrandRequest);

//<-------------------------------------------------Admin Brand List ---------------------------------------------------->
router.get('/brand',adminValidation, brandListPage)

//<-------------------------------------------------Admin Brand Delete ------------------------------------------------------>
router.get('/deleteBrand/:id', deleteBrandRequest)

//<-------------------------------------------------Admin Edit Brand Page ------------------------------------------------------>
router.get('/editBrand/:id',adminValidation, editBrandPage);

//<------------------------------------------------Admin Edit Brand Request ----------------------------------------------------->
router.post('/editBrand/:id', uploadBrand.array('brandImg'), editBrandRequest)

//<---------------------------------------------------Admin Banner Page ------------------------------------------------------->
router.get('/banner',adminValidation, bannerPage);

//<---------------------------------------------------Admin Add Banner Page ------------------------------------------------------>
router.get('/add-banner',adminValidation, addBannerPage)

//<------------------------------------------------Admin Add Banner Request -------------------------------------------------------->
router.post('/add-banner', uploadBanner.array('bannerImg'), addBannerRequest);

//<---------------------------------------------------Admin Delete Banner ----------------------------------------------------------->
router.get('/deleteBanner/:id', deleteBannerRequest )
  
//<---------------------------------------------------Admin Edit Banner Page ------------------------------------------------------>
router.get('/editBanner/:id',adminValidation,editBannerPage); 

//<-------------------------------------------------Admin Edit BAnner Request -------------------------------------------------------->
router.post('/editBanner/:id',uploadBanner.array('bannerImg'), editBannerRequest)

//<---------------------------------------------------Admin Order Page ----------------------------------------------------------->
router.get('/orders',adminValidation, adminOrderList)  

//<-------------------------------------------Admin Order Status Update Request --------------------------------------------------->
router.patch('/updateOrders', updateOrderRequest)

//<---------------------------------------------------Admin Offer Page --------------------------------------------------------->
router.get('/product/offer',adminValidation, adminOfferPage)

//<----------------------------------------------Admin Add Offer Request ------------------------------------------------------>
router.post('/product/addOffer', addOfferRequest)

//<-----------------------------------------------Admin delete Offer Page ------------------------------------------------------->
router.delete('/product/deleteOffer',adminValidation, deleteOfferRequest)

//<-------------------------------------------Admin Return Approval List Page ---------------------------------------------------->
router.get('/notifications',adminValidation, returnNotifications)

//<--------------------------------------------Admin Return Approve Request --------------------------------------------------->
router.patch('/returnApproved', returnApproval)

//<---------------------------------------------------Admin Coupon List Page --------------------------------------------------------->
router.get('/coupons',adminValidation, couponList)

//<---------------------------------------------------Admin Coupon add Page -------------------------------------------------------->
router.get('/coupons/add',adminValidation, addCouponPage)

//<---------------------------------------------------Admin Coupon Add REQUEST --------------------------------------------------------->
router.post('/coupons/add',adminValidation, addCouponRequest)

//<---------------------------------------------------Admin Delete Coupon  ----------------------------------------------------------->
router.delete('/coupons/delete/:id', adminValidation , deleteCouponRequest)




module.exports = router;
