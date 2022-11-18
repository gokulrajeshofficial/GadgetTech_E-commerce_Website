const multer= require('multer')

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/product')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ "-" +file.originalname)
    }
});
 const uploadProduct = multer({ storage: storage });

// Banner storage using multer
const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/banner')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ "-" +file.originalname)
    }
});
 const uploadBanner = multer({ storage: storage1 });

// Brand storage using multer
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/brand')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ "-" +file.originalname)
    }
});
 const uploadBrand = multer({ storage: storage2 });

 // Brand storage using multer
const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/category')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ "-" +file.originalname)
    }
});
 const uploadCategory = multer({ storage: storage3 });
 





 module.exports= {
    uploadProduct,
    uploadBanner,
    uploadBrand,
    uploadCategory
};