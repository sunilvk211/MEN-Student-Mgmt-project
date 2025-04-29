const mongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = process.env.uri2;
const client = new mongoClient(uri);

module.exports = {

    getconnect:async function getconnect(){ 
        let result = await client.connect();
        return db = result.db('myadmin');
    },
    
    getdisconnect:async function getdisconnect() {
        return await client.close();
    }
}