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
            let banners = {}
             banners.main = await db.get().collection('banner').find({banner : 'Banner Top Main'}).toArray();
             banners.midLarge = await db.get().collection('banner').find({banner : 'Banner Middle Large'}).toArray();
             banners.midsmall = await db.get().collection('banner').find({banner : 'Banner Middle small'}).toArray();
             banners.footer = await db.get().collection('banner').find({banner : 'Banner footer'}).toArray();
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
                banner : bannerData.banner,
                subTitle : bannerData.subTitle ,
                title1 : bannerData.title1,
                title2 : bannerData.title2,
                price : bannerData.price,
                link : bannerData.link,
                img : bannerData.img
            }}).then((response)=>{
                console.log(response)
                    resolve(response); 
                })
        });

    }
}