var objectId = require('mongodb').ObjectId
var db = require('../config/connect')
const Razorpay = require('razorpay');
const dotenv = require('dotenv').config()
const CC = require('currency-converter-lt')

var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID ,
    key_secret: process.env.RAZOR_KEY_SECRET ,
});

const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
  });

module.exports = {
    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: orderId.toString()
            }, (err, order) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("New orders :", order);
                    resolve(order)
                }
            })
        })
    },
    verifyPayment: (details) => {
        console.log(details)
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'Bg4M7868KuR6YLJaDF2Cf27V');
            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                console.log("resolve");
                resolve()
            } else {
                console.log("reject");
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection('order').updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        paymentStatus: 'Placed',
                        status: 'Order Placed'
                    }
                }).then((data) => {
                    console.log(data)
                    resolve();
                })

        })
    },
    generatePayPal: (orderId, total) => {
        return new Promise(async(resolve, reject) => {
            let currencyConverter = new CC({from:"INR", to:"USD", amount: total })
            total = await currencyConverter.convert()

            console.log(total)
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:5000/paypal/success/" + orderId,
                    "cancel_url": "http://localhost:5000/order-pending/" + orderId
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    try{
                        throw error;
                    }
                    catch(e){
                        console.log(error.response.details)
                        reject(error.response.details[0])
                    }
                    
                } else {
                    
                    console.log(payment)
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            resolve(payment.links[i].href);
                        }
                    }
                }
            })
        })
    },
   /* createInvoice: () => {
        return new Promise((resolve,reject)=>{
            var data = {
                // Customize enables you to provide your own templates
                // Please review the documentation for instructions and examples
                "customize": {
                    //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
                },
                "images": {
                    // The logo on top of your invoice
                    "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
                    // The invoice background
                    "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
                },
                // Your own data
                "sender": {
                    "company": "Sample Corp",
                    "address": "Sample Street 123",
                    "zip": "1234 AB",
                    "city": "Sampletown",
                    "country": "Samplecountry"
                    //"custom1": "custom value 1",
                    //"custom2": "custom value 2",
                    //"custom3": "custom value 3"
                },
                // Your recipient
                "client": {
                    "company": "Client Corp",
                    "address": "Clientstreet 456",
                    "zip": "4567 CD",
                    "city": "Clientcity",
                    "country": "Clientcountry"
                    // "custom1": "custom value 1",
                    // "custom2": "custom value 2",
                    // "custom3": "custom value 3"
                },
                "information": {
                    // Invoice number
                    "number": "2021.0001",
                    // Invoice data
                    "date": "12-12-2021",
                    // Invoice due date
                    "due-date": "31-12-2021"
                },
                // The products you would like to see on your invoice
                // Total values are being calculated automatically
                "products": [
                    {
                        "quantity": 2,
                        "description": "Product 1",
                        "tax-rate": 6,
                        "price": 33.87
                    },
                    {
                        "quantity": 4.1,
                        "description": "Product 2",
                        "tax-rate": 6,
                        "price": 12.34
                    },
                    {
                        "quantity": 4.5678,
                        "description": "Product 3",
                        "tax-rate": 21,
                        "price": 6324.453456
                    }
                ],
                // The message you would like to display on the bottom of your invoice
                "bottom-notice": "Kindly pay your invoice within 15 days.",
                // Settings to customize your invoice
                "settings": {
                    "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
                    // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
                    // "tax-notation": "gst", // Defaults to 'vat'
                    // "margin-top": 25, // Defaults to '25'
                    // "margin-right": 25, // Defaults to '25'
                    // "margin-left": 25, // Defaults to '25'
                    // "margin-bottom": 25, // Defaults to '25'
                    // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
                    // "height": "1000px", // allowed units: mm, cm, in, px
                    // "width": "500px", // allowed units: mm, cm, in, px
                    // "orientation": "landscape", // portrait or landscape, defaults to portrait
                },
                // Translate your invoice to your preferred language
                "translate": {
                    // "invoice": "FACTUUR",  // Default to 'INVOICE'
                    // "number": "Nummer", // Defaults to 'Number'
                    // "date": "Datum", // Default to 'Date'
                    // "due-date": "Verloopdatum", // Defaults to 'Due Date'
                    // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
                    // "products": "Producten", // Defaults to 'Products'
                    // "quantity": "Aantal", // Default to 'Quantity'
                    // "price": "Prijs", // Defaults to 'Price'
                    // "product-total": "Totaal", // Defaults to 'Total'
                    // "total": "Totaal" // Defaults to 'Total'
                },
            };
    
            //Create your invoice! Easy!
            easyinvoice.createInvoice(data, function (result) {
                //The response will contain a base64 encoded PDF file
                console.log('PDF base64 string: ', result.pdf);
                resolve(result);
            });

        })
    }*/

}