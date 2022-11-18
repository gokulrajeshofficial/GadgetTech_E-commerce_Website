var objectId = require('mongodb').ObjectId
const { resolve, reject } = require('promise')
var db = require('../config/connect')


module.exports = {
    addCoupon: (data) => {
        return new Promise(async (resolve, reject) => {
            data.couponPer = parseInt(data.couponPer)
            data.couponLimit = parseInt(data.couponLimit)
            let coupon = await db.get().collection('coupon').findOne({
                couponName: data.couponName
            })
            if (coupon) {
                resolve(false)
            } else {

                db.get().collection('coupon').insertOne(data).then((response) => {
                    resolve(response.insertedId);
                })


            }
        })

    },
    getAllCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection('coupon').find().toArray()

            resolve(coupons)
        })
    },
    deleteCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection('coupon').deleteOne({ _id: objectId(couponId) }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getCoupon : (couponCode)=>{
        return new Promise(async(resolve , reject)=>{
            let coupon = await db.get().collection('coupon').findOne({couponName : couponCode})
            console.log("*************************************************")
            console.log(coupon)

            if(coupon)
            {
                console.log('resolve')
                resolve(coupon)
            }else{
                console.log('rejected')
                reject()
            }

        })

    }
}