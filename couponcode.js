const { builtinModules } = require("module");

const items = require('./sqlconnect.js').items;
const couponcodes = require('./sqlconnect.js').couponcodes;
//for debugging purpose
//
// const custItems = [ 'p1', 'p2', 'p3', 'p4', 'p5'];
// custItems.set('p1', {iname:'shirt', desc:'Blue check shirt with collar', price:'2000'});
// custItems.set('p2', {iname:'tshirt', desc:'White check tee with floral print', price:'3000'});
// custItems.set('p3', {iname:'scarf', desc:'Ocean blue knitted scarf', price:'500'});
// custItems.set('p4', {iname:'denim', desc:'High waist wide jean', price:'2500'});

// const couponcodes = new Map();
// couponcodes.set('FLAT500', 'Applicable if the user’s total purchase value is over Rs 5,000 or has purchased at least 6 items');
// couponcodes.set('GET40', 'If the user purchases 2 items worth more than Rs 2000, applies 40% discount on those items');
// couponcodes.set('GET50', 'If the user purchases 3 or more items worth more than Rs 2000, applies 50% discount on the entire order');
//
var discount = function (tempCouponCode, custItems) {
    //create an object to return to called 
    var obj = {}
    let it = 0;
    //creating a new map called temp to add item prices for the customer given item ids
    let temp = new Map();
    console.log("The customer item ids are "+custItems)
    for (let i of custItems) {
        //console.log(i)
        console.log(items.get(parseInt(i)))
        let parseit = parseInt(items.get(parseInt(i)).price)
        temp.set(i, parseit);
        //
    }

    console.log(temp)
    let custTotal = 0;
    //total price of customer
    for (let i of custItems) {
        let tempAmt = temp.get(i)
        custTotal = custTotal + tempAmt;
    }
    console.log("Total amount before discount " + custTotal)
    //adding the total to object
    obj.total = custTotal;
    
    var itemsAbove2000 = new Array();
    let count = 0;

    var discountTotal40 = 0;
    var discountTotal50 = 0;
    it=0;
    for (let i of temp.keys()) {
        //console.log(temp.get(i))
        if (temp.get(i) >= 2000) {
            count++;
            itemsAbove2000[it] = i;
            it++
        }
    }
    console.log("Count of products worth above 2000 " + count)
    console.log(itemsAbove2000)
    //checking if coupon code matches and if it applicable too
    if (tempCouponCode == 'FLAT500' && (custItems.length >=6  || custTotal >= 5000)) {
        console.log('FLAT500 is applicable')
        obj.valid = true;
        //adding the discounted amount to the object to be sent over
        obj.discount = custTotal - 500
        console.log("Total after FLAT500 " + obj.discount)
    }
    else if (tempCouponCode == 'GET40' && count == 2) {
        console.log('GET40 is applicable')
        obj.valid = true;
        for (let i of itemsAbove2000) {
            if (temp.has(i)) {
                let dis40 = temp.get(i) - (temp.get(i) * 0.4);
                //replacing the customer product which are worth 2k to discounted amount
                temp.set(i, dis40)
                // console.log('40 discount on these products')
                // console.log(temp.get(i))
            }
        }
        //adding all the prices of itemss purchased by user after after applying discount
        for (let i of temp.keys()) {
            // console.log(temp.get(i))
            discountTotal40 = discountTotal40 + temp.get(i);
        }
        console.log("Total amount after GET40 " + discountTotal40)
        //store to the discount amount to object
        obj.discount = discountTotal40;
    }
    else if (tempCouponCode == 'GET50' && count >= 3) {
        console.log('GET50 is applicable')
        obj.valid = true;
        for (let i of itemsAbove2000) {
            if (temp.has(i)) {
                let dis50 = temp.get(i) - (temp.get(i) * 0.5);
                //replacing the customer product which are worth 2k to discounted amount
                temp.set(i, dis50)
                // console.log('50 discount on these products')
                // console.log(temp.get(i))
            }
        }
        //adding all the prices of itemss purchased by user after after applying discount
        for (let i of temp.keys()) {
            console.log(temp.get(i))
            discountTotal50 = discountTotal50 + temp.get(i);
        }
        console.log("Total amount after GET50 " + discountTotal50)
        //store to the discount amount to object
        obj.discount = discountTotal50;
    }
    else{
        obj.valid=false;
        obj.discount=custTotal;
        console.log("Invalid")
    }
    console.log(obj.valid)
    //returning the object to the function called
    return obj;
}
module.exports.discount= discount;