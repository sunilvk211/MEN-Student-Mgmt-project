let model = require('../model/model');
// let admin = { name: 'Admin', role: 'admin', id: 'infoviaantechnologies@gmail.com' };

let loginusersArray = [];

module.exports = {
    // Local Controller
    home: (req, res) => {
        res.render("index");
    },
    about: (req, res) => {
        res.render("about");
    },
    service: (req, res) => {
        res.render("service", { servescount: null });
    },
    loginget: (req, res) => {
        res.render("login", { msg: null, type: null });
    },
    contactget: (req, res) => {
        res.render("contact", { msg: null, type: null });
    },

    contactusPOST: (req, res) => {
        // console.log(req.body);
        let contactinfo = req.body;
        if (!contactinfo.uname || !contactinfo.umobile || !contactinfo.umsg) {
            res.render('contact', { msg: 'your detais incomplete please fill name, mobile, msg...', type: 'alert-danger' });
        } else {
            model.savecontact(contactinfo, (resultContact) => {
                res.render('contact', { msg: 'your message is send successful... ' + resultContact, type: 'alert-success' });
            })
        }
    },

    loginPOST: (req, res) => {
        // console.log(req.body);
        let logininfo = req.body;
        // console.log(logininfo);

        if (!logininfo.id || !logininfo.password) {
            res.render('login', { msg: "Please Enter Login ID and Password", type: 'alert-danger' });
        } else {

            function checkstatus() {
                let st= false;
                loginusersArray.filter((user)=>{
                    if(logininfo.id == user.email || logininfo.id == user.mobile){
                        st=  true;
                    }else{
                        st = false;
                    }

                });
                return st;
            }
                let loginstatus = checkstatus();
                // console.log(loginstatus);

            if (loginstatus === true) {
                res.render('login', { msg: "Given user Login ID already login", type: 'alert-danger' });
            } else {

                model.login(logininfo, (loginresult, dataUser) => {
                    switch (loginresult) {
                        case 'notfound':
                            res.render('login', { msg: "Enter Login ID or Password not found in database", type: 'alert-danger' });
                            break;
                        case "invalidpassword":
                            res.render('login', { msg: "Enter Login ID or Password not match", type: 'alert-danger' });
                            break;
                        case 'blocked':
                            res.render('login', { msg: "Enter Login ID user account is blocked", type: 'alert-danger' });
                            break;
                        case 'notverify':
                            res.render('login', { msg: "Enter Login ID user's email is not verified", type: 'alert-danger' });
                            break;
                        case 'admin':
                            loginusersArray.push(dataUser);
                            // console.log(loginusersArray[0].name);
                            req.session.user = dataUser;
                            // res.render('adminhome', { loginuser: dataUser });
                                res.redirect('/admin');
                            break;
                        default:
                            loginusersArray.push(dataUser);
                            req.session.user = dataUser;
                            res.redirect('/std');
                    }
                });
            }
        }
    },

    checkuserlogin:(req,res,next)=>{
        if( req.session.user != null ){
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next();
        }else{
            res.redirect('/login');
            // res.render('login', { msg: "You are not login for access service", type: 'alert-danger' });
        }
    },

    logout:(req,res)=>{
        if(req.session.user != null){
            req.session.destroy((err,result)=>{
                if(err){
                    console.error("Error in logout: ",err);
                }else{
                    // console.log("Logout Successful..."+(result));
                }
                loginusersArray.pop();
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.clearCookie('connect.sid').redirect('/');
            });
        }else{
            res.render('login', { msg: "You are not login...", type: 'alert-danger' });
        }
    },
    // admin Controller
    adminHome: (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.render('adminhome', { loginuser: req.session.user });
    },

    // student controller
    studentHome: (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.render('studenthome', { loginuser: req.session.user });
    },

    adminprofile: (req, res) => {
        let adminid = req.session.user.email;
        model.getprofileinfo(adminid, (dataUser) => {
            res.render('adminprofile', { loginuser: dataUser, msg: null, type: null });
        });
    },

    studentprofile: (req, res) => {
        let studentid = req.session.user.email;
        model.getprofileinfo(studentid, (dataUser) => {
            res.render('studentprofile', { loginuser: dataUser, msg: null, type: null });
        });
    },

    adminProfileUpdate: (req, res) => {
        let updatedata = req.body;
        let updatephoto = { p: req.file.buffer, f: req.file.mimetype };

        if (!updatedata.stdname || !updatedata.stdmobile || !updatedata.userrole || !updatedata.stdgender || !updatedata.stddob || !updatedata.stdpassword || !updatedata.stdagree) {
            model.getprofileinfo(updatedata.stdemail, (dataUser) => {
                res.render('adminprofile', { msg: "Name, mobile, role,gender, dob, password, agree T. & C. can't empty for update", type: "alert-danger", loginuser: dataUser })
            });
        } else {
            model.updateprofileadmin(updatedata, updatephoto, (updateresult, updatedinfo) => {
                switch (updateresult) {
                    case "already":
                        res.render('adminprofile', { msg: "update mobile is already registered with other user.", type: "alert-danger", loginuser: updatedinfo });
                        break;
                    default:
                        res.render('adminprofile', { msg: "Dear " + updatedata.stdname + " Your profile update successful... " + updateresult, type: "alert-success", loginuser: updatedinfo });
                        break;
                }
            });
        }
    },
    

    studentProfileUpdate: (req, res) => {
        let updatedata = req.body;
        let updatephoto = { p: req.file.buffer, f: req.file.mimetype };

        if (!updatedata.stdname || !updatedata.stdmobile || !updatedata.stdgender || !updatedata.stddob || !updatedata.stdpassword || !updatedata.stdagree) {
            model.getprofileinfo(updatedata.stdemail, (dataUser) => {
                res.render('studentprofile', { msg: "Name, mobile, role,gender, dob, password, agree T. & C. can't empty for update", type: "alert-danger", loginuser: dataUser })
            });
        } else {
            model.updateprofileadmin(updatedata, updatephoto, (updateresult, updatedinfo) => {
                switch (updateresult) {
                    case "already":
                        res.render('studentprofile', { msg: "update mobile is already registered with other user.", type: "alert-danger", loginuser: updatedinfo });
                        break;
                    default:
                        res.render('studentprofile', { msg: "Dear " + updatedata.stdname + " Your profile update successful... " + updateresult, type: "alert-success", loginuser: updatedinfo });
                        break;
                }
            });
        }
    },


    adminRegisterget: (req, res) => {
        res.render('adminregister', { msg: null, type: null });
    },

    adminRegisterPOST: (req, res) => {
        let userdata = req.body;
        let userphoto = { p: req.file.buffer, f: req.file.mimetype };

        // console.log(userdata);
        if (!userdata.stdname || !userdata.stdmobile || !userdata.userrole || !userdata.stdgender || !userdata.stddob || !userdata.stdpassword || !userdata.stdagree) {
            res.render('adminregister', { msg: "Please Enter Name, mobile, role,gender, dob, password, agree T. & C.", type: "alert-danger" });
        } else {
            model.savestudent(userdata, userphoto, (registerresult) => {
                switch (registerresult) {
                    case "already":
                        res.render('adminregister', { msg: "Enter mobile or Email is already registered", type: "alert-danger" });
                        break;

                    default:
                        res.render('adminregister', { msg: "Dear " + userdata.stdname + " Your registration successful... " + registerresult, type: "alert-success" });
                        break;
                }
            });
        }
    },

    userverification: (req, res) => {
        // console.log(req.body);
        let verifyinfo = req.body;
        if (!verifyinfo.email || !verifyinfo.otp) {
            res.render('adminregister', { msg: "Please Enter Valid Mail and OTP", type: 'alert-danger' });
        } else {
            model.verify(verifyinfo, (verifyresult, dataUser) => {
                switch (verifyresult) {
                    case 'notfound':
                        res.render('adminregister', { msg: "Entered Email found in database", type: 'alert-danger' });
                        break;
                    case "invalid":
                        res.render('adminregister', { msg: "Enter OTP not match in record", type: 'alert-danger' });
                        break;
                    default:
                        res.render('adminregister', { msg: `Dear Admin, ${dataUser.name}'s, Email verification successful... `, type: 'alert-success' });
                }
            });
        }
    },

    cookienew: (req, res) => {
        // res.cookie('name','mycookie').render('index');
        // console.log(req.cookies);
        // res.cookie('name','my expiring cookies',{expire: 60000+ Date.now()}).render('index');
        res.cookie('name', 'my expiry with MAx age', { maxAge: 30000 }).render('index');
    },

    cookiedelete: (req, res) => {
        res.clearCookie('name').render('index');
    },

    sessionpage: (req, res) => {

        if (req.session.pagecount) {
            req.session.pagecount++;
            console.log(req.session.pagecount);
            res.render('service', { servescount: req.session.pagecount });
        } else {
            req.session.pagecount = 1;
            res.render('service', { servescount: 1 });
        }
    },

    contactlistget:(req,res)=>{
        model.getallcontactlist((cnctlist_result)=>{
            switch (cnctlist_result) {
                case "notfound":
                    res.render('admincontactlist',{contactlist:cnctlist_result, type:'danger'});
                    break;
            
                default:
                    res.render('admincontactlist',{contactlist:cnctlist_result, type:'success'});
                    break;
            }
        });
    },

    contactdelete:(req,res)=>{
        let id = req.params.id;
        model.deletecontact(id,(deleteresult,newcnctlist_result)=>{
            res.render('contactlist',{contactlist:newcnctlist_result, type:'success'});
        });
    },

    registerlistget:(req,res)=>{
        model.getallregstdlist((stdlist_result)=>{
            switch (stdlist_result) {
                case "notfound":
                    res.render('adminuserreglist',{studentlist:stdlist_result, type:'danger'});
                    break;
            
                default:
                    res.render('adminuserreglist',{studentlist:stdlist_result, type:'success'});
                    break;
            }
        })
    },
    
    stdprofileget: (req, res) => {
        let stdid = req.params.email;
        model.getprofileinfo(stdid, (datastudent) => {
            res.render('adminprofile', { loginuser: datastudent, msg: null, type: null });
        });
    },
    
    studentprofileblock:(req, res) => {
        let stdid = req.params.email;
        model.blockprofile(stdid, (blockresult) => {
            res.redirect('/admin/allregstd');
        });
    },
    
    studentprofiledelete:(req,res)=>{
        let stdid = req.params.email;
        model.deleteprofile(stdid,(deleteresult) =>{
            res.redirect('/admin/allregstd');
        })
    },
    
    deletedlistget:(req,res)=>{
            model.getalldelstdlist((stdlist_result)=>{
                switch (stdlist_result) {
                    case "notfound":
                        res.render('adminuserdeletedlist',{studentlist:stdlist_result, type:'danger'});
                        break;
                
                    default:
                        res.render('adminuserdeletedlist',{studentlist:stdlist_result, type:'success'});
                        break;
                }
            })
        },
    
    chatget:(req,res)=>{
        res.render('servicechat');
    },

    adminServiceget:(req,res)=>{
        model.getallservicelist((serviceist_result)=>{
            switch (serviceist_result) {
                case "notfound":
                    res.render('adminservicelist',{servicelist:serviceist_result, type:'danger'});
                    break;
            
                default:
                    res.render('adminservicelist',{servicelist:serviceist_result, type:'success'});
                    break;
            }
        });
    },

    adminserviceadd:(req,res)=>{
        res.render('adminserviceadd',{ msg: null, type: null });
    },

    adminserviceaddpost:(req,res)=>{
        let servdata = req.body;
        let serfile = {sfile:req.file.buffer,sformat:req.file.mimetype};

        if(! (servdata.sername || servdata.sercourse || servdata.serfield || servdata.sernumber )){
            res.render('adminserviceadd', { msg: "Please Enter Service  name, course, filed, number", type: "alert-danger" });
        } else {
            model.saveservice(servdata, serfile, (serviceaddresult) => {
                        res.render('adminserviceadd', { msg: "Dear " + servdata.sername + " Your Service add successful..." + serviceaddresult, type: "alert-success" });
            });
        }
    },

    adminserviceallocate:(req,res)=>{
        let stdid =  req.params.email;
        model.getallservicelistorder((serviceist_result)=>{
            switch (serviceist_result) {
                case "notfound":
                    res.render('adminservicelist',{servicelist:serviceist_result,msg:null, type:'danger'});
                    break;
                default:
                    res.render('adminserviceallocate',{servicelist:serviceist_result,useremail:stdid,msg:null ,type:'success'});
                    break;
            }
        });
    },

    adminserviceallocatepost:(req,res)=>{
        let servallocdata = req.body;

        if(! (servallocdata.useremail || servallocdata.seralloccourseid  )){
            res.render('adminserviceallocate', { msg: "Please Enter Service allocate Email, course", type: "alert-danger" });
        } else {
            model.saveserviceallocate(servallocdata, (serviceallocateresult) => {
                        res.render('adminserviceallocate', { msg: "Dear " + servallocdata.useremail + " Your Service allocated successful..." + serviceallocateresult,servicelist:null,useremail:servallocdata.useremail, type: "alert-success" });
            });
        }
    },

    
    userServiceget:(req,res)=>{
        let userid = req.session.user.email;
        model.getallservicelistuser(userid,(serviceist_result)=>{
            switch (serviceist_result) {
                case "notfound":
                    res.render('servicelist',{servicelist:serviceist_result, type:'danger'});
                    break;
            
                default:
                    res.render('servicelist',{servicelist:serviceist_result, type:'success'});
                    break;
            }
        });
    },
    
}