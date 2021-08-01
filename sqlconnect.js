const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    //database: 'nodedb',
    database: 'shoppingcart',
    password: ''
});

pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);

});
// this promise helps  async  and also 2 functions then and catch
//module.exports = pool.promise();
//
const items = new Map();
const cities = new Map();
const couponcodes = new Map();

let query1 = 'SELECT * FROM items'
let query2 = 'SELECT * FROM cities'
let query3 = 'SELECT * FROM coupons'

queryPromise1 = () => {
    return new Promise((resolve, reject) => {
        pool.query(query1, (error, results) => {
            if (error) {
                return reject(error);
            }
            console.log('Items->success')
            //converting the TextRows into map
            for (var i = 0; i < results.length; i++) {
                var tempName = results[i].iname;
                var tempDesc = results[i].idescription;
                items.set(results[i].itemid, ({ name: tempName, description: tempDesc, price: results[i].price }))
            }
            console.log(items);
            return resolve(results);
        });
    });
};
//
queryPromise2 = () => {
    return new Promise((resolve, reject) => {
        pool.query(query2, (error, results) => {
            if (error) {
                return reject(error);
            }
            console.log('cities->success')
            //converting the TextRows into map
            for (var i = 0; i < results.length; i++) {
                cities.set(results[i].pincode, results[i].city)
            }
            console.log(cities);
            return resolve(results);
        });
    });
};

queryPromise3 = () => {
    return new Promise((resolve, reject) => {
        pool.query(query3, (error, results) => {
            if (error) {
                return reject(error);
            }
            console.log('couponcodes->success')
            //converting the TextRows into map
            for (var i = 0; i < results.length; i++) {
                couponcodes.set(results[i].couponcode, results[i].description)
            }
            console.log(couponcodes);
            return resolve(results);
        });
    });
};
//
async function sequentialQueries() {
    try {
        const result1 = await queryPromise1();
        const result2 = await queryPromise2();
        const result3 = await queryPromise3();
        // you can do something with the result
        console.log(result1);
        console.log(result2);
        console.log(result3);
    } catch (error) {
        console.log(error)
    }
}

sequentialQueries();
// console.log(items)
// console.log(cities)
// console.log(couponcodes)

module.exports.items = items;
module.exports.cities = cities;
module.exports.couponcodes = couponcodes;