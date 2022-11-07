var db = require('../config/connect')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
var objectId = require('mongodb').ObjectId
module.exports = {
    addUser: (userData) => {

        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection('userdetails').count({ email: userData.email })

            if (count != 0) {
                console.log("Username already exist");
                let response =
                {
                    message: "User already exists with that email",
                    status: false

                }
                resolve(response);

            }
            else {
                let mobileCount = await db.get().collection('userdetails').count({ phonenumber: userData.phonenumber })
                if (mobileCount != 0) {
                    console.log("Mobile is already linked with another account");
                    let response =
                    {
                        message: "Mobile is already linked with another account",
                        status: false
                    }
                    resolve(response);

                } else {
                    userData.password = await bcrypt.hash(userData.password, 10)
                    db.get().collection('userdetails').insertOne(userData).then((data) => {
                        let response =
                        {
                            status: true,
                            details: data
                        }
                        resolve(response);
                    })
                }






            }
        })
    },
    loginIn: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection('userdetails').findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login successful")
                        response.status = true;
                        response.user = user;
                        resolve(response)
                    }
                    else {
                        console.log("login unsuccessful")
                        response.status = false;
                        resolve(response)
                    }
                })
            }
            else {
                console.log("login failed")
                resolve({ status: false })
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection('userdetails').find().toArray();
            resolve(users);
        })

    },

    getUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection('userdetails').findOne({ _id: objectId(userId) }).then((product) => {
                resolve(product);
            })
        })

    },
    getPhoneNumber: (phonenumber) => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection('userdetails').count({ phonenumber: phonenumber })

            if (count != 0) {
                db.get().collection('userdetails').findOne({ phonenumber: phonenumber }).then((user) => {
                    let response = {
                        message: "User Identified",
                        status: true,
                        user: user
                    }
                    resolve(response)
                })

            }
            else {
                let response = {
                    message: "Invalid Mobile Number",
                    status: false
                }
                resolve(response);
            }
        });
    },
    updateUser: (userData, userId) => {
        return new Promise((resolve, reject) => {
            console.log(userId);
            db.get().collection('userdetails').updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        fname: userData.fname,
                        lname: userData.lname,
                        img: userData.img,
                        about: userData.about
                    }
                }).then((response) => { resolve(response); })
        });

    },
    changePassword: (userId, userData) => {
        // console.log(userId);
        // console.log(userData);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection('userdetails').findOne({ _id: objectId(userId) })
            console.log("Old password : " + userData.oldPassword);
            console.log("Old stored password : " + user.password);
            let response = {}
            bcrypt.compare(userData.oldPassword, user.password).then(async (status) => {
                console.log(status)
                if (status) {
                    userData.newPassword = await bcrypt.hash(userData.newPassword, 10)
                    db.get().collection('userdetails').updateOne({ _id: objectId(userId) },
                        {
                            $set: { password: userData.newPassword }
                        }).then((data) => {
                            response.data = data
                            response.status = true;
                            resolve(response);
                        })
                }
                else {
                    console.log("Password is not the same")
                    response.status = false;
                    response.message = "Password you entered is incorrect"
                    resolve(response)
                }
            })

        });

    },
    forgetPasswordchangePassword: (phoneNumber, passData) => {
        return new Promise(async (resolve, reject) => {

            passData = await bcrypt.hash(passData, 10)

            db.get().collection('userdetails').updateOne({ phonenumber: phoneNumber },
                {
                    $set: { password: passData }
                }).then((data) => {
                    let response = {};
                    response.data = data
                    response.status = true;
                    resolve(response);
                })
        })


    },
    userStatus: (userId, status) => {

        if (status == 'Blocked') {
            status_value = false
        }
        else {
            status_value = true
        }
        console.log("The status :" + status_value)
        return new Promise((resolve, reject) => {
            db.get().collection('userdetails').updateOne({ _id: objectId(userId) }, {
                $set: {
                    status: status_value
                }
            }).then((response) => {
                response.status = status_value;
                resolve(response);
            })
        });

    },

}