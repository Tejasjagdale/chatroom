require('dotenv').config();
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser"); 
const auth = require("./middelware/auth");
const jwt = require("jsonwebtoken");
const ss = require("socket.io-stream");
const fs = require("fs");
const path =  require("path");
const nodemailer =  require("nodemailer");

const PORT = process.env.PORT || 3812;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/static"));
app.use(express.static(__dirname+"/images"));
app.use(express.static(__dirname + "/node_modules"));
app.use(bodyParser.json());
app.use(cookieParser());

require("./db/conn");
const Register = require("./db/registers");
const Rooms = require("./db/rooms");
const Gusers = require("./db/gusers");
const { load } = require('dotenv');


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var otp;

app.get('/', function(req, res) {
    if(req.cookies.jwt){
        res.redirect(`/chatroom`)
    }else{
        res.sendFile(__dirname+'/home.html');
    }
});

app.get('/chatroom', auth , function(req, res) {
    res.sendFile(__dirname+'/main.html');
});

app.get('/logout', auth , async (req, res)=> {
    try {
        const token = req.cookies.jwt.token;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        const user_type = req.cookies.jwt.user_type;
        res.clearCookie("jwt");

        if(user_type == "guest"){
            await Gusers.deleteOne({_id:verifyUser._id});
        }

        await req.user.save();

        res.redirect("/");
    } catch (error) {
        res.status(500).send(error)
    }
});

app.get('/emailverification', function(req, res) {
    res.sendFile(__dirname+'/email_verification.html');
});



app.post("/register", async(req,res)=>{
    try {
        const registeruser = new Register({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            type:"register",
            country:"india"
        });

        const token = await registeruser.generateAuthToken();

        res.cookie("jwt",{"token":token,"user_type":"register","name":req.body.name});
        
        // var transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //       user: 'tejasjagdale60@gmail.com',
        //       pass: 'pcbbypqecyudcajy'
        //     }
        //   });
          
        //   otp = getRandomInt(1000,9999);

        //   var mailOptions = {
        //     from: 'tejasjagdale60@gmail.com',
        //     to: req.body.email,
        //     subject: 'Forget password of fcrit website',
        //     text: `your otp is ${otp}`
        //   };
          
        //   transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //       console.log(error);
        //     } else {
        //       console.log('Email sent: ' + info.response);
        //     }
        //   });

        const registered = await registeruser.save();

        res.send("okay");

        console.log("1 new user got register successfully");  


    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/everify",async(req,res)=>{
    var user_code = req.body.code;

    if(user_code == otp){
        res.send("pass");
    }else{
        res.send("fail");
    }
});

app.post("/login",async(req,res)=>{
    try {
        const user = await Register.findOne({$or:[
            {"name":req.body.name_email},
            {"email":req.body.name_email}
        ]});

        const isMatch =  await bcrypt.compare(req.body.password,user.password);

        const token = await user.generateAuthToken();

        res.cookie("jwt",{"token":token,"user_type":"register","name":req.body.name_email});

        if(isMatch){
            res.send("matched");
        }else{
            res.send("invalid login details");
        }


    } catch (error) {
        res.status(400).send("some error occured");
    }
});

app.post("/glogin",async(req,res)=>{
    try {
        const guestuser = new Gusers({
            name:req.body.name,
            type:"guest",
            country:"india"
        });

        const token = await guestuser.generateAuthToken();

        res.cookie("jwt",{"token":token,"user_type":"guest","name":req.body.name});
        
        const guser = await guestuser.save();

        res.send("okay");

        console.log("1 new guest user joined");

    } catch (error) {
        res.status(400).send(error);
    }
});

var activeusers = [];
var user_sockets = [];
var roomsname = [];
var roomdata = [];

async function loader(){
    try {
        var loadrooms =await  Rooms.find({},{id:0});

        roomdata.push({
            "roomname":"Main Room",
            "roomusers":new Array(),
            "userssockets":new Array(),
            "roommsgs":new Array(),
            "roomroles":[{role:"admin",username:"tejas",userid:"6137236ace08af10f49e304c"}],
            "muteusers":new Array(),
            "banusers":new Array(),
            "roomactive":false
        });

        loadrooms.forEach((items,index) => {
        roomsname.push(items.roomname);
        roomdata.push({
            "roomname":items.roomname,
            "roomusers":new Array(),
            "userssockets":new Array(),
            "roommsgs":new Array(),
            "roomroles":items.roomroles,
            "muteusers":new Array(),
            "banusers":items.banedusers,
            "roomactive":false
        });
        });
    } catch (error) {
        console.log(error);
    }
};

loader();


io.on('connection', function(socket) {
    socket.on('new-user-joined', async (data) => {
        try {
            const token = data.token;
            const user_type = data.user_type;
            const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
            
            activeusers.forEach((element,index) => {
                if(verifyUser._id == element.id){
                    user_sockets[index] = socket
                    roomdata[0].userssockets.forEach((elem,ind)=>{
                        if(elem.id == verifyUser._id){
                            roomdata[0].userssockets[ind] = socket.id;
                        }
                    })
                }
            });

            if(user_type == "register"){
                var user = await Register.findOne({_id:verifyUser._id}); 
            }else{
                var user = await Gusers.findOne({_id:verifyUser._id});
            }
            

            socket.emit('load-users',roomdata[0].roomusers);
            socket.emit('load-rooms',roomsname);

            if(roomdata[0].roomusers.length == 0){
                roomdata[0].roomusers[0] = {"name":user.name,"id":user._id,"country":user.country,"type":user.type,"blocks":user.blocks,"current_room":"Main Room"};
                roomdata[0].userssockets[0] = socket.id;
                roomdata[0].roomactive =  true;
            }else{
                roomdata[0].roomusers = [...roomdata[0].roomusers,{"name":user.name,"id":user._id,"country":user.country,"type":user.type,"blocks":user.blocks,"current_room":"Main Room"}]
                roomdata[0].userssockets = [...roomdata[0].userssockets,socket.id];
            }

            activeusers.push({"name":user.name,"id":user._id,"country":user.country,"type":user.type,"blocks":user.blocks,"current_room":"Main Room"});
            user_sockets.push(socket.id);

            socket.emit('user-joined',{"name":user.name,"id":user._id,"country":user.country,"type":user.type,"blocks":user.blocks,"current_room":"Main Room"});
            socket.broadcast.emit('user-joined',{"name":user.name,"id":user._id,"country":user.country,"type":user.type,"blocks":user.blocks,"current_room":"Main Room"});
            socket.emit('load-msgs',roomdata[0].roommsgs);
            socket.emit('room-users',roomdata);
            socket.broadcast.emit('room-users',roomdata);

            if(user.type == "register"){
                const frnds = await Register.findOne({_id:user._id});
                socket.emit('load-frnds',frnds);
            }
        } catch (error) {
            console.log(error);
        }
   });

   socket.on('room-users',(data)=>{
        socket.emit('room-users',roomdata);
        socket.broadcast.emit('room-users',roomdata);
   });

    socket.on('msg-send', function (data1) {
        socket.broadcast.emit('msg-send', data1);

       roomdata.forEach(function(items, index){
           if(data1.room == items.roomname){
            if(roomdata[index].roommsgs.length >= 10){
                roomdata[index].roommsgs.splice(0, 1);
                roomdata[index].roommsgs.push(data1)
                socket.emit('auto-msg-clear', data1);
                socket.broadcast.emit('auto-msg-clear', data1);
            }else{
                roomdata[index].roommsgs.push(data1)
            }
           }
       });
    });

    socket.on("load_profile",async (data)=>{
        try {
            var user = await Register.findOne({_id:data.id.replace("user"," ").trim()});  
            socket.emit('load_details', user);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("request_video",(data)=>{
        activeusers.forEach(function(items, index){
            if(items.id == data.rcallid){
                socket.broadcast.to(user_sockets[index]).emit('request_video', data);
            }
        });
    })

    socket.on("load-pmmsgs",async function(data){
        try {
            if(data.type == "register"){
                var pm_loaded  = await Register.find( {_id:data.id.replace("user"," ").trim()} )
            }else{
                var pm_loaded  = await Gusers.find( {_id:data.id.replace("user"," ").trim()} )
            }

            socket.emit("load-pmmsgs",pm_loaded[0].pmmsgs);
        } catch (error) {
            console.log("no msg found!");
        }
    });

    socket.on('pmmsg-send', async function (data1) {
        try {
            var receiver = data1.receiver_id.split("user")[1];

            activeusers.forEach(function(items, index){
                if(items.id == receiver){
                    socket.broadcast.to(user_sockets[index]).emit('pmmsg-send', data1);
                }
            });
        
            if(data1.sender_type == "register"){
                await Register.updateOne( 
                    { _id : data1.sender_id},
                    { $push: { pmmsgs: data1 } });

                if(data1.receiver_type == "register"){
                    await Register.updateOne( 
                        { _id : data1.receiver_id.replace("user"," ").trim()},
                        { $push: { pmmsgs: data1 } });
                }else{
                    await Gusers.updateOne( 
                        { _id : data1.receiver_id.replace("user"," ").trim()},
                        { $push: { pmmsgs: data1 } });
                }
            }else{
                await Gusers.updateOne( 
                    { _id : data1.sender_id},
                    { $push: { pmmsgs: data1 } });

                if(data1.receiver_type == "guest"){
                    await Gusers.updateOne( 
                        { _id : data1.receiver_id.replace("user"," ").trim()},
                        { $push: { pmmsgs: data1 } });
                }else{
                    await Register.updateOne( 
                        { _id : data1.receiver_id.replace("user"," ").trim()},
                        { $push: { pmmsgs: data1 } });
                }
            }

        } catch (error) {
            console.log(error);
        }
    });

    socket.on("room-file",(data)=>{

        ss(socket).on('file', function(stream, data) {
            var filename = path.basename(data.name);
            stream.pipe(fs.createWriteStream(filename));
        });        

        socket.broadcast.emit("room-file",data);

        roomdata.forEach(function(items, index){
            if(data.room == items.roomname){
             if(roomdata[index].roommsgs.length == 0){
                 roomdata[index].roommsgs[0] = data;
             }else{
                 roomdata[index].roommsgs = [...roomdata[index].roommsgs,data]
             }
            }
        });
    });

    socket.on("pmcall",(data)=>{
        activeusers.forEach((item,index)=> {
            if(item.id == data.rcallid.replace("user"," ").trim()){
                socket.broadcast.to(user_sockets[index]).emit('pmcall', data);
            }
        });
    });

    socket.on("inothercall",(data)=>{
        activeusers.forEach((item,index)=> {
            if(item.id == data.id.replace("user"," ").trim()){
                socket.broadcast.to(user_sockets[index]).emit('inothercall', data);
            }
        });
    });

    socket.on("callAccepted",(data)=>{
        activeusers.forEach((item,index)=> {
            if(item.id == data.id.replace("user"," ").trim()){
                socket.broadcast.to(user_sockets[index]).emit('callAccepted', data);
            }
        });
    });

    socket.on("callDeclined",(data)=>{
        activeusers.forEach((item,index)=> {
            if(item.id == data.id.replace("user"," ").trim()){
                socket.broadcast.to(user_sockets[index]).emit('callDeclined', data);
            }
        });
    });

    socket.on("frnd_query",async function(data){
        try {
            var receiver = data.receiver;

            activeusers.forEach(function(items, index){
                if(items.name == receiver){
                    socket.broadcast.to(user_sockets[index]).emit('frnd_query', data);
                }
            });

            if(data.status == "send"){
                await Register.updateOne( 
                    { _id : data.sender_id},
                    { $push: { frnds: data } }
                  );
    
                await Register.updateOne( 
                    { _id : data.receiver_id.replace("user"," ").trim()},
                    { $push: { frnds: data } }
                  );
            }

            if(data.status == "accepted"){
                await Register.updateOne( 
                    { _id : data.sender_id, "frnds.sender":data.receiver},
                    { $set: { "frnds.$.status": "accepted" }}
                );
    
                await Register.updateOne( 
                    { _id : data.receiver_id.trim(),"frnds.receiver":data.sender},
                    { $set: { "frnds.$.status": "accepted" } }
                  );

            }

            if(data.status == "declined"){
                if(data.receiver_id.includes("user")){
                    var result1 =await Register.updateOne( 
                        { _id : data.sender_id},
                        { $pull: { frnds: { sender_id:data.receiver_id.replace("user"," ").trim() } } }
                      );
        
                    var result2 = await Register.updateOne( 
                        { _id : data.receiver_id.replace("user"," ").trim()},
                        { $pull: { frnds: {receiver:data.sender} } }
                      );
                }else{
                    var result1 =await Register.updateOne( 
                        { _id : data.sender_id},
                        { $pull: { frnds: { sender_id:data.receiver_id.trim() } } }
                      );
        
                    var result2 = await Register.updateOne( 
                        { _id : data.receiver_id.trim()},
                        { $pull: { frnds: {receiver:data.sender} } }
                      );
                }
            }

        } catch (error) {
            console.log(error)
        }
    });

    socket.on('new-room', async function (data2) {
        try {
            const newroom = new Rooms(data2);

            await newroom.save();

            roomsname.push(data2.roomname);
            roomdata.push({
                "roomname":data2.roomname,
                "roomusers":new Array(),
                "userssockets":new Array(),
                "roommsgs":new Array(),
                "roomroles":data2.roomroles,
                "muteusers":new Array(),
                "banusers":new Array(),
                "roomactive": false
            });

            socket.emit('new-room', data2);
            socket.broadcast.emit('new-room', data2);

        } catch (error) {
            console.log(error);
        }

        socket.emit('room-users',roomdata);
        socket.broadcast.emit('room-users',roomdata);
    });

    socket.on("change-room",async (data)=>{
        var isMatch ;
        try {
            // roomdata.forEach((items,index)=> {
            //      if(items == data.nroomname){
            //         items.roomactive = true;
            //      }
            // });

            if(data.nroomname == "Main Room"){
                isMatch = true
            }else{
                var room = await Rooms.findOne({roomname:data.nroomname});
                isMatch =  await bcrypt.compare(data.roompass,room.roompass);
            }

            if(isMatch){
                var i2 = user_sockets.indexOf(socket.id);
                
                roomdata.forEach((element)=>{
                    if(element.roomname == data.nroomname){
                        element.banusers.forEach((elem)=>{
                            if(activeusers[i2].id == elem.userid.replace("user"," ").trim()){
                                isMatch = "baned";
                            }
                        })
                    }
                })

                if(isMatch == "baned"){
                    socket.emit("change-room", {"result":"baned"});
                }else{
                roomdata.forEach((items,index) => {
                    if(items.roomname == data.croomname){
                        var i = items.userssockets.indexOf(socket.id);
                        items.roomusers.splice(i, 1);
                        items.userssockets.splice(i, 1);

                        roomdata.forEach((item) => {
                            if(item.roomname == data.nroomname){
                                socket.broadcast.emit("change-room-left",{"croom":data.croomname,"nroom":data.nroomname,"user":activeusers[i2],"roomroles":item.roomroles});
                            }
                        });
                    }
                    if(items.roomname == data.nroomname){
                        var i = user_sockets.indexOf(socket.id);

                        activeusers[i].current_room = data.nroomname;
                        items.roomusers = [...items.roomusers, activeusers[i]];
                        items.userssockets = [...items.userssockets, socket.id];

                        socket.emit("change-room-load",items);
                    }
                });

                roomdata.forEach((items,index) => {
                    if(items.roomname == data.nroomname){
                        data.roles = items.roomroles;
                    }
                });

                socket.emit("change-room", {"result":"passed","data":data});
                socket.emit('room-users',roomdata);
                socket.broadcast.emit('room-users',roomdata);
            }
            }else{
                socket.emit("change-room", {"result":"failed"});
            }

        } catch (error) {
            console.log(error)
        }
    });

    socket.on('make_mod', async (data)=>{
        try {
            await Rooms.updateOne( 
                { roomname: data[1]},
                { $push: { roomroles : data[0] } }
            );

            roomdata.forEach((items,index) => {
                if(items.roomname == data[1]){
                    items.roomroles.push(data[0]);
                }
            });

            socket.emit('made_mod',data);
            socket.broadcast.emit('made_mod',data);
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('mute_user', async (data)=>{
        try {
            roomdata.forEach((items) => {
                if(items.roomname == data[1]){
                    items.muteusers.push(data[0]);
                }
            });

            socket.emit('user_muted',data);
            socket.broadcast.emit('user_muted',data);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('ban_user', async (data)=>{
        try {
            await Rooms.updateOne( 
                { roomname: data[1]},
                { $push: { banedusers : {userid:data[0].userid} } }
            );

            roomdata.forEach((items) => {
                if(items.roomname == data[1]){
                    items.banusers.push(data[0]);
                }
            });

            socket.emit('baned_user',data);
            socket.broadcast.emit('baned_user',data);
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('block_user', async (data)=>{
        try {
            // await Register.updateOne( 
            //     { roomname: data[1]},
            //     { $push: { blocks : data[0] } }
            // );

            // roomdata.forEach((items) => {
            //     if(items.roomname == data[1]){
            //         items.banedusers.push(data[0]);
            //     }
            // });

        } catch (error) {
            console.log(error)
        }
    });

    socket.on('remove_mod', async (data)=>{
        try {
            await Rooms.updateOne( 
                { roomname: data[1]},
                { $pull: { roomroles : {userid:data[0].userid} } }
            );

            roomdata.forEach((items,index1) => {
                if(items.roomname == data[1]){
                    items.roomroles.forEach((item,index)=>{
                        if(item.userid = data[0].userid){
                            roomdata[index1].roomroles.splice(index,1);
                        }
                    })
                }
            });

            socket.emit('mod_removed',data);
            socket.broadcast.emit('mod_removed',data);
            console.log(roomdata);
        } catch (error) {
            console.log(error);
        }

        console.log(roomdata[1])
    });

    socket.on('remove_mute', async (data)=>{
        try {
            roomdata.forEach((items,index1) => {
                if(items.roomname == data[1]){
                    items.muteusers.forEach((item,index)=>{
                        if(item.userid = data[0].userid){
                            roomdata[index1].muteusers.splice(index,1);
                        }
                    })
                }
            });

            socket.emit('mute_removed',data);
            socket.broadcast.emit('mute_removed',data);
            console.log(roomdata);
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('remove_ban', async (data)=>{
        try {
            await Rooms.updateOne( 
                { roomname: data[1]},
                { $pull: { banedusers : {userid:data[0].userid} } }
            );

            roomdata.forEach((items,index1) => {
                if(items.roomname == data[1]){
                    items.banusers.forEach((item,index)=>{
                        if(item.userid = data[0].userid){
                            roomdata[index1].banusers.splice(index,1);
                        }
                    })
                }
            });

            socket.emit('remove_ban',data);
            socket.broadcast.emit('remove_ban',data);
            console.log(roomdata);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('clearmsg',async (data)=>{
        try {
            roomdata.forEach((items) => {
                if(items.roomname == data.room){
                    items.roommsgs = [];
                }
            });

            socket.emit('all-msg-cleard',data);
            socket.broadcast.emit('all-msg-cleard',data);
        } catch (error) {
            console.log(error)
        }
    })

   socket.on('disconnect', function () {
      var i = user_sockets.indexOf(socket.id);

      roomdata.forEach((items,index) => {
          if(i != -1){
            if(items.roomname == activeusers[i].current_room){
                var i3 = items.userssockets.indexOf(socket.id);
                items.roomusers.splice(i3, 1);
                items.userssockets.splice(i3, 1);
              }
          }
      });
      
      socket.broadcast.emit('user-left',activeusers[i]);
      socket.broadcast.emit('room-users',roomdata);

      activeusers.splice(i, 1);
      user_sockets.splice(i, 1);

   });
});



http.listen(PORT, function() {
   console.log(`listening on : http://localhost:${PORT}`);
});
