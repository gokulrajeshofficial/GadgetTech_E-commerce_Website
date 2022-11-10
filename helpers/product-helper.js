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
                            Category:{ $arrayElemAt : ['$categoryName',0]},
                            Brand:{ $arrayElemAt : ['$brandName',0]},
                        }
                    }
                ]).toArray()
                console.log(products);
                resolve(products);
        })

    },
    categoryProducts :(categoryId)=>{
            return new Promise(async(resolve,reject)=>{
                let products = await db.get().collection('product').aggregate([
                    {
                        $match : { Category : objectId(categoryId)}
    
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
                            Category:{ $arrayElemAt : ['$categoryName',0]},
                            Brand:{ $arrayElemAt : ['$brandName',0]},
                        }
                    }
                ]).toArray()
                console.log(products)
                resolve(products)
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
        console.log(product)
        return new Promise(async(resolve,reject)=>
        {
            console.log(product)
            await db.get().collection('product').updateOne({_id:objectId(productId)},{$set : {
                Name : product.Name,
                ShortDes: product.ShortDes,
                Des : product.Des,
                Qty :product.Qty,
                PriceOg:product.PriceOg,
                Price : product.Price,
                color :product.color,
                Category :product.Category ,
                Brand : product.Brand


            }}).then((response)=>{resolve(response); })
        });

    }
}
