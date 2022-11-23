var objectId = require('mongodb').ObjectId
const { response } = require('express')
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
    getCoupon: (couponCode, userId) => {
        return new Promise(async (resolve, reject) => {
            userId = objectId(userId)
            let coupon = await db.get().collection('coupon').findOne({ couponName: couponCode })
            if (coupon) {
                let user = await db.get().collection('coupon').findOne({ couponName: couponCode, user: userId })
                if (!user) {
                   let response = {
                        coupon: coupon,
                        msg: 'Coupon Applied',
                        status: true
                    }
                    resolve(response)
                }
                else {
                  let  response = {
                        coupon: coupon,
                        msg: 'Coupon not avaiable for this user',
                        status: false
                    }
                    reject(response)
                }
            } else {
              let  response = {
                    msg : 'Invalid Coupon',
                    status: false
                }
                reject(response)
            }

        })

    },
    updateUserCoupon: (userId, couponCode) => {
        return new Promise((resolve, reject) => {
            console.log(userId)
            console.log(couponCode)
            userId = objectId(userId)
            db.get().collection('coupon').updateOne({ couponName: couponCode },
                { $push: { user: userId } }).then((data) => {
                    console.log(data)
                    resolve()

                })

        })

    }
}