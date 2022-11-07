var objectId = require('mongodb').ObjectId
var db = require('../config/connect')


module.exports = {
    addOrder : (data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('order').insertOne(data).then((response)=>{
                resolve(response.insertedId);
            })

        })
    },
    getOrders : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection('order').find({userId : objectId(userId)}).sort({orderTime : -1}).toArray();
            resolve(orders);
        })
    },
    cancelOrder : (orderId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection('order').updateOne({ _id: objectId(orderId) },
                {
                    $set: { status: "Cancelled"}
                }).then((data) => {
                    console.log(data)
                    resolve(data);
                })

        })
    },
    deleteOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('order').deleteOne({_id : objectId(orderId)}).then(()=>{
                resolve();
            })

        })

    },
    getAllOrders :()=>{
        return new Promise(async(resolve,reject)=>{
            // let orders = await db.get().collection('order').find({}).sort({orderTime : -1}).toArray();
            let orders = await db.get().collection('order').aggregate([
                {
                    $lookup:{
                        from:'userdetails',
                        localField:'userId',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                {
                    $sort: {
                      'orderTime': -1,
                    }
                }
            ]).toArray()
            console.log(orders)
            resolve(orders);
        })
    },
    changeOrderStatus: (orderId , status) => {
        return new Promise((resolve, reject) => {
            db.get().collection('order').updateOne({ _id: objectId(orderId) },
                {
                    $set: { status: status}
                }).then((data) => {
                    console.log(data)
                    resolve();
                })

        })
    }
}