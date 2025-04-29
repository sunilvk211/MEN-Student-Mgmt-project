const mongoose = require('mongoose');

const student = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },

    mobile:{
        type:Number,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:false,
        unique:true,
    },
    emailverify:{
        type:Boolean,
        required:true,
        default:false,
    },
    otp:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true,
        default:'std@123'
    },
    blockstatus:{
        type:Boolean,
        required:false,
    },
    gender:{
        type:String,
        required:true,
    },
    dob:{
        type:Date,
        required:true,
    },
    photo:{
        type:Buffer,
        contentType:String,
        required:false,
    },
    photoformat:{
        type:String,
        required:false,
    },
    address:{
        type:String,
        required:false,
    },
    city:{
        type:String,
        required:false,
    },
    state:{
        type:String,
        required:false,
    },
    course:{
        type:String,
        required:true,

    },
    checkbox:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
    }

});

const stdclass = mongoose.model('profile',student);
module.exports = stdclass;