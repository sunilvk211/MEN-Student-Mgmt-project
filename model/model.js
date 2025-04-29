const mongodb = require('./mongodb');
const contactus = require('./contactus');
const student = require('./student');
const service = require('./service');
const nodemailer = require('nodemailer');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');
require('dotenv').config();

let newOTP = getNewOTP();

async function getuserinfo(userid) {
    // console.log()

    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let info = await mycol.findOne({ $or: [{ mobile: parseInt(userid) }, { email: userid }] });
        return info;
    } catch (err) {
        console.error("ERROR in Get Info ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function getprofileinfo(id,callback) {
   let dataUser = await getuserinfo(id);
   return callback(dataUser);
}

async function updateprofileadmin(updateinfo,updatephoto, callback) {
    let objectid = {_id:new ObjectId(updateinfo.stdid)};
    let email = updateinfo.stdemail;
    let hashpass  = await bcrypt.hash(updateinfo.stdpassword,10);
    // console.log(hashpass);
    
    let stdinfo = await checkuserinfoforUpdate(updateinfo.stdmobile, email);
    
    if (stdinfo != null) {
        let updatedinfo = await getuserinfo(email);
        return callback('already',updatedinfo)
    } else {
        let finaluser = new student({
            _id:objectid,
            name: updateinfo.stdname,
            mobile: updateinfo.stdmobile,
            emailverify:true,
            password: hashpass ,
            blockstatus: updateinfo.stdblock,
            gender: updateinfo.stdgender,
            dob: updateinfo.stddob,
            photoformat:updatephoto.f,
            address: updateinfo.stdaddress,
            city: updateinfo.stdcity,
            state: updateinfo.stdstate,
            course: updateinfo.stdcourse,
            checkbox: updateinfo.stdagree,
            role: updateinfo.userrole,
        });

        try {
            let db = await mongodb.getconnect();
            let mycol = db.collection('profile');
            let updateinfo = await mycol.updateOne(objectid,{$set:finaluser});
            let updateimg = await mycol.updateOne(objectid,{$set:{photo:updatephoto.p}});
            
            let updatedinfo = await getuserinfo(email);
            return callback(updateinfo.acknowledged, updatedinfo);
        } catch (err) {
            console.error("ERROR in Update User", err);
            return callback(err);
        } finally {
            await mongodb.getdisconnect();
        }
    }
}

async function checkuserinfo(usermobile, useremail) {

    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let info = await mycol.findOne({$or:[{mobile:parseInt(usermobile)}, {email:useremail}]});
        return info;
    } catch (err) {
        console.error("ERROR in Get Info ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function checkuserinfoforUpdate(usermobile, useremail) {

    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let info = await mycol.findOne({email:{$ne:useremail},mobile:parseInt(usermobile)});
        return info;
    } catch (err) {
        console.error("ERROR in Get Info ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function savecontact(userinfo, callback) {
    let contactuser = new contactus({
        name: userinfo.uname,
        mobile: userinfo.umobile,
        email: userinfo.uemail,
        message: userinfo.umsg,
    });
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('usercontacts');
        let insert = await mycol.insertOne(contactuser);
        return callback(insert.acknowledged);

    } catch (err) {
        console.error("ERROR in contact Us", err);
        return callback(err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function login(logininfo, callback) {
    let dataUser = await getuserinfo(logininfo.id);
    
     
    if (dataUser === null) {
        return callback('notfound', null)
    } else if (! await passwordcompare(logininfo.password,dataUser.password ) ) {
        return callback('invalidpassword', dataUser)
    } 
    else if (dataUser.blockstatus != false) {
        return callback('blocked', dataUser);
    } 
    else if (dataUser.emailverify === false)
         {
        return callback('notverify')
    }
    else if (dataUser.role == 'admin') 
        {
        return callback('admin', dataUser)
    } 
     else {
        return callback('student', dataUser);
    }
}

async function passwordcompare(loginpass, datapass) {
    let result = await bcrypt.compare(loginpass,datapass);
    // console.log(result);
    return result;
}

async function savestudent(studentinfo,userphoto, callback) {
    let stdinfo = await checkuserinfo(studentinfo.stdmobile, studentinfo.stdemail);
    if (stdinfo != null) {
        return callback('already')
    } else {
        // email send with otp 
        sendEmail(studentinfo.stdemail, newOTP);
        let hashpass = await bcrypt.hash(studentinfo.stdpassword,10);
        let finalstudent = new student({
            name: studentinfo.stdname,
            mobile: studentinfo.stdmobile,
            email: studentinfo.stdemail,
            emailverify: false,
            otp: newOTP,
            password:hashpass ,
            blockstatus: studentinfo.stdblock,
            gender: studentinfo.stdgender,
            dob: studentinfo.stddob,
            photo: userphoto.p,
            photoformat:userphoto.f,
            address: studentinfo.stdaddress,
            city: studentinfo.stdcity,
            state: studentinfo.stdstate,
            course: studentinfo.stdcourse,
            checkbox: studentinfo.stdagree,
            role: studentinfo.userrole,
        });

        try {
            let db = await mongodb.getconnect();
            let mycol = db.collection('profile');
            let insert = await mycol.insertOne(finalstudent);
            return callback(insert.acknowledged);

        } catch (err) {
            console.error("ERROR in Register Student", err);
            return callback(err);
        } finally {
            await mongodb.getdisconnect();
        }
    }
}

async function verify(verifyinfo, callback) {
    let dataUser = await getuserinfo(verifyinfo.email);

    if (dataUser === null) {
        return callback('notfound', null)
    } else if (dataUser.otp != verifyinfo.otp) {
        return callback('invalid', dataUser)
    }
    else {
        try {
            let db = await mongodb.getconnect();
            let mycol = db.collection('profile');
            let verify = await mycol.updateOne({ email: verifyinfo.email }, { $set: { emailverify: true } });
            return callback(verify.acknowledged, dataUser);

        } catch (err) {
            console.error("ERROR in Verification of Student", err);
            return callback(err);
        } finally {
            await mongodb.getdisconnect();
        }
    }
}


async function getallcontactlist(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('usercontacts');
        let contactlist = await mycol.find().toArray();
        if(contactlist == null){
            return callback('notfound')
        }else{
            return callback(contactlist);
        }
    } catch (err) {
        console.error("ERROR in Get contact list ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function deletecontact(id,callback) {
    let objectid = {_id:new ObjectId(id)};
    try{
        let db = await mongodb.getconnect();
        let mycol = db.collection('usercontacts');
        let contactdelete = await mycol.deleteOne(objectid);
        let contactlist = await mycol.find().toArray();
        callback(contactdelete.acknowledged, contactlist);

    }catch(err){
        console.error("Error in delete contact: ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function getallregstdlist(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let studentlist = await mycol.find().toArray();
        if(studentlist == null){
            return callback('notfound')
        }else{
            return callback(studentlist);
        }
    } catch (err) {
        console.error("ERROR in Get student list ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function blockprofile(stdemail,callback) {
    try{
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let studentblock = await mycol.updateOne({email:stdemail},{$set:{blockstatus:true}});
        callback(studentblock.acknowledged );
    }catch(err){
        console.error("Error in delete contact: ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function deleteprofile(stdemail, callback) {
    try{
        let stdinfo = await getuserinfo(stdemail); 
        let db1 = await mongodb.getconnect();
        let deletecol = db1.collection('deletedstds');
        let deleteresult = await deletecol.insertOne(stdinfo);
        
        let db = await mongodb.getconnect();
        let mycol = db.collection('profile');
        let studentdelete = await mycol.deleteOne({email:stdemail});
        callback(studentdelete.acknowledged );
    }catch(err){
        console.error("Error in delete contact: ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function getalldelstdlist(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('deletedstds');
        let studentlist = await mycol.find().toArray();
        if(studentlist == null){
            return callback('notfound')
        }else{
            return callback(studentlist);
        }
    } catch (err) {
        console.error("ERROR in Get student list ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function saveservice(servdata, serfile, callback) {
    let finalservice = new service({
        name:servdata.sername,
        course:servdata.sercourse,
        field:servdata.serfield,
        number:servdata.sernumber,
        file:serfile.sfile,
        format:serfile.sformat,
    });

    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('service');
        let insert = await mycol.insertOne(finalservice);
        return callback(insert.acknowledged);

    } catch (err) {
        console.error("ERROR in Upload Service", err);
        return callback(err);
    } finally {
        await mongodb.getdisconnect();
    }
}

async function getallservicelist(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('service');
        let servicelist = await mycol.find().toArray();
        if(servicelist == null){
            return callback('notfound')
        }else{
            return callback(servicelist);
        }
    } catch (err) {
        console.error("ERROR in Get contact list ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}





async function getallservicelistorder(callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('service');
        let servicelist = await mycol.find().sort({name:1,course:1,field:1,number:1}).toArray();
        if(servicelist == null){
            return callback('notfound')
        }else{
            return callback(servicelist);
        }
    } catch (err) {
        console.error("ERROR in Get contact list ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}


async function saveserviceallocate(servallocdata, callback) {
    let useremail = servallocdata.useremail; 
    let alloccourseid = {_id:new ObjectId(servallocdata.seralloccourseid)};

    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('service');
        let insert = await mycol.updateOne(alloccourseid,{$push:{allow:useremail}});
        return callback(insert.acknowledged);

    } catch (err) {
        console.error("ERROR in Upload Service", err);
        return callback(err);
    } finally {
        await mongodb.getdisconnect();
    }
}


async function getallservicelistuser(userid,callback) {
    try {
        let db = await mongodb.getconnect();
        let mycol = db.collection('service');
        let servicelist = await mycol.find({allow:userid}).toArray();
        if(servicelist == null){
            return callback('notfound')
        }else{
            return callback(servicelist);
        }
    } catch (err) {
        console.error("ERROR in Get contact list ", err);
    } finally {
        await mongodb.getdisconnect();
    }
}





// common functions otp, email
function getNewOTP() {
    let chats = "123456789";
    let OTP = "";
    for (i = 0; i < 6; i++) {
        let index = Math.floor(Math.random() * 9);
        OTP += chats.charAt(index);
    }
    // console.log(OTP);
    return OTP;
}
function sendEmail(useremail, newotp) {
    let transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.emailuser,
            pass: process.env.emailpass,
        }
    });

    let email1 = {
        from: process.env.emailuser,
        to: useremail,
        subject: 'Email Verification OTP',
        text: `Hello Dear ${useremail}, Your Verification OTP is ${newotp}
        please keep secret do not share with others.`
    }
    transport.sendMail(email1, (err, result) => {
        if (err) {
            console.error("Error: in send mail" + err)
        } else {
            // console.log("Email Send Success", result.response);
        }
    });

}
module.exports = { savecontact, login, savestudent, verify, getprofileinfo, updateprofileadmin, getallcontactlist, deletecontact, getallregstdlist, blockprofile, deleteprofile, getalldelstdlist, saveservice, getallservicelist, getallservicelistorder, saveserviceallocate, getallservicelistuser }