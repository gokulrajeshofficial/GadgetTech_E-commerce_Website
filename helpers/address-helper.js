var objectId = require('mongodb').ObjectId
var db = require('../config/connect')
module.exports = {
    addAddress: (userId, data) => {
        data.user = objectId(userId);
        return new Promise((resolve, reject) => {
            db.get().collection('address').insertOne(data).then(() => {
                resolve(data)
            })
        })
    },
    getAddresses: (userId) => {
        return new Promise(async (resolve, reject) => {
            let addresses = await db.get().collection('address').find({ user: objectId(userId) }, {}).toArray();
            resolve(addresses);
        })
    },
    deleteAddress: (addressId) => {
        return new Promise((resolve, reject) => {

            db.get().collection('address').remove({ _id: objectId(addressId) }).then((data) => {
                resolve(data);
            })
        })

    },
    getUserAddress: (addressId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection('address').findOne({ _id : objectId(addressId) })
            resolve(address);
        })
    },
    editUserAddress : (addressId,addressData) => {
        return new Promise((resolve, reject) => {
         db.get().collection('address').updateOne({ _id: objectId(addressId) },
            {
                $set : {
                    fname : addressData.fname  ,
                    lname : addressData.lname ,
                    company : addressData.company ,
                     country : addressData.country ,
                      address : addressData.address ,
                       city : addressData.city ,
                        state :  addressData.state ,
                        pinCode : addressData.pinCode ,
                        phone : addressData.phone ,
                         mail :addressData.mail
                }
            }).then((data)=>{
                resolve(data);
            })
            
        })
    }
}