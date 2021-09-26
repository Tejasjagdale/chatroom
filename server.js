require("dotenv").config();
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middelware/auth");
const jwt = require("jsonwebtoken");
const ss = require("socket.io-stream");
const fs = require("fs");
const ytdl = require("ytdl-core");
const path = require("path");
var requestCountry = require("request-country");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3812;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/static"));
app.use(express.static(__dirname + "/rhythm"));
app.use(express.static(__dirname + "/images"));
app.use(express.static(__dirname + "/users"));
app.use(express.static(__dirname + "/node_modules"));
app.use(bodyParser.json());
app.use(cookieParser());

require("./db/conn");
const Register = require("./db/registers");
const Rooms = require("./db/rooms");
const Gusers = require("./db/gusers");
const { load } = require("dotenv");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var otp;
var d = new Date();

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
}

app.get("/", function (req, res) {
  if (res.chatroomjwt) {
    res.redirect(`/chatroom`);
  } else {
    res.sendFile(__dirname + "/home.html");
  }
});

// app.get('/stream/:videoId', function (req, res) {
//   try {
//     console.log(req.params.videoId)
//       youtubeStream(req.params.videoId).pipe(res);
//   } catch (exception) {
//       res.status(500).send(exception)
//   }
// });

app.get("/chatroom", auth, function (req, res) {
  res.sendFile(__dirname + "/main.html");
});

app.get("/logout", auth, async (req, res) => {
  try {
    const token = res.chatroomjwt.token;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    const user_type = res.chatroomjwt.user_type;
    res.clearCookie("chatroomjwt");

    if (user_type == "guest") {
      await Gusers.deleteOne({ _id: verifyUser._id });
    }

    await req.user.save();

    res.redirect("/");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/emailverification", function (req, res) {
  res.sendFile(__dirname + "/email_verification.html");
});

app.post("/register", async (req, res) => {
  try {
      var fs = require("fs");

      const dir = `./users/${req.body.name}`;
      const dir2 = `./users/${req.body.name}/rhythm`;
      const dir3 = `./users/${req.body.name}/files`;

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
          recursive: true,
        });
      }

      if (!fs.existsSync(dir2)) {
        fs.mkdirSync(dir2, {
          recursive: true,
        });
      }

      if (!fs.existsSync(dir3)) {
        fs.mkdirSync(dir3, {
          recursive: true,
        });
      }

      var fs = require('fs-extra');

      fs.copySync(path.resolve(__dirname,"images/profile/default_dp" +getRandomInt(1, 8) +".png"), `./users/${req.body.name}/files/profiledp.png`);

      const registeruser = new Register({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        type: "register",
        joined: getFormattedDate(d),
        country: "india",
        history: {
          profile: __dirname +`/users/${req.body.name}/files/profiledp.png`,
          display:__dirname + "/images/wallpaper/dbg" + getRandomInt(1, 20) + ".png",
        },
      });
      
      const token = await registeruser.generateAuthToken();

      res.cookie("chatroomjwt", {
        token: token,
        user_type: "register",
        name: req.body.name,
      });

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
    console.log(error);
    res.status(400).send(error);
  }
});

app.post("/everify", async (req, res) => {
  var user_code = req.body.code;

  if (user_code == otp) {
    res.send("pass");
  } else {
    res.send("fail");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await Register.findOne({
      $or: [{ name: req.body.name_email }, { email: req.body.name_email }],
    });

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    const token = await user.generateAuthToken();

    res.cookie("chatroomjwt", {
      token: token,
      user_type: "register",
      name: req.body.name_email,
    });

    if (isMatch) {
      res.send("matched");
    } else {
      res.send("invalid login details");
    }
  } catch (error) {
    res.status(400).send("some error occured");
  }
});

app.post("/glogin", async (req, res) => {
  try {
    const guestuser = new Gusers({
      name: req.body.name,
      type: "guest",
      joined: getFormattedDate(d),
      country: "india",
      history: {
        profile:
          __dirname +
          "/images/profile/default_dp" +
          getRandomInt(1, 8) +
          ".png",
        display:
          __dirname + "/images/wallpaper/dbg" + getRandomInt(1, 20) + ".png",
      },
    });

    const token = await guestuser.generateAuthToken();

    res.cookie("chatroomjwt", {
      token: token,
      user_type: "guest",
      name: req.body.name,
    });

    const guser = await guestuser.save();

    var fs = require("fs");

    const dir = `./users/${req.body.name}`;
    const dir2 = `./users/${req.body.name}/rhythm`;
    const dir3 = `./users/${req.body.name}/files`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    if (!fs.existsSync(dir2)) {
      fs.mkdirSync(dir2, {
        recursive: true,
      });
    }

    if (!fs.existsSync(dir3)) {
      fs.mkdirSync(dir3, {
        recursive: true,
      });
    }

    res.send("okay");

    console.log("1 new guest user joined");
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/rhythm", async (req, res) => {
  ytdl(req.body.link, { filter: "audioonly" }).pipe(
    fs
      .createWriteStream(`rhythm/Main Room/${req.body.title}.mp3`)
      .on("close", () => {
        res.send(req.body);
      })
  );
});

var activeusers = [];
var user_sockets = [];
var roomsname = [];
var roomdata = [];
var block = false;

async function loader() {
  try {
    var loadrooms = await Rooms.find();

    roomdata.push({
      roomname: "Main Room",
      roomusers: new Array(),
      userssockets: new Array(),
      roommsgs: new Array(),
      roomroles: [
        {
          role: "admin",
          username: "tejas",
          userid: "613a08584495eb4688ddd96d",
        },
      ],
      muteusers: new Array(),
      rhythm: new Array(),
      banusers: new Array(),
      voiceuser: new Array(),
      roomactive: false,
    });

    loadrooms.forEach((items, index) => {
      roomsname.push(items.roomname);
      roomdata.push({
        roomname: items.roomname,
        roomusers: new Array(),
        userssockets: new Array(),
        roommsgs: new Array(),
        roomroles: items.roomroles,
        muteusers: new Array(),
        rhythm: new Array(),
        banusers: items.banedusers,
        voiceuser: new Array(),
        roomactive: false,
      });
    });
  } catch (error) {
    console.log(error);
  }
}

loader();

io.on("connection", function (socket) {
  socket.on("new-user-joined", async (data) => {
    try {
      const token = data.token;
      const user_type = data.user_type;
      const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

      activeusers.forEach((element, index) => {
        if (verifyUser._id == element.id) {
          user_sockets[index] = socket;
          roomdata[0].userssockets.forEach((elem, ind) => {
            if (elem.id == verifyUser._id) {
              roomdata[0].userssockets[ind] = socket.id;
            }
          });
        }
      });

      if (user_type == "register") {
        var user = await Register.findOne({ _id: verifyUser._id });
      } else {
        var user = await Gusers.findOne({ _id: verifyUser._id });
      }

      socket.emit("load-users", [roomdata[0].roomusers, roomdata[0].roomroles]);
      socket.emit("load-rooms", roomsname);

      if (roomdata[0].roomusers.length == 0) {
        roomdata[0].roomusers[0] = {
          name: user.name,
          id: user._id,
          country: user.country,
          type: user.type,
          blocks: user.blocks,
          current_room: "Main Room",
        };
        roomdata[0].userssockets[0] = socket.id;
        roomdata[0].roomactive = true;
      } else {
        roomdata[0].roomusers = [
          ...roomdata[0].roomusers,
          {
            name: user.name,
            id: user._id,
            country: user.country,
            type: user.type,
            blocks: user.blocks,
            current_room: "Main Room",
          },
        ];
        roomdata[0].userssockets = [...roomdata[0].userssockets, socket.id];
      }
      activeusers.push({
        name: user.name,
        id: user._id,
        country: user.country,
        type: user.type,
        blocks: user.blocks,
        current_room: "Main Room",
      });

      user_sockets.push(socket.id);

      socket.emit("user-joined", {
        name: user.name,
        id: user._id,
        country: user.country,
        type: user.type,
        blocks: user.blocks,
        current_room: "Main Room",
        history: user.history,
        roomdata: roomdata[0],
      });

      socket.broadcast.emit("user-joined", {
        name: user.name,
        id: user._id,
        country: user.country,
        type: user.type,
        blocks: user.blocks,
        history: user.history,
        current_room: "Main Room",
        roomdata: roomdata[0],
      });

      socket.emit("load-msgs", roomdata[0].roommsgs);
      socket.emit("room-users", roomdata);
      socket.broadcast.emit("room-users", roomdata);

      if (user.type == "register") {
        const frnds = await Register.findOne({ _id: user._id });
        socket.emit("load-frnds", frnds);
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("room-users", (data) => {
    socket.emit("room-users", roomdata);
    socket.broadcast.emit("room-users", roomdata);
  });

  socket.on("msg-send", function (data1) {
    socket.broadcast.emit("msg-send", data1);

    roomdata.forEach(function (items, index) {
      if (data1.room == items.roomname) {
        if (roomdata[index].roommsgs.length >= 10) {
          roomdata[index].roommsgs.splice(0, 1);
          roomdata[index].roommsgs.push(data1);
          socket.emit("auto-msg-clear", data1);
          socket.broadcast.emit("auto-msg-clear", data1);
        } else {
          roomdata[index].roommsgs.push(data1);
        }
      }
    });
  });

  socket.on("load_profile", async (data) => {
    try {
      if (data.usertype == "guest") {
        if (data.id.includes("afrnd")) {
          var user = await Gusers.findOne({
            _id: data.id.replace("afrnd", ""),
          });
        } else {
          var user = await Gusers.findOne({
            _id: data.id.includes("action")
              ? data.id.replace("action", "")
              : data.id.replace("user", ""),
          });
        }
      } else {
        if (data.id.includes("afrnd")) {
          var user = await Register.findOne({
            _id: data.id.replace("afrnd", ""),
          });
        } else {
          var user = await Register.findOne({
            _id: data.id.replace("action", ""),
          });
        }
      }
      socket.emit("load_details", user);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("request_video", (data) => {
    activeusers.forEach(function (items, index) {
      if (items.id == data.rcallid) {
        socket.broadcast.to(user_sockets[index]).emit("request_video", data);
      }
    });
  });

  socket.on("load-pmmsgs", async function (data) {
    try {
      if (data.type == "register") {
        var pm_loaded = await Register.find({
          _id: data.id.replace("user", ""),
        });
      } else {
        var pm_loaded = await Gusers.find({
          _id: data.id.replace("user", ""),
        });
      }

      socket.emit("load-pmmsgs", pm_loaded[0].pmmsgs);
    } catch (error) {
      console.log("no msg found!");
    }
  });

  socket.on("pmmsg-send", async (data1) => {
    block = false;
    var receiver = data1.receiver_id.replace("user", "");
    activeusers.forEach((elem, ind) => {
      if (elem.id == receiver) {
        activeusers[ind].blocks.forEach(async function (elemt) {
          if (elemt.userid.replace("user", "") == data1.sender_id) {
            socket.emit(
              "pmblock",
              "you can't send message currently to this user!"
            );
            block = true;
          }
        });
      }
    });
    if (!block) {
      try {
        activeusers.forEach(function (items, index) {
          if (items.id == receiver) {
            socket.broadcast.to(user_sockets[index]).emit("pmmsg-send", data1);
          }
        });

        if (data1.sender_type == "register") {
          await Register.updateOne(
            { _id: data1.sender_id },
            { $push: { pmmsgs: data1 } }
          );

          if (data1.receiver_type == "register") {
            await Register.updateOne(
              { _id: data1.receiver_id.replace("user", "") },
              { $push: { pmmsgs: data1 } }
            );
          } else {
            await Gusers.updateOne(
              { _id: data1.receiver_id.replace("user", "") },
              { $push: { pmmsgs: data1 } }
            );
          }
        } else {
          await Gusers.updateOne(
            { _id: data1.sender_id },
            { $push: { pmmsgs: data1 } }
          );

          if (data1.receiver_type == "guest") {
            await Gusers.updateOne(
              { _id: data1.receiver_id.replace("user", "") },
              { $push: { pmmsgs: data1 } }
            );
          } else {
            await Register.updateOne(
              { _id: data1.receiver_id.replace("user", "") },
              { $push: { pmmsgs: data1 } }
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  socket.on("room-file", (data) => {
    ss(socket).on("file", function (stream, data) {
      var filename = path.basename(data.name);
      stream.pipe(fs.createWriteStream(filename));
    });

    socket.broadcast.emit("room-file", data);

    roomdata.forEach(function (items, index) {
      if (data.room == items.roomname) {
        if (roomdata[index].roommsgs.length == 0) {
          roomdata[index].roommsgs[0] = data;
        } else {
          roomdata[index].roommsgs = [...roomdata[index].roommsgs, data];
        }
      }
    });
  });

  socket.on("pmcall", (data) => {
    activeusers.forEach((item, index) => {
      if (item.id == data.rcallid.replace("user", "")) {
        socket.broadcast.to(user_sockets[index]).emit("pmcall", data);
      }
    });
  });

  socket.on("inothercall", (data) => {
    activeusers.forEach((item, index) => {
      if (item.id == data.id.replace("user", "")) {
        socket.broadcast.to(user_sockets[index]).emit("inothercall", data);
      }
    });
  });

  socket.on("callAccepted", (data) => {
    activeusers.forEach((item, index) => {
      if (item.id == data.id.replace("user", "")) {
        socket.broadcast.to(user_sockets[index]).emit("callAccepted", data);
      }
    });
  });

  socket.on("callDeclined", (data) => {
    activeusers.forEach((item, index) => {
      if (item.id == data.id.replace("user", "")) {
        socket.broadcast.to(user_sockets[index]).emit("callDeclined", data);
      }
    });
  });

  socket.on("frnd_query", async function (data) {
    try {
      var receiver = data.receiver;

      activeusers.forEach(function (items, index) {
        if (items.name == receiver) {
          socket.broadcast.to(user_sockets[index]).emit("frnd_query", data);
        }
      });

      if (data.status == "send") {
        await Register.updateOne(
          { _id: data.sender_id },
          { $push: { frnds: data } }
        );

        await Register.updateOne(
          { _id: data.receiver_id.replace("action", "") },
          { $push: { frnds: data } }
        );
      }

      if (data.status == "accepted") {
        await Register.updateOne(
          { _id: data.sender_id, "frnds.sender": data.receiver },
          { $set: { "frnds.$.status": "accepted" } }
        );

        await Register.updateOne(
          { _id: data.receiver_id.trim(), "frnds.receiver": data.sender },
          { $set: { "frnds.$.status": "accepted" } }
        );
      }

      if (data.status == "declined") {
        var result1 = await Register.updateOne(
          { _id: data.sender_id },
          {
            $pull: {
              frnds: { sender_id: data.receiver_id.replace("action", "") },
            },
          }
        );

        var result2 = await Register.updateOne(
          { _id: data.receiver_id.replace("action", "") },
          { $pull: { frnds: { receiver: data.sender } } }
        );

        var result3 = await Register.updateOne(
          { _id: data.sender_id },
          { $pull: { frnds: { receiver_id: data.receiver_id } } }
        );

        var result4 = await Register.updateOne(
          { _id: data.receiver_id.replace("action", "") },
          { $pull: { frnds: { sender: data.sender } } }
        );
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("new-room", async function (data2) {
    try {
      const newroom = new Rooms(data2);

      await newroom.save();

      roomsname.push(data2.roomname);
      roomdata.push({
        roomname: data2.roomname,
        roomusers: new Array(),
        userssockets: new Array(),
        roommsgs: new Array(),
        roomroles: data2.roomroles,
        muteusers: new Array(),
        rhythm: new Array(),
        banusers: new Array(),
        roomactive: false,
      });

      socket.emit("new-room", data2);
      socket.broadcast.emit("new-room", data2);
    } catch (error) {
      console.log(error);
    }

    socket.emit("room-users", roomdata);
    socket.broadcast.emit("room-users", roomdata);
  });

  socket.on("change-room", async (data) => {
    var isMatch;
    try {
      if (data.nroomname == "Main Room") {
        isMatch = true;
      } else {
        var room = await Rooms.findOne({ roomname: data.nroomname });
        isMatch = await bcrypt.compare(data.roompass, room.roompass);
      }

      if (isMatch) {
        var i2 = user_sockets.indexOf(socket.id);

        roomdata.forEach((element) => {
          if (element.roomname == data.nroomname) {
            element.banusers.forEach((elem) => {
              if (
                activeusers[i2].id == elem.userid.replace("user", " ").trim()
              ) {
                isMatch = "baned";
              }
            });
          }
        });

        if (isMatch == "baned") {
          socket.emit("change-room", { result: "baned" });
        } else {
          roomdata.forEach((items, index) => {
            if (items.roomname == data.croomname) {
              var i = items.userssockets.indexOf(socket.id);
              items.roomusers.splice(i, 1);
              items.userssockets.splice(i, 1);

              roomdata.forEach((item) => {
                if (item.roomname == data.nroomname) {
                  socket.broadcast.emit("change-room-left", {
                    croom: data.croomname,
                    nroom: data.nroomname,
                    user: activeusers[i2],
                    roomroles: item.roomroles,
                  });
                }
              });
            }
            if (items.roomname == data.nroomname) {
              var i = user_sockets.indexOf(socket.id);

              activeusers[i].current_room = data.nroomname;
              items.roomusers = [...items.roomusers, activeusers[i]];
              items.userssockets = [...items.userssockets, socket.id];

              socket.emit("change-room-load", items);
            }
          });

          roomdata.forEach((items, index) => {
            if (items.roomname == data.nroomname) {
              data.roles = items.roomroles;
            }
          });

          socket.emit("change-room", { result: "passed", data: data });
          socket.emit("room-users", roomdata);
          socket.broadcast.emit("room-users", roomdata);
        }
      } else {
        socket.emit("change-room", { result: "failed" });
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("make_mod", async (data) => {
    try {
      await Rooms.updateOne(
        { roomname: data[1] },
        { $push: { roomroles: data[0] } }
      );

      roomdata.forEach((items, index) => {
        if (items.roomname == data[1]) {
          items.roomroles.push(data[0]);
        }
      });

      socket.emit("made_mod", data);
      socket.broadcast.emit("made_mod", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("mute_user", async (data) => {
    try {
      roomdata.forEach((items) => {
        if (items.roomname == data[1]) {
          items.muteusers.push(data[0]);
        }
      });

      socket.emit("user_muted", data);
      socket.broadcast.emit("user_muted", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("ban_user", async (data) => {
    try {
      await Rooms.updateOne(
        { roomname: data[1] },
        { $push: { banedusers: { userid: data[0].userid } } }
      );

      roomdata.forEach((items) => {
        if (items.roomname == data[1]) {
          items.banusers.push(data[0]);
        }
      });

      socket.emit("baned_user", data);
      socket.broadcast.emit("baned_user", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("block_user", async (data) => {
    console.log("762", data[0]);
    try {
      if (data[0].usertype == "register") {
        await Register.updateOne(
          { _id: data[1] },
          { $push: { blocks: data[0] } }
        );
      } else {
        await Gusers.updateOne(
          { _id: data[1] },
          { $push: { blocks: data[0] } }
        );
      }

      activeusers.forEach((element, ind) => {
        if (element.id == data[0].id) {
          activeusers[ind].blocks.push(data[0]);
        }
      });
      console.log(activeusers);
      socket.emit("blocked_user", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("remove_mod", async (data) => {
    try {
      await Rooms.updateOne(
        { roomname: data[1] },
        { $pull: { roomroles: { userid: data[0].userid } } }
      );

      roomdata.forEach((items, index1) => {
        if (items.roomname == data[1]) {
          items.roomroles.forEach((item, index) => {
            if (item.userid == data[0].userid) {
              roomdata[index1].roomroles.splice(index, 1);
            }
          });
        }
      });

      socket.emit("mod_removed", data);
      socket.broadcast.emit("mod_removed", data);
    } catch (error) {
      console.log(error);
    }

    console.log(roomdata[1]);
  });

  socket.on("remove_mute", async (data) => {
    try {
      roomdata.forEach((items, index1) => {
        if (items.roomname == data[1]) {
          items.muteusers.forEach((item, index) => {
            if ((item.userid = data[0].userid)) {
              roomdata[index1].muteusers.splice(index, 1);
            }
          });
        }
      });

      socket.emit("mute_removed", data);
      socket.broadcast.emit("mute_removed", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("remove_ban", async (data) => {
    try {
      await Rooms.updateOne(
        { roomname: data[1] },
        { $pull: { banedusers: { userid: data[0].userid } } }
      );

      roomdata.forEach((items, index1) => {
        if (items.roomname == data[1]) {
          items.banusers.forEach((item, index) => {
            if ((item.userid = data[0].userid)) {
              roomdata[index1].banusers.splice(index, 1);
            }
          });
        }
      });

      socket.emit("remove_ban", data);
      socket.broadcast.emit("remove_ban", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("remove_block", async (data) => {
    console.log(data);
    try {
      if (data[0].usertype == "register") {
        await Register.updateOne(
          { _id: data[1] },
          { $pull: { blocks: { userid: data[0].userid } } }
        );
      } else {
        await Gusers.updateOne(
          { _id: data[1] },
          { $pull: { blocks: { userid: data[0].userid } } }
        );
      }

      activeusers.forEach((items, index1) => {
        if (items.id == data[1]) {
          items.blocks.forEach((item, index) => {
            if (item.userid == data[0].userid) {
              activeusers[index1].blocks.splice(index, 1);
              console.log(activeusers[index1]);
            }
          });
        }
      });

      socket.emit("remove_block", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("clearmsg", async (data) => {
    try {
      roomdata.forEach((items) => {
        if (items.roomname == data.room) {
          items.roommsgs = [];
        }
      });

      socket.emit("all-msg-cleard", data);
      socket.broadcast.emit("all-msg-cleard", data);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("join_voice", (data) => {
    var exisit = true;
    roomdata.forEach((items, ind) => {
      if (items.roomname == data.current_room) {
        delete data.current_room;
        roomdata[ind].voiceuser.forEach((elem)=>{
          if(elem.userid == data.userid){
            exisit = false;
          }
        })

        if(exisit){
          roomdata[ind].voiceuser.push(data);
        }
      }
    });

    socket.emit("new_vuser_join", data);
    socket.broadcast.emit("new_vuser_join", data);
  });

  socket.on("leave_voice", (data) => {
    roomdata.forEach((items, ind) => {
      if (items.roomname == data.current_room) {
        items.voiceuser.forEach(() => {});
      }
    });

    socket.emit("vuser_left", data);
    socket.broadcast.emit("vuser_left", data);
  });

  socket.on("group_call", (data) => {
    roomdata.forEach((item) => {
       if (item.roomname == data.current_room) {
           item.voiceuser.forEach((item1,ind)=>{
             if(ind != (item.voiceuser.length - 1)){
               console.log(item1)
               activeusers.forEach((item2,index)=>{
                 if(item2.id == item1.userid){
                   socket.broadcast.to(user_sockets[index]).emit("group_call", data);
                 }
               })
             }
           })
       }
     });
   });
 
   socket.on("callstarted", (data) => {
     console.log(data.rid)
     activeusers.forEach((item, index) => {
       if (item.id == data.rid) {
         console.log(data.rid)
         socket.broadcast.to(user_sockets[index]).emit("callstarted", data);
       }
     });
   });

  socket.on("disconnect", function () {
    var i = user_sockets.indexOf(socket.id);

    roomdata.forEach((items, index) => {
      if (i != -1) {
        if (items.roomname == activeusers[i].current_room) {
          var i3 = items.userssockets.indexOf(socket.id);
          items.roomusers.splice(i3, 1);
          items.userssockets.splice(i3, 1);
        }
      }
    });

    socket.broadcast.emit("user-left", activeusers[i]);
    socket.broadcast.emit("room-users", roomdata);

    activeusers.splice(i, 1);
    user_sockets.splice(i, 1);
  });
});

http.listen(PORT, function () {
  console.log(`listening on : http://localhost:${PORT}`);
});
