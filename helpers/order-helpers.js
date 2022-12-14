var objectId = require('mongodb').ObjectId
const { resolve, reject } = require('promise')
var db = require('../config/connect')


module.exports = {
    addOrder: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection('order').insertOne(data).then((response) => {
                data.products.forEach(async (element) => {
                    let quantity = parseInt(-(element.quantity))
                    await db.get().collection('product').updateOne({ _id: element.productId },
                        {
                            $inc: { Qty: quantity }
                        })
                })
                resolve(response.insertedId);
            })

        })
    },
    getOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection('order').find({ userId: objectId(userId) }).sort({ orderTime: -1 }).toArray();
            resolve(orders);
        })
    },
    getOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection('order').find({ _id: objectId(orderId) }).sort({ orderTime: -1 }).toArray();
            resolve(order);
        })

    },
    cancelOrder: (orderId, prodId, qty) => {
        return new Promise((resolve, reject) => {
            db.get().collection('order').updateOne({ _id: objectId(orderId), 'products.productId': objectId(prodId) },
                {
                    $set: { 'products.$.shippingStatus': 'Cancelled' }
                }).then(async (data) => {
                    qty = parseInt(qty)
                    db.get().collection('product').updateOne({ _id: objectId(prodId) },
                        {
                            $inc: { Qty: qty }
                        }).then(() => {
                            resolve(data);
                        })
                })

        })
    },
    deleteOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection('order').deleteOne({ _id: objectId(orderId) }).then(() => {
                resolve();
            })

        })

    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            // let orders = await db.get().collection('order').find({}).sort({orderTime : -1}).toArray();
            let orders = await db.get().collection('order').aggregate([
                {
                    $lookup: {
                        from: 'userdetails',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$products',
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
    getProductOrder: (orderId, proId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection('order').aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products',
                },
                {
                    $match: { 'products.productId': objectId(proId) }
                }
            ]).toArray()
            console.log(order[0])
            resolve(order[0]);
        })

    },
    changeOrderStatus: (orderId, status, prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection('order').updateOne({ _id: objectId(orderId), 'products.productId': objectId(prodId) },
                {
                    $set: { 'products.$.shippingStatus': status }
                }).then((data) => {
                    console.log(data)
                    resolve();
                })

        })
    },
    changeOrderStatusReturn: (orderId, status, message, prodId) => {

        return new Promise((resolve, reject) => {
            db.get().collection('order').updateOne({ _id: objectId(orderId), 'products.productId': objectId(prodId) },
                {
                    $set: { 'products.$.shippingStatus': status, 'products.$.message': message }
                }).then((data) => {
                    console.log(data)
                    resolve();
                })

        })
    },
    returnApprovalOrders: () => {
        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection('order').aggregate([

                {
                    $unwind: '$products',
                },
                {
                    $match: { $or: [{ 'products.shippingStatus': "Return Requested" }, { 'products.shippingStatus': "Return Approved" }] }
                }
            ]).toArray()

            resolve(orders)
        })
    },
    getWallet: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wallet = await db.get().collection('wallet').findOne({ userId: objectId(userId) })
            if (wallet) {
                if (wallet.transaction) {
                    wallet.transaction = wallet.transaction.reverse()
                    wallet.transaction.forEach((transaction) => {
                        d = transaction.date
                        transaction.date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + "  " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
                    })
                }
            }

            resolve(wallet)
        })

    },
    updateWallet: (userId, walletTotal, walletTransaction, orderId) => {
        walletTotal = parseInt(walletTotal)
        walletTransaction = parseInt(walletTransaction)
        let referalData = { amount: walletTransaction, date: new Date(), transactionId: objectId(orderId) };

        console.log(walletTotal, walletTransaction)

        return new Promise(async (resolve, reject) => {
            db.get().collection('wallet').updateOne({ userId: objectId(userId) },
                {
                    $set: { walletTotal: walletTotal },
                    $push: { transaction: referalData }

                }).then((data) => {
                    console.log(data)
                    resolve()
                })
        })
    },
    refundWallet: (userId, orderId, proId) => {

        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection('order').aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products',
                },
                {
                    $match: { 'products.productId': objectId(proId) }
                }
            ]).toArray()
            order = order[0];
            console.log(order)
            console.log(userId)
            if (order.payment != "COD") {
                let referalData = {
                    amount: order.products.total,
                    date: new Date(),
                    transactionId: objectId(orderId)
                };


                db.get().collection('wallet').updateOne({ userId: objectId(userId) },
                    {
                        $inc: { walletTotal: order.products.total },
                        $push: { transaction: referalData }

                    }).then((data) => {
                        console.log(data)
                        resolve(data)
                    })

            } else {
                console.log("COD ")
                if (order.products.shippingStatus == 'Return Approved') {
                    let referalData = {
                        amount: order.products.total,
                        date: new Date(),
                        transactionId: objectId(orderId)
                    };


                    db.get().collection('wallet').updateOne({ userId: objectId(userId) },
                        {
                            $inc: { walletTotal: order.products.total },
                            $push: { transaction: referalData }

                        }).then((data) => {
                            console.log(data)
                            resolve(data)
                        })

                } else {
                    resolve()
                }

            }


        })

    }
}