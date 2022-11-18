var objectId = require('mongodb').ObjectId
const { response } = require('express')
var db = require('../config/connect')
module.exports = {
    addBrand: (data) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection('brand').count({ brand : data.brand })
            console.log(`count is : ${count}`)
            if (count == 0)   
            {
                db.get().collection('brand').insertOne(data).then((data) => {
                    response = {
                        message : "Brand Added successfully",
                        data : data.insertedId
                    }
                    resolve(response.data)
                 })
            }
            else
            {
                response = {
                    message : "* Brand already exists *"
                }
                resolve(response)
            }
        })
    },
    getBrand : (brandId)=>{
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection('brand').findOne({_id : objectId(brandId)})
            console.log(brand)
            resolve(brand);
        })
    },
    getAllBrand : ()=>{
        return new Promise(async(resolve,reject)=>{
            let brands = await db.get().collection('brand').find().toArray();
            resolve(brands);
        })
    },
    deleteBrand : (brandData)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            console.log(brandData)
            await db.get().collection('brand').remove({_id:objectId(brandData)}).then((response)=>{resolve(response); })
        });
    },
    updateBrand : (brandData , brandId )=>
    {
        return new Promise(async(resolve,reject)=>
        {
            console.log(brandData)
            await db.get().collection('brand').updateOne({_id:objectId(brandId)},{$set : {
                brand : brandData.brand , 
                img : brandData.img , 

            }}).then((response)=>{
                    resolve(response); 
                })
        });

    }
}