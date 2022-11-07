var objectId = require('mongodb').ObjectId
var db = require('../config/connect')
module.exports = {
    dailySalesReport : ()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('order').aggregate([
                // {
                //     $match : { }
                // },
                {
                    $group : {
                        _id : "$date",
                        dailySales : {$sum : "$total"},
                        count : {$sum:1}
                    },
                                        
                },
                {
                    $sort : { _id : 1 }
                },
                {
                     $limit : 5 
                }

                
            ]).toArray().then((response)=>{
                let totalAmount = 0 ;
                response.forEach(element => {
                    totalAmount += element.dailySales;
                
                });
                response.totalAmount = totalAmount
                console.log(response)
                resolve(response)
            })

        })
    },
    monthlySalesReport : ()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('order').aggregate([
                {
                    $group : {
                        _id : "$month",
                        monthlySales : {$sum : "$total"},
                        count : {$sum:1}
                    }
                                        
                },
                {
                    $sort : { _id : 1 }
                },
                {
                     $limit : 5 
                }

                
            ]).toArray().then((response)=>{
                let totalAmount = 0 ;
                response.forEach(element => {
                    totalAmount += element.monthlySales
                });
                response.totalAmount = totalAmount
                console.log(response)
                resolve(response)
            })

        })
    },
    yearlySalesReport : ()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('order').aggregate([
                {
                    $group : {
                        _id : "$year",
                        yearlySales : {$sum : "$total"},
                        count : {$sum:1}
                    }
                                        
                },
                {
                    $sort : { _id : -1 }
                },
                {
                     $limit : 5 
                }

                
            ]).toArray().then((response)=>{
                let totalAmount = 0 ;
                response.forEach(element => {
                    totalAmount += element.yearlySales
                });
                response.totalAmount = totalAmount
                console.log(response)
                resolve(response)
            })

        })
    }
}
