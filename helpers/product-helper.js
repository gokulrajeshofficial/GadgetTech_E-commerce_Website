const { resolve } = require('promise')
var db = require('../config/connect')
const categoryHelper = require('./category-helper')
var objectId = require('mongodb').ObjectId
module.exports={
    addProduct:(product)=>
    { 
        product.Category = objectId(product.Category);
        product.Brand = objectId(product.Brand);
        product.Price = parseInt(product.Price);
        product.Qty = parseInt(product.Qty)
 
        return new Promise((resolve,reject)=>{
        console.log(product)
        db.get().collection('product').insertOne(product).then((data)=>{
            resolve(data.insertedId)
        })
    })
    },
    getProduct : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection('product').aggregate([
                {
                    $match : { _id : objectId(productId)}
                },
                {
                   
                    $lookup:{ 
                        from:'category',
                        localField:'Category',
                        foreignField:'_id',
                        as:'categoryName'

                    }
                },
                {
                    $lookup:{
                        from:'brand',
                        localField:'Brand',
                        foreignField:'_id',
                        as:'brandName'

                    }
                },
                {
                    $project:{
                        Name:1,
                        ShortDes:1,
                        Des:1,
                        Qty:1,
                        PriceOg:1,
                        Price:1,
                        color:1,
                        offer:1,
                        oldPrice:1,
                        img:1,
                        Category:{ $arrayElemAt : ['$categoryName',0]},
                        Brand:{ $arrayElemAt : ['$brandName',0]},
                    }
                }
            ]).toArray()
           
            let categories = await db.get().collection('category').find().toArray();
            let brands = await db.get().collection('brand').find().toArray();
            let response ={
                product : product[0] , 
                categories : categories,
                brands : brands
            }
            resolve(response);
        })
    },
    getAllProductOffer : ()=>{
        return new Promise (async(resolve,reject)=>{
            let products = await db.get().collection('product').find().toArray();
            resolve(products);
        })
    },
    getAllProducts :()=>{
        return new Promise(async(resolve,reject)=>{

                let products = await db.get().collection('product').aggregate([
                    {
                        $lookup:{
                            from:'category',
                            localField:'Category',
                            foreignField:'_id',
                            as:'categoryName'
    
                        }
                    },
                    {
                        $lookup:{
                            from:'brand',
                            localField:'Brand',
                            foreignField:'_id',
                            as:'brandName'
    
                        }
                    },
                    {
                        $project:{
                            Name:1,
                            ShortDes:1,
                            Des:1,
                            Qty:1,
                            PriceOg:1,
                            Price:1,
                            color:1,
                            img:1,
                            offer:1,
                            oldPrice:1,
                            Category:{ $arrayElemAt : ['$categoryName',0]},
                            Brand:{ $arrayElemAt : ['$brandName',0]},
                        }
                    },
                    {
                        $sort : {Name : 1}
                    }
                ]).toArray()
                console.log(products);
                resolve(products);
        })

    },
    categoryProducts :(categoryId , page)=>{
            return new Promise(async(resolve,reject)=>{
                let products = await db.get().collection('product').aggregate([
                    {
                        $match : { Category : objectId(categoryId)}
    
                    },
                    {
                         $skip : page.startFrom 
                    },
                    {
                        $limit : page.perPage
                    },
                    {
                       
                        $lookup:{
                            from:'category',
                            localField:'Category',
                            foreignField:'_id',
                            as:'categoryName'
    
                        }
                    },
                    {
                        $lookup:{
                            from:'brand',
                            localField:'Brand',
                            foreignField:'_id',
                            as:'brandName'
    
                        }
                    },
                    {
                        $project:{
                            Name:1,
                            ShortDes:1,
                            Des:1,
                            Qty:1,
                            Price:1,
                            color:1,
                            img:1,
                            offer:1,
                            oldPrice:1,

                            Category:{ $arrayElemAt : ['$categoryName',0]},
                            Brand:{ $arrayElemAt : ['$brandName',0]},
                        }
                    }
                ]).toArray()
                console.log("***********************************************")
                console.log(products)
                resolve(products)
            })
    },
    categoryProductsCount :(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = await db.get().collection('product').find({ Category : objectId(categoryId)}
            ).toArray()
            console.log(count.length)
            resolve(count.length)
          
        })
},
     deleteProduct : (productId)=>
    {
        return new Promise((resolve,reject)=>
        {
            console.log(productId)
            db.get().collection('product').deleteOne({_id:objectId(productId)}).then((response)=>{resolve(response); })
        });
    },
    updateProduct : (product , productId )=>
    {
        product.Category = objectId(product.Category);
        product.Brand = objectId(product.Brand);
        product.Price = parseInt(product.Price);
        product.Qty = parseInt(product.Qty)
        console.log(product)
        return new Promise(async(resolve,reject)=>
        {
            console.log(product)
            await db.get().collection('product').updateOne({_id:objectId(productId)},{$set : {
                Name : product.Name,
                ShortDes: product.ShortDes,
                Des : product.Des,
                Qty :product.Qty,
                Price : product.Price,
                color :product.color,
                Category :product.Category ,
                Brand : product.Brand , 
                img : product.img


            }}).then((response)=>{resolve(response); })
        });

    },
    addOffer : (proId , offer , proPrice )=>{
        return new Promise((resolve , reject )=>{
        
            offer= parseInt(offer)
            proPrice= parseInt(proPrice)
            let newPrice = proPrice - ((parseInt(offer)/100) * proPrice)
            newPrice= parseInt(newPrice)

            db.get().collection('product').updateOne({_id : objectId(proId)},
            {
                $set : {offer : offer , Price : newPrice , oldPrice : proPrice}
            })
            resolve(newPrice)
        })

    },
    deleteOffer : (proId , oldPrice)=>{
        return new Promise((resolve,reject)=>{
            console.log("oldPrice" + oldPrice)
            oldPrice = parseInt(oldPrice)
            db.get().collection('product').updateOne({_id : objectId(proId)},
            {
                 $set : {  Price : oldPrice},
                 $unset : {offer : ""  , oldPrice : ""}
            }).then((data)=>{
                console.log(data)
                resolve()
            })
        })

    },
    searchSuggestion :(keyword)=>{
        return new Promise(async(resolve,reject)=>{
            let search = await db.get().collection('product').find({Name : {$regex : "(?i)"+keyword }}).toArray()
            resolve(search)

        })

    },
    searchProduct :(keyword)=>{
        return new Promise(async(resolve,reject)=>{
            let search = await db.get().collection('product').aggregate([
                {
                    $lookup:{
                        from:'category',
                        localField:'Category',
                        foreignField:'_id',
                        as:'categoryName'

                    }
                },
                {
                    $lookup:{
                        from:'brand',
                        localField:'Brand',
                        foreignField:'_id',
                        as:'brandName'

                    }
                },
                {
                    $project:{
                        Name:1,
                        ShortDes:1,
                        Des:1,
                        Qty:1,
                        PriceOg:1,
                        Price:1,
                        color:1,
                        img:1,
                        offer:1,
                        oldPrice:1,
                        Category:{ $arrayElemAt : ['$categoryName',0]},
                        Brand:{ $arrayElemAt : ['$brandName',0]},
                    }
                },
                {
                    $match : {"Name" : {$regex : new RegExp( keyword , "i")}}
                }

            ]).toArray()
            console.log(search)
            resolve(search)

        })

    }
}
