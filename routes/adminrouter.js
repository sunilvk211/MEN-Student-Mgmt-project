const express = require('express');
const mycontroller = require('../controller/mycontroller');
const adminRouter = express.Router();
const multer = require('multer');
const mystorage = multer.memoryStorage();
const upload = multer({storage:mystorage});

adminRouter.get('/',mycontroller.checkuserlogin,mycontroller.adminHome);
adminRouter.get('/profile',mycontroller.checkuserlogin,mycontroller.adminprofile);
adminRouter.get('/register',mycontroller.checkuserlogin,mycontroller.adminRegisterget);
adminRouter.get('/contactlist',mycontroller.checkuserlogin,mycontroller.contactlistget);
adminRouter.get('/delete/:id',mycontroller.checkuserlogin,mycontroller.contactdelete);
adminRouter.get('/allregstd',mycontroller.checkuserlogin,mycontroller.registerlistget);
adminRouter.get('/viewstd/:email',mycontroller.checkuserlogin, mycontroller.stdprofileget);
adminRouter.get('/blockstd/:email',mycontroller.checkuserlogin,mycontroller.studentprofileblock);
adminRouter.get('/deletestd/:email',mycontroller.checkuserlogin,mycontroller.studentprofiledelete);
adminRouter.get('/allocate/:email',mycontroller.checkuserlogin,mycontroller.adminserviceallocate);
adminRouter.get('/alldeletedstd',mycontroller.checkuserlogin,mycontroller.deletedlistget);
adminRouter.get('/services',mycontroller.checkuserlogin,mycontroller.adminServiceget);
adminRouter.get('/serviceadd',mycontroller.checkuserlogin,mycontroller.adminserviceadd);

adminRouter.post('/adminupdate',mycontroller.checkuserlogin,upload.single('stdphoto'),mycontroller.adminProfileUpdate)
adminRouter.post('/stdregister',mycontroller.checkuserlogin,upload.single('stdphoto'),mycontroller.adminRegisterPOST);
adminRouter.post('/userverification',mycontroller.checkuserlogin,mycontroller.userverification);
adminRouter.post('/serviceadd',mycontroller.checkuserlogin,upload.single('serfile'),mycontroller.adminserviceaddpost);
adminRouter.post('/serviceallocate',mycontroller.checkuserlogin,mycontroller.adminserviceallocatepost);
module.exports = adminRouter;