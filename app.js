const express = require('express')
const { builtinModules } = require("module");
const app = express()
const { body, validationResult, check } = require('express-validator')
//
//
app.use(express.urlencoded({ extended: false }))
// const items = require('./itemObj.js');
// const cities = require('./city.js');
// const couponcodes = require('./couponcode.js').couponcodes;
const items = require('./sqlconnect.js').items;
const cities = require('./sqlconnect.js').cities;
const couponcodes = require('./sqlconnect.js').couponcodes;
const discount = require('./couponcode.js').discount;
//
var obj
var purchasedItems = new Array();
var custItems;
var custCouponCode
//
app.get('/', (req, res) => {
    var listItems = new Array();
    var availCities = new Array();
    var availCouponCodes = new Array();
    //console.log(items)
    for (let i of items.keys()) {
        listItems.push(items.get(i));
    }
    for (let i of cities.keys()) {
        availCities.push(cities.get(i));
    }
    for (let i of couponcodes.keys()) {
        availCouponCodes.push(i);
    }
    // console.log(cities)
    // console.log(couponcodes)
    res.status(200).json({
        "List of items for offer": listItems,
        "Valid shipping cities": availCities,
        "Available Coupon Codes": availCouponCodes
    });
})

// understanding sanitization
app.post('/checkout'
    , check('id')
        .custom((value) => {
            custItems = value.split(",");
            console.log(custItems)
            console.log(items)
            //custItems=JSON.parse(value);
            //custItems=value;
            for (let i of custItems) {
                if (!items.has(parseInt(i))) {
                    throw new Error("Item not in the list")
                }
            }
            return true;
        })
        //.withMessage('Product not found')
    , check('couponcode')
        .trim()
        .isAlphanumeric()
        .withMessage('Please enter a valid coupon code')
        .custom((value) => {
            //const couponcodes1 = cc.couponcodes;
            console.log(value)
            if (!couponcodes.has(value)) {
                throw new Error('Enter a valid coupon code')
            }
            custCouponCode = value
            return true
        })
        .custom((value) => {
            obj = new discount(value, custItems);
            console.log(obj.discount)
            // console.log(obj.valid)
            if (!obj) {
                throw new Error('Coupon code not applicable for your products')
            }
            return true
        })
    , body('name', 'Name must not contain any number or special characters')
        .trim()
        .isAlpha()
    , body('email', 'Please enter a valid email')
        .isEmail()
    , body('number', 'Please enter a valid mobile number')
        .trim()
        .isInt()
        .isLength({ min: 10, max: 10 })
    , check('address')
        .replace(/ /g, ' ')
        .isLength({ min: 10, max: 100 })
        .withMessage('Character should not exceed 100.')
        .trim()
        .matches('[#,]').withMessage('Address must only contain # and ,')
    , check('city').isLength({ min: 1, max: 20 })
        .toLowerCase()
        .isAlpha()
        .withMessage('Please enter a valid city')
        .custom((value) => {
            let it = cities.values()
            for (let i in it) {
                if (value != i) {
                    throw new Error('Not shipping to this city!')
                }
            }
            return true
        })
    , check('pincode')
        .isInt()
        .isLength({ min: 6, max: 6 })
        .withMessage('Enter a valid pincode')
        .custom((value) => {
            if (!cities.has(parseInt(value))) {
                throw new Error('Not shipping to this city!')
            }
            return true
        })
        .custom((value, { req }) => {
            let getCity = cities.get(parseInt(value))
            if (getCity != req.body.city) {
                throw new Error('The pincode and city deosnt match!')
            }
            return true
        })
    , (req, res, next) => {
        errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        for (let i of custItems) {
            //console.log(items.get(i))
            purchasedItems.push(items.get(parseInt(i)))
        }
        let validity = "Coupon code not applied!"
        if (obj.valid) {
            validity = "Coupon code applied"
        }
        res.status(200).json({
            "Ordered Date": new Date(),
            "Number of items purchased": custItems.length,
            "Ordered list of Items": purchasedItems,
            "Total Amount": obj.total,
            "Discount": validity,
            "Total Amount to be paid": obj.discount
        })
    })

app.listen(3000)