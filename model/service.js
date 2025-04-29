const mongoose = require('mongoose');

const service = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    course:{
        type:String,
        required:true,
    },
    field:{
        type:String,
        required:true,
    },
    number:{
        type:Number,
        required:true,
    },
    file:{
        type:Buffer,
        contentType:String,
        require:false,
    },
    format:{
        type:String,
        required:false,
    }
});

const serviceclass = mongoose.model('service',service);
module.exports = serviceclass;