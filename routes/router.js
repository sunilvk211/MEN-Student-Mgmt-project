const express = require('express');
const webrouter = express.Router();
const mycontroller = require('../controller/mycontroller');

webrouter.get('/',mycontroller.home);
webrouter.get('/about',mycontroller.about);
webrouter.get('/service',mycontroller.service);
webrouter.get('/login',mycontroller.loginget);
webrouter.get('/logout',mycontroller.logout);
webrouter.get('/contact',mycontroller.contactget);
webrouter.get('/cookie',mycontroller.cookienew);
webrouter.get('/cookiedelete',mycontroller.cookiedelete);
webrouter.get('/session',mycontroller.sessionpage)
webrouter.get('/chatservice',mycontroller.chatget);
webrouter.post('/loginadmin',mycontroller.loginPOST);
webrouter.post('/loginstudent',mycontroller.loginPOST);
webrouter.post('/contact',mycontroller.contactusPOST);

module.exports = webrouter;