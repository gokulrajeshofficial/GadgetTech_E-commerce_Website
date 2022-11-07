var objectId = require('mongodb').ObjectId
var db = require('../config/connect')
module.exports = {
    addToCart: (productId, qty, userId) => {
        return new Promise(async (resolve, reject) => {
            let cartObj = {
                productId: objectId(productId),
                quantity: parseInt(qty)
            }
            let userCart = await db.get().collection('cart').findOne({ user: objectId(userId) });
            if (userCart) //if the user has a pre existing cart collection
            {
                let proExist = userCart.products.findIndex(product =>product.productId == productId)
                console.log(proExist);
                if(proExist!=-1)
                {
                    db.get().collection('cart').updateOne(
                        {user:objectId(userId),'products.productId':objectId(productId)},
                        { $inc : {'products.$.quantity': parseInt(qty)}
                    }).then(()=>{
                        resolve();
                    })
                }
                else
                {
                    db.get().collection('cart').updateOne(
                        { user: objectId(userId) }, //if the product does not exists
                        { $push: { products: cartObj } }).then((data) => {
                            resolve(data)
                        })   
                }
            }
            else {
                let cart = {
                    user: objectId(userId),
                    products: [cartObj]

                }
                db.get().collection("cart").insertOne(cart).then((response) => {

                    resolve(response)

                })
            }
        })

    },
    getCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection('cart').aggregate([
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
            console.log(cart)
            resolve(cart)
        })

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartCount
            let cart = await db.get().collection('cart').findOne({ user: objectId(userId) })
    
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
    deleteCartProduct :(userId , productId)=>
    {
        return new Promise((resolve,reject)=>{
            db.get().collection('cart').updateOne({user: objectId(userId)},
            {$pull : { products : { productId: objectId(productId) }}}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    quantityChange : (userId,productId,newQuantity)=>
    {
        return new Promise((resolve , reject)=>{
            db.get().collection('cart').updateOne( {user:objectId(userId),'products.productId':objectId(productId)},
            { $set : {'products.$.quantity': parseInt(newQuantity)}}).then((data)=>{
                resolve(data);
            })
        })
    },
    totalCartPrice : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection('cart').aggregate([
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
            db.get().collection('cart').deleteOne({user : objectId(userId)}).then((data)=>{
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