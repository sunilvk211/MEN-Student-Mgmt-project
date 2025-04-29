const express = require('express');
const app = express();
const myserver = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(myserver);  

require('dotenv').config();
const PORT = process.env.PORT;
const webrouter = require('./routes/router');
const adminrouter = require('./routes/adminrouter');
const studentrouter = require('./routes/studentrouter');

const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const session = require('express-session');

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use(cookieparser());
app.use(session({
    secret:process.env.secret,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000 * 60 * 30 } // 30 minutes auto logout time
}));

app.use(express.static('views'));
app.use('/admin',express.static('views'))

app.use((req,res,next)=>{
    // console.log("clear");
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
})
app.use("/",webrouter);
app.use('/admin',adminrouter);
app.use('/std',studentrouter);


// chatting server setup 
let userslist = {};
io.on("connection",(socket)=>{
    // console.log("any User is connected.id: "+socket.id);

    socket.on('joinuser',(user)=>{

        userslist[socket.id] = user;
        // console.log(userslist);
        io.emit('alluser',userslist);
    });

    socket.on('user-send-msg',(data)=>{
        // console.log(data);
        io.emit('share-now',data); // to all users
      //  socket.broadcast.emit('share-now',data); // to all excluding self.
    });


});















app.get('*',(req,res)=>{
    res.render('notfound');
})
myserver.listen(PORT,(err)=>{
    if(err) {
        console.error("Error in Server Start")
    }else{
        console.log(`Server Running at ${PORT} `);
    }
});