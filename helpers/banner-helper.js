var objectId = require('mongodb').ObjectId
var db = require('../config/connect')

module.exports = {
    addBanner: (data) => {
        return new Promise(async (resolve, reject) => {
                db.get().collection('banner').insertOne(data).then((response) => {
                    console.log(response)
                    resolve(response.insertedId)
                 })
        })
    },
    getBanner : (bannerId)=>{
        return new Promise(async(resolve,reject)=>{
            let banner = await db.get().collection('banner').findOne({_id : objectId(bannerId)})
            console.log(banner)
            resolve(banner);
        })
    },
    getAllBanners : ()=>{
        return new Promise(async(resolve,reject)=>{
            let banners = await db.get().collection('banner').find().toArray();
            resolve(banners);
        })
    },
    deleteBanner : (bannerId)=>
    {
        return new Promise((resolve,reject)=>
        {
            console.log(bannerId)
            db.get().collection('banner').remove({_id:objectId(bannerId)}).then((response)=>{resolve(response); })
        });
    },
    updateBanner : (bannerData , bannerId )=>
    {
        return new Promise((resolve,reject)=>
        {
            console.log(bannerData)
            db.get().collection('banner').updateOne({_id:objectId(bannerId)},{$set : {
                subTitle : bannerData.subTitle ,
                title1 : bannerData.title1,
                title2 : bannerData.title2,
                price : bannerData.price
            }}).then((response)=>{
                console.log(response)
                    resolve(response); 
                })
        });

    }
}