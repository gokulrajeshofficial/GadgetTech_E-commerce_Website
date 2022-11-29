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
    checkCategoryName : (categoryName)=>{
        return new Promise(async(resolve , reject)=>{
            let category = await db.get().collection('category').findOne({category : categoryName})
            if(category)
            {
                reject()
            }else{
                resolve()
            }


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
    updateCategory : (categoryData , categoryId )=>
    {
        return new Promise(async(resolve,reject)=>
        {
            await db.get().collection('category').updateOne({_id:objectId(categoryId)},{$set : {
                category : categoryData.category ,
                img : categoryData.img
            }}).then((response)=>{resolve(response); })
        });

    }
}