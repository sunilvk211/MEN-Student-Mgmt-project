const express = require('express');
const mycontroller = require('../controller/mycontroller');
const studentRouter = express.Router();
const multer = require('multer');
const mystorage = multer.memoryStorage();
const upload = multer({storage:mystorage});

studentRouter.get('/',mycontroller.checkuserlogin,mycontroller.studentHome);
studentRouter.get('/profile',mycontroller.checkuserlogin,mycontroller.studentprofile);
studentRouter.get('/service',mycontroller.checkuserlogin,mycontroller.userServiceget);

studentRouter.post('/studentupdate',mycontroller.checkuserlogin,upload.single('stdphoto'),mycontroller.studentProfileUpdate);
// adminRouter.post('/userverification',mycontroller.checkuserlogin,mycontroller.userverification);

module.exports = studentRouter;