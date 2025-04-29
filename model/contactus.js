const mongoose = require('mongoose');

let userschema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mobile:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:false,
        defaul:null
    },
    message:{
        type:String,
        required:true,
    }
});
let usermodel = mongoose.model('usercontacts',userschema);
module.exports = usermodel;

