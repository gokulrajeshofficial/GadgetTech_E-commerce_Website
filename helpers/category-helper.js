var objectId = require('mongodb').ObjectId
const { response } = require('express')
var db = require('../config/connect')
module.exports = {
    addCategory: (data) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection('category').count({ category: data.category })
            console.log(`count is : ${count}`)
            if (count == 0) 
            {
                db.get().collection('category').insertOne(data).then((data) => {
                    response = {
                        message : "Category Added successfully",
                        data : data.insertedId
                    }
                    resolve(response.data)
                 })
            }
            else
            {
                response = {
                    message : "* Category already exists *"
                }
                resolve(response)
            }
        })
    },
    getCategory : (categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection('category').findOne({_id : objectId(categoryId)})
            console.log(category)
            resolve(category);
        })
    },
    getAllCategory : ()=>{
        return new Promise(async(resolve,reject)=>{
            let categories = await db.get().collection('category').find().toArray();
            resolve(categories);
        })
    },
    deleteCategory : (categoryData)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            console.log(categoryData)
            await db.get().collection('category').remove({_id:objectId(categoryData)}).then((response)=>{resolve(response); })
        });
    },
    updateCategory : (userData , userId )=>
    {
        return new Promise(async(resolve,reject)=>
        {
            console.log(userData)
            await db.get().collection('category').updateOne({_id:objectId(userId)},{$set : {
                category : userData.category}}).then((response)=>{resolve(response); })
        });

    }
}