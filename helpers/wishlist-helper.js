var objectId = require('mongodb').ObjectId
var db = require('../config/connect')
module.exports = {
    addToWishlist: (productId, userId) => {
        let qty = 1 
        return new Promise(async (resolve, reject) => {
            let wishObj = {
                productId: objectId(productId), 
                quantity: parseInt(qty)
            }
            let userWishlist = await db.get().collection('wishlist').findOne({ user: objectId(userId) });
            if (userWishlist) //if the user has a pre existing cart collection
            {
                let proExist = userWishlist.products.findIndex(product =>product.productId == productId)
                console.log(proExist);
                if(proExist!=-1)
                {
                    // db.get().collection('wishlist').updateOne(
                    //     {user:objectId(userId),'products.productId':objectId(productId)},
                    //     { $inc : {'products.$.quantity': parseInt(qty)}
                    // }).then(()=>{
                    //     resolve();
                    // })
                    resolve()
                }
                else
                {
                    db.get().collection('wishlist').updateOne(
                        { user: objectId(userId) }, //if the product does not exists
                        { $push: { products: wishObj } }).then((data) => {
                            resolve(data)
                        })   
                }
            }
            else {
                let wishlist = {
                    user: objectId(userId),
                    products: [wishObj]

                }
                db.get().collection("wishlist").insertOne(wishlist).then((response) => {

                    resolve(response)

                })
            }
        })

    },
    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection('wishlist').aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind : '$products'
                 },
                 {
                    $project : {
                        productId : '$products.productId',
                        quantity : '$products.quantity'
                    }
                 },
                 {
                    $lookup :{
                        from : 'product',
                        localField : 'productId',
                        foreignField : '_id',
                        as : 'product'
                    }
                 },
                 {
                    $project : {
                        productId : 1,
                        quantity : 1,
                        product : {$arrayElemAt: [ '$product',0] }
                    }
                 },
                 {
                    $project : {
                        productId : 1,
                        quantity : 1,
                        product : 1,
                        total : {$sum :{$multiply:['$quantity','$product.Price']}}
                    }
                 }
                 

            ]).toArray()
            resolve(wishlist)
        })

    },
    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartCount
            let cart = await db.get().collection('wishlist').findOne({ user: objectId(userId) })
    
            if (cart) 
            {
                cartCount = cart.products.length;
            }
            else {
                cartCount = 0;
            }
            resolve(cartCount)
        })

    },
    deleteWishlistProduct :(userId , productId)=>
    {
        return new Promise((resolve,reject)=>{
            db.get().collection('wishlist').updateOne({user: objectId(userId)},
            {$pull : { products : { productId: objectId(productId) }}}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    totalCartPrice : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection('wishlist').aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind : '$products'
                 },
                 {
                    $project : {
                        productId : '$products.productId',
                        quantity : '$products.quantity'
                    }
                 },
                 {
                    $lookup :{
                        from : 'product',
                        localField : 'productId',
                        foreignField : '_id',
                        as : 'product'
                    }
                 },
                 {
                    $project : {
                        productId : 1,
                        quantity : 1,
                        product : {$arrayElemAt: [ '$product',0] },
                    }
                 },
                 {
                    $group : {
                        _id:null,
                        total : {$sum :{$multiply:['$quantity','$product.Price']}}
                    }
                 },
    
            ]).toArray()
            console.log(total[0])
            resolve(total[0])
        })

    },
    removeAllProducts : (userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('wishlist').deleteOne({user : objectId(userId)}).then((data)=>{
                resolve(data);
            })

        })

    }

};


   // $lookup: {
                    //     from: 'product',
                    //     let: {
                    //         productList: "$products"
                    //     },
                    //     pipeline: [
                    //         {
                    //             $match: {
                    //                 $expr: {
                    //                     $in: ['$_id', '$$productList']
                    //                 }
                    //             }
                    //         }
                    //     ],
                    //     as: 'cartItems'


                    // }