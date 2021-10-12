var pm = new Audio("./sounds/pm-sound.mp3");
var msg1 = new Audio("./sounds/in-msg.mp3");
var frndr = new Audio("./sounds/frnd-sound.mp3");
var ringtone = new Audio("./sounds/Ringtone1.mp3");
var numbusy = new Audio("./sounds/busy.mp3");

var frnds_list = [];
var active_streams = [];
var room_roles_track = [];
var baned_users_track = [];
var mute_users_track = [];
var block_users_track = [];
var vc_users = [];
var curuser;

var t = 0;
var msg_noti = 0;
var alert_noti = 0;
var user_pms = 0;
const socket = io("http://localhost:3812/");

var ca = document.cookie
  .split(";")
  .map((cookie) => cookie.split("="))
  .reduce(
    (accumulator, [key, value]) => ({
      ...accumulator,
      [key.trim()]: decodeURIComponent(value),
    }),
    {}
  );

var token = JSON.parse(ca.chatroomjwt.substr(2, ca.chatroomjwt.length)).token;
var user_type = JSON.parse(
  ca.chatroomjwt.substr(2, ca.chatroomjwt.length)
).user_type;
var username = JSON.parse(ca.chatroomjwt.substr(2, ca.chatroomjwt.length)).name;
var this_userid;
var country;;

if(user_type == 'guest'){
  document.getElementById('changepass').style.display = 'none';
  document.getElementById('changeemail').style.display = 'none';
  document.getElementById('deleteac').style.display = 'none';
}

document.getElementById("selfdp_view").setAttribute("src", `${username}/files/profiledp.png`);
document.getElementById("myuname").innerText = username;
document.querySelector(".gvideo_wrapper1 label").innerText = username;
document.querySelector('.this_user_identity span').setAttribute("style",`background-image:url('${username}/files/profiledp.png')`)

socket.emit("new-user-joined", { token: token, user_type: user_type });

socket.on("logout", (data) => {
  logout();
});

const avatarchange = (e) => {
  var formData = new FormData();
  formData.append("name", username);
  formData.append("avatar", e.target.files[0]);

  document.getElementById("selfdp_view").setAttribute("src", e.target.files[0]);

  $.ajax({
    url: "/avatar",
    contentType: false,
    processData: false,
    type: "POST",
    data: formData,
    success: function (data) {
      console.log(data);
    },
    error: function (data) {
      document.querySelector(".notify").classList.add("active");
      document
        .querySelector(".notify")
        .setAttribute("style", "background:rgb(135, 0, 0,0.7);");
      document.getElementById("notifyType").innerText = "something went wrong!";

      setTimeout(function () {
        $(".notify").removeClass("active");
        $("#notifyType").innerText = "";
      }, 2000);
    },
  });
};

socket.on("room-users", (data) => {
  data.forEach((items, index) => {
    if (items.roomname == "Main Room") {
      document.querySelector(`.rooms #mainroom .num_of_users`).innerHTML =
        items.roomusers.length + `<i class="fas fa-user"></i>`;
    } else {
      document.querySelectorAll(".room .username").forEach((item, index) => {
        if (item.innerText == items.roomname) {
          document.querySelector(
            `#${item.parentNode.id} .num_of_users`
          ).innerHTML = items.roomusers.length + `<i class="fas fa-user"></i>`;
        }
      });
    }
  });
});

document.querySelector("#mainroom").setAttribute("style", "background:#75CAEB");

const stopload = () => {
  document.querySelector(".preloder").setAttribute("style", "display:none");
};

document.querySelector(
  ".this_user_identity"
).innerHTML = `<span></span> ${username}`;

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

var time = formatAMPM(new Date());
socket.on("refresh", (data) => {
  if (
    (data.current_room == document.querySelector(".room_name").id) ==
    "Main Room"
  ) {
    window.location.reload();
  }
});

var music_audio = document.getElementById('player');
ss(socket).on('audio-stream', function(stream, data) {
    parts = [];
    stream.on('data', function(chunk){
        parts.push(chunk);
    });
    stream.on('end', function () {
        music_audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
        music_audio.play();
    });
});


socket.on("user-joined", (data) => {
  if (data.current_room == document.querySelector(".room_name").id) {
    var room_user = document.createElement("DIV");
    if (username == data.name) {
      this_userid = data.id;
    }
    room_user.id = "user" + data.id;
    room_user.className = "user";

    document.querySelector(`.users`).appendChild(room_user);
    document
      .getElementById("user" + data.id)
      .setAttribute("onclick", "user_profile(this.id)");

    document.getElementById(
      "user" + data.id
    ).innerHTML = `<span class="uprofile" style="background-image: url(${data.name}/files/profiledp.png);"></span><p class="username">${data.name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;

    if (data.type == "guest") {
      document.getElementById("user" + data.id).classList.add("guest");
    } else {
      document.getElementById("user" + data.id).classList.add("register");
    }

    data.roomdata.roomroles.forEach((elem) => {
      if (elem.userid.replace("user", " ").trim() == this_userid) {
        if (elem.role == "admin") {
          document.getElementById(
            "user" + this_userid
          ).innerHTML = `<span class="uprofile" style="background-image: url(${elem.username}/files/profiledp.png);"></span><p class="username">${elem.username}</p><div><i class="fas fa-crown"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        } else {
          document.getElementById(
            "user" + this_userid
          ).innerHTML = `<span class="uprofile" style="background-image: url(${elem.username}/files/profiledp.png);"></span><p class="username">${elem.username}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        }
      }
      if (elem.userid.replace("user", " ").trim() == data.id) {
        if (elem.role == "admin") {
          document.getElementById(
            "user" + data.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${elem.username}/files/profiledp.png);"></span><p class="username">${elem.username}</p><div><i class="fas fa-crown"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        } else {
          document.getElementById(
            "user" + data.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${elem.username}/files/profiledp.png);"></span><p class="username">${elem.username}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        }
      }
    });

    if (data.id == this_userid) {
      block_users_track = data.blocks;
      room_roles_track = data.roomdata.roomroles;

      block_users_track.forEach((elem) => {
        console.log(elem);
        const block_div = document.createElement("DIV");

        block_div.id = "block" + elem.userid.replace("user", "");
        block_div.className = "block-wrapper";
        document.querySelector(`.blocked-container`).appendChild(block_div);
        document.getElementById(
          "block" + elem.userid.replace("user", "")
        ).innerHTML = `<div class="block ${
          elem.username
        } " id="blocked${elem.userid.replace(
          "user",
          ""
        )}" ><span style="background-image: url(${
          elem.username
        }/files/profiledp.png);"></span> <p>${
          elem.username
        }</p> <i class="fas fa-times" onclick="removeblock(event)"></i></div>`;
      });

      data.roomdata.voiceuser.forEach((elem) => {
        var voice_user = document.createElement("DIV");
        voice_user.id = "voice" + elem.userid;
        voice_user.className = "voice";

        document
          .querySelector(`#General_channel_users`)
          .appendChild(voice_user);
        document.getElementById(
          "voice" + elem.userid
        ).innerHTML = `<span style="background-image: url(${elem.name}/files/profiledp.png);"></span> ${elem.name}`;

        if (elem.name != username) {
          var newuser = document.createElement("DIV");
          newuser.id = `${elem.name}video_wrapper`;
          newuser.className = "gvideo_wrapper2";

          document.querySelector(`.gvideo_wrapper`).appendChild(newuser);
          document.getElementById(
            `${elem.name}video_wrapper`
          ).innerHTML = `<label>${elem.name}</label><span><i class="fas fa-microphone-slash"></i></span><video autoplay="true" id="${elem.name}video" class="gvideoElement2" onclick="group_zoomvideo(this.id)" ></video>`;
          curuser = elem.name;
        }
      });
    }
  }
});

socket.on("load-users", (data) => {
  data[0].forEach(function (item, index) {
    var room_user = document.createElement("DIV");
    country = data[0].country;
    room_user.id = "user" + item.id;
    room_user.className = "user";

    document.querySelector(`.users`).appendChild(room_user);

    document.getElementById(
      "user" + item.id
    ).innerHTML = `<span class="uprofile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="username">${item.name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;

    if (item.type == "guest") {
      document.getElementById("user" + item.id).classList.add("guest");
    } else {
      document.getElementById("user" + item.id).classList.add("register");
    }

    document
      .getElementById("user" + item.id)
      .setAttribute("onclick", "user_profile(this.id)");
    data[1].forEach((element) => {
      if (element.userid.replace("user", " ").trim() == item.id) {
        if (element.role == "admin") {
          document.getElementById(
            "user" + item.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${element.username}/files/profiledp.png);"></span><p class="username">${element.username}</p><div><i class="fas fa-crown"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        } else {
          document.getElementById(
            "user" + item.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${element.username}/files/profiledp.png);"></span><p class="username">${element.username}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        }
      }
    });
  });
});

socket.on("load-msgs", (data) => {
  data.forEach(function (item, index) {
    t++;
    if (item.file) {
      if (item.filetype == "video") {
        if (this_userid != item.id) {
          var message = document.createElement("DIV");
          message.id = "msg" + t;
          message.className = "chat";

          document.querySelector(`.main-chat`).appendChild(message);
          document.getElementById(
            "msg" + t
          ).innerHTML = `<span class="profile" style="background-image: url(${item.name}/files/profiledp.png);"></span>
                         <p class="chat-msg"> 
                         <span class="chat-name">${item.sender}</span>
                          <video src="" id="${item.id}" class="vid_stream_div" onclick="WatchStream(this.id,event)"></video>
                          <span class="chat-time">${item.time}</span></p>`;
          var objDiv = document.querySelector(`.main-chat`);
          objDiv.scrollTop = objDiv.scrollHeight;
        } else {
          var message = document.createElement("DIV");
          message.id = "msg" + t;
          message.className = "y-chat";

          document.querySelector(`.main-chat`).appendChild(message);
          document.getElementById(
            "msg" + t
          ).innerHTML = `<p class="y-chat-msg"> 
                          <span class="y-chat-name">you</span>
                          <video src="" class="vid_stream_div"></video>
                          <span class="y-chat-time">${time}</span>
                          </p>
                          <div class="y-profile-wrapper">
                          <span class="y-profile"></span>
                          </div>`;
          var objDiv = document.querySelector(`.main-chat`);
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      } else {
        if (this_userid != item.id) {
          const blob = new Blob([item.file], { type: item.filetype });

          var message = document.createElement("DIV");
          message.id = "msg" + t;
          message.className = "chat";

          document.querySelector(`.main-chat`).appendChild(message);
          if (item.filetype.includes("image")) {
            document.getElementById(
              "msg" + t
            ).innerHTML = `<span class="profile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><img id=file${t} class="msg-img"><span class="chat-time">${item.time}</span></p>`;
          } else if (item.filetype.includes("video")) {
            document.getElementById(
              "msg" + t
            ).innerHTML = `<span class="profile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><video id=file${t} class="msg-video"></video><span class="chat-time">${item.time}</span></p>`;
          } else if (item.filetype.includes("audio")) {
            document.getElementById(
              "msg" + t
            ).innerHTML = `<span class="profile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><audio id=file${t} class="msg-audio"></audio><span class="chat-time">${item.time}</span></p>`;
          } else {
            document.querySelector(".notify").classList.add("active");
            document
              .querySelector(".notify")
              .setAttribute("style", "background:rgb(0, 77, 0,0.7);");
            document.getElementById("notifyType").innerText =
              "this file is not supported yet!";

            setTimeout(function () {
              $(".notify").removeClass("active");
              $("#notifyType").innerText = "";
            }, 2000);
          }
          var objDiv = document.querySelector(`.main-chat`);
          objDiv.scrollTop = objDiv.scrollHeight;

          console.log(item.file, item.filetype);
          getfile(`file${t}`, blob);
        } else {
          const blob = new Blob([item.file], { type: item.filetype });

          var message = document.createElement("DIV");
          message.id = "msg" + t;
          message.className = "y-chat";

          document.querySelector(`.main-chat`).appendChild(message);
          if (item.filetype.includes("image")) {
            document.getElementById(
              "msg" + t
            ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
          } else if (item.filetype.includes("video")) {
            document.getElementById(
              "msg" + t
            ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
          } else if (item.filetype.includes("audio")) {
            document.getElementById(
              "msg" + t
            ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
          } else {
            alert("this file is not in support yet");
          }
          var objDiv = document.querySelector(`.main-chat`);
          objDiv.scrollTop = objDiv.scrollHeight;

          getfile(`file${t}`, blob);
        }
      }
    } else if (this_userid == item.id) {
      let temp = item.message.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[ind] = `<a href='${elem}' target="_blank">${elem}</a>`;
        }
      });

      item.message = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "y-chat";

      document.querySelector(`.main-chat`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${item.message}<span class="y-chat-time">${item.time}</span></p><span class="y-profile"></span>`;
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;
    } else {
      let temp = item.message.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[
            ind
          ] = `<a href='${elem}' target="_blank" style="color:black">${elem}</a>`;
        }
      });

      item.message = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "chat";

      document.querySelector(`.main-chat`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<span class="profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span>${item.message}<span class="chat-time">${item.time}</span></p>`;
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  });
});

socket.on("msg-send", (data) => {
  if (data.room == document.querySelector(".room_name").id) {
    let temp = data.message.split(" ");

    temp.forEach((elem, ind) => {
      if (elem.indexOf("http") == 0) {
        temp[
          ind
        ] = `<a href='${elem}' target="_blank" style="color:black">${elem}</a>`;
      }
    });

    data.message = temp.join(" ");

    t++;
    var message = document.createElement("DIV");
    message.id = "msg" + t;
    message.className = "chat";

    document.querySelector(`.main-chat`).appendChild(message);
    document.getElementById(
      "msg" + t
    ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span>${data.message}<span class="chat-time">${data.time}</span></p>`;
    var objDiv = document.querySelector(`.main-chat`);
    objDiv.scrollTop = objDiv.scrollHeight;
    msg1.play();
  }
});

socket.on("auto-msg-clear", (data) => {
  if (data.room == document.querySelector(".room_name").id) {
    console.log(data);
    var element1 = document.querySelectorAll(".y-chat")[0].id.split("msg")[1];
    var element2 = document.querySelectorAll(".chat")[0].id.split("msg")[1];
    if (element1 > element2) {
      document.querySelectorAll(".chat")[0].remove();
    } else {
      document.querySelectorAll(".y-chat")[0].remove();
    }
  }
});

document.querySelector(".type_msg").addEventListener("keyup", (e) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendresp();
  }
});

socket.on("user-left", (data) => {
  if (data && data.name != username) {
    if (data.current_room == document.querySelector(".room_name").id) {
      document.querySelector(`.users #user${data.id}`).remove();
    }
  }
});

socket.on("new-room", (data) => {
  t++;
  var newroom = document.createElement("DIV");
  newroom.id = "room" + t;
  newroom.className = "room";

  document.querySelector(`.rooms`).appendChild(newroom);
  document.getElementById(
    "room" + t
  ).innerHTML = `<span class="uprofile"></span><p class="username">${data.roomname}</p><div class="num_of_users">0<i class="fas fa-user"></i></div>`;
  document
    .getElementById("room" + t)
    .setAttribute("onclick", "changeroom(this.id)");
  data.roomroles.forEach((elem) => {
    if (elem.userid == this_userid) {
      document.getElementById("room" + t).click();
    }
  });
});

socket.on("change-room", (data) => {
  if (data.result == "passed") {
    document.querySelector(".room_name").id = data.data.nroomname;
    document.querySelector(
      ".room_name"
    ).innerHTML = `<span><i class='fas fa-users'></i></span>${data.data.nroomname}`;
  } else if (data.result == "baned") {
    document.querySelector(".notify").classList.add("active");
    document
      .querySelector(".notify")
      .setAttribute("style", "background:rgb(135, 0, 0,0.7);");
    document.getElementById("notifyType").innerText =
      "you are baned from this room!";

    setTimeout(function () {
      $(".notify").removeClass("active");
      $("#notifyType").innerText = "";
    }, 2000);
  } else {
    document.querySelector(".notify").classList.add("active");
    document
      .querySelector(".notify")
      .setAttribute("style", "background:rgb(135, 0, 0,0.7);");
    document.getElementById("notifyType").innerText =
      "you entered wrong password!";

    setTimeout(function () {
      $(".notify").removeClass("active");
      $("#notifyType").innerText = "";
    }, 2000);
  }
});

socket.on("change-room-left", (data) => {
  console.log(data);
  if (data.nroom == document.querySelector(".room_name").id) {
    var room_user = document.createElement("DIV");
    room_user.id = "user" + data.user.id;
    room_user.className = "user";

    // vc_users.filter((elem)=>{

    // });

    document.querySelector(`.users`).appendChild(room_user);
    document
      .getElementById("user" + data.user.id)
      .setAttribute("onclick", "user_profile(this.id)");

    data.roomroles.every(function (element) {
      if (element.userid.replace("user", "") == data.user.id) {
        if (element.role == "admin") {
          document.getElementById(
            "user" + data.user.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${data.user.name}/files/profiledp.png);"></span><p class="username">${data.user.name}</p><div><i class="fas fa-crown"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
          return false;
        } else {
          document.getElementById(
            "user" + data.user.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${data.user.name}/files/profiledp.png);"></span><p class="username">${data.user.name}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
          return false;
        }
      } else {
        document.getElementById(
          "user" + data.user.id
        ).innerHTML = `<span class="uprofile" style="background-image: url(${data.user.name}/files/profiledp.png);"></span><p class="username">${data.user.name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        return true;
      }
    });

    if (data.user.type == "guest") {
      document.getElementById("user" + data.user.id).classList.add("guest");
    } else {
      document.getElementById("user" + data.user.id).classList.add("register");
    }
  }
  if (data.croom == document.querySelector(".room_name").id) {
    document.getElementById("user" + data.user.id).remove();
  }
});

socket.on("change-room-load", (data) => {
  document.querySelectorAll(".room p").forEach((elem, ind) => {
    console.log(elem.innerText, data.roomname);
    if (elem.innerText == data.roomname) {
      elem.parentNode.setAttribute("style", "background:#75CAEB");
    } else {
      elem.parentNode.setAttribute("style", "background:transparent");
    }
  });

  document.querySelector(".users").innerHTML = ``;
  document.querySelector(".main-chat").innerHTML = `<div class="emojis"></div>`;
  document.querySelector(".persnol_chat_model").classList.remove("activepm");
  document.querySelector(".options span:nth-child(1)").click();

  room_roles_track = data.roomroles;
  baned_users_track = data.muteusers;
  mute_users_track = data.banusers;
  vc_users = data.voiceuser;

  data.roomroles.every(function (element) {
    if (element.userid.replace("user", "") == this_userid) {
      document
        .querySelector("aside ul li:nth-child(7)")
        .setAttribute("style", "display:flex");
      document
        .getElementById("actions1")
        .parentNode.setAttribute("style", "display:flex");
      document
        .getElementById("actions3")
        .parentNode.setAttribute("style", "display:flex");
      if (element.role == "admin") {
        document
          .querySelector("#roomsetting")
          .setAttribute("style", "display:flex");
        document
          .getElementById("actions5")
          .parentNode.setAttribute("style", "display:flex");
      }
      return false;
    } else {
      document
        .querySelector("aside ul li:nth-child(7)")
        .setAttribute("style", "display:none");
      document
        .querySelector("#roomsetting")
        .setAttribute("style", "display:none");
      document
        .getElementById("actions1")
        .parentNode.setAttribute("style", "display:none");
      document
        .getElementById("actions3")
        .parentNode.setAttribute("style", "display:none");
      document
        .getElementById("actions5")
        .parentNode.setAttribute("style", "display:none");
      return true;
    }
  });

  data.voiceuser.forEach((elem) => {
    var voice_user = document.createElement("DIV");
    voice_user.id = "voice" + elem.userid;
    voice_user.className = "voice";

    document.querySelector(`#General_channel_users`).appendChild(voice_user);
    document.getElementById(
      "voice" + elem.userid
    ).innerHTML = `<span style="background-image: url(${elem.name}/files/profiledp.png);"></span> ${elem.name}`;

    if (elem.name != username) {
      var newuser = document.createElement("DIV");
      newuser.id = `${elem.name}video_wrapper`;
      newuser.className = "gvideo_wrapper2";

      document.querySelector(`.gvideo_wrapper`).appendChild(newuser);
      document.getElementById(
        `${elem.name}video_wrapper`
      ).innerHTML = `<label>${elem.name}</label><span><i class="fas fa-microphone-slash"></i></span><video autoplay="true" id="${elem.name}video" class="gvideoElement2" onclick="group_zoomvideo(this.id)" ></video>`;
      curuser = elem.name;
    }
  });

  data.muteusers.every(function (elem) {
    if (elem.userid.replace("user", " ").trim() == this_userid) {
      document.querySelector(".type_msg").setAttribute("disabled", "disabled");
      return false;
    } else {
      document.querySelector(".type_msg").removeAttribute("disabled");
      return true;
    }
  });

  data.roomroles.forEach((element) => {
    if (element.userid.replace("user", " ").trim() == this_userid) {
      if (element.role == "admin") {
        data.roomroles.forEach((element) => {
          if (element.role == "admin") {
            var room_user = document.createElement("DIV");
            room_user.id = "admin" + element.userid;
            room_user.className = "roomroles-wrapper";

            document.querySelector(`.admin_cont`).appendChild(room_user);
            document.getElementById(
              "admin" + element.userid
            ).innerHTML = `<div class="roomroles" ><span style="background-image: url(${element.username}/files/profiledp.png);"></span> <p>${element.username}</p> <i class="fas fa-times"></i></div>`;
          } else {
            var room_user = document.createElement("DIV");
            room_user.id = "moderator" + element.userid;
            room_user.className = "roomroles-wrapper";

            document.querySelector(`.moderator_cont`).appendChild(room_user);
            document.getElementById(
              "moderator" + element.userid
            ).innerHTML = `<div class="roomroles" ><span style="background-image: url(${element.username}/files/profiledp.png);"></span> <p>${element.username}</p> <i class="fas fa-times" onclick="removerole(this.parentNode.parentNode.id)"></i></div>`;
          }
        });

        data.muteusers.forEach((element) => {
          var room_user = document.createElement("DIV");
          room_user.id = "mute" + element.userid;
          room_user.className = "muted-wrapper";

          document.querySelector(`#muted_list`).appendChild(room_user);
          document.getElementById(
            "mute" + element.userid
          ).innerHTML = `<div class="muted" onclick=""><span style="background-image: url(${element.username}/files/profiledp.png);"></span> <p>${element.username}</p> <i class="fas fa-times" onclick="removemute(this.parentNode.parentNode.id)"></i></div>`;
        });

        data.banusers.forEach((element) => {
          var room_user = document.createElement("DIV");
          room_user.id = "baned" + element.userid;
          room_user.className = "baned-wrapper";

          document.querySelector(`#baned_list`).appendChild(room_user);
          document.getElementById(
            "baned" + element.userid
          ).innerHTML = `<div class="baned" onclick=""><span style="background-image: url(${element.username}/files/profiledp.png);"></span> <p>${element.username}</p> <i class="fas fa-times" onclick="removeban(this.parentNode.parentNode.id)"></i></div>`;
        });
      }
    }
  });

  data.roomusers.forEach(function (item, index) {
    var room_user = document.createElement("DIV");
    country = data.country;
    room_user.id = "user" + item.id;
    room_user.className = "user";

    document.querySelector(`.users`).appendChild(room_user);
    document
      .getElementById("user" + item.id)
      .setAttribute("onclick", "user_profile(this.id)");

    data.roomroles.every(function (element) {
      if (element.userid.replace("user", " ").trim() == item.id) {
        if (element.role == "admin") {
          document.getElementById(
            "user" + item.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="username">${item.name}</p><div><i class="fas fa-crown"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
          return false;
        } else {
          document.getElementById(
            "user" + item.id
          ).innerHTML = `<span class="uprofile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="username">${item.name}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
          return false;
        }
      } else {
        document.getElementById(
          "user" + item.id
        ).innerHTML = `<span class="uprofile" style="background-image: url(${item.name}/files/profiledp.png);"></span><p class="username">${item.name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
        return true;
      }
    });

    if (item.type == "guest") {
      document.getElementById("user" + item.id).classList.add("guest");
    } else {
      document.getElementById("user" + item.id).classList.add("register");
    }
  });

  data.roommsgs.forEach(function (item, index) {
    t++;
    if (item.file) {
      if (this_userid != item.id) {
        const blob = new Blob([item.file], { type: item.filetype });

        var message = document.createElement("DIV");
        message.id = "msg" + t;
        message.className = "chat";

        document.querySelector(`.main-chat`).appendChild(message);
        if (item.filetype.includes("image")) {
          document.getElementById(
            "msg" + t
          ).innerHTML = `<span class="profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><img id=file${t} class="msg-img"><span class="chat-time">${item.time}</span></p>`;
        } else if (item.filetype.includes("video")) {
          document.getElementById(
            "msg" + t
          ).innerHTML = `<span class="profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><video id=file${t} class="msg-video"></video><span class="chat-time">${item.time}</span></p>`;
        } else if (item.filetype.includes("audio")) {
          document.getElementById(
            "msg" + t
          ).innerHTML = `<span class="profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><audio id=file${t} class="msg-audio"></audio><span class="chat-time">${item.time}</span></p>`;
        } else {
          alert("this file is not in support yet");
        }
        var objDiv = document.querySelector(`.main-chat`);
        objDiv.scrollTop = objDiv.scrollHeight;

        getfile(`file${t}`, blob);
      } else {
        const blob = new Blob([item.file], { type: item.filetype });

        var message = document.createElement("DIV");
        message.id = "msg" + t;
        message.className = "y-chat";

        document.querySelector(`.main-chat`).appendChild(message);
        if (item.filetype.includes("image")) {
          document.getElementById(
            "msg" + t
          ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
        } else if (item.filetype.includes("video")) {
          document.getElementById(
            "msg" + t
          ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
        } else if (item.filetype.includes("audio")) {
          document.getElementById(
            "msg" + t
          ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
        } else {
          alert("this file is not in support yet");
        }
        var objDiv = document.querySelector(`.main-chat`);
        objDiv.scrollTop = objDiv.scrollHeight;

        getfile(`file${t}`, blob);
      }
    } else if (this_userid == item.id) {
      let temp = item.message.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[ind] = `<a href='${elem}' target="_blank" >${elem}</a>`;
        }
      });

      item.message = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "y-chat";

      document.querySelector(`.main-chat`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${item.message}<span class="y-chat-time">${item.time}</span></p><span class="y-profile"></span>`;
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;
    } else {
      let temp = item.message.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[
            ind
          ] = `<a href='${elem}' target="_blank" style="color:black">${elem}</a>`;
        }
      });

      item.message = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "chat";

      document.querySelector(`.main-chat`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<span class="profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span>${item.message}<span class="chat-time">${item.time}</span></p>`;
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  });
});

socket.on("pmmsg-send", (data) => {
  var num_of_msgs = 1;
  if (username == data.receiver) {
    if (document.getElementById("msg" + data.sender_id)) {
      document
        .querySelector(`#msg${data.sender_id} .msg .num_of_msgs`)
        .setAttribute("style", "display:flex");
      num_of_msgs = document.querySelector(
        `#msg${data.sender_id} .msg .num_of_msgs`
      ).innerText;
      num_of_msgs++;
      document.querySelector(
        `#msg${data.sender_id} .msg .num_of_msgs`
      ).innerText = num_of_msgs;
    } else {
      msg_noti++;
      document.querySelector(".num_of_noti1").innerText = msg_noti;
      document
        .querySelector(".num_of_noti1")
        .setAttribute("style", "display:flex");
      const pm_div = document.createElement("DIV");

      pm_div.id = "msg" + data.sender_id;
      pm_div.className = "msg-wrapper";
      document.querySelector(`.msg-container`).appendChild(pm_div);
      document.getElementById(
        "msg" + data.sender_id
      ).innerHTML = `<div class="msg ${data.sender} " id="user${data.sender_id}" onclick="pmchat(this.id,this.classList,event)"><span></span> <p>${data.sender}</p> <label class="num_of_msgs">${num_of_msgs}</label> <i class="fas fa-times" onclick="deletepm(event)"></i></div>`;
    }
    if (document.querySelector(".activepm")) {
      document
        .querySelector(`#msg${data.sender_id} .msg .num_of_msgs`)
        .setAttribute("style", "display:none");
      num_of_msgs = 1;
    }
    pm.play();
  }

  if (document.querySelector(".activepm")) {
    let temp = data.message.split(" ");

    temp.forEach((elem, ind) => {
      if (elem.indexOf("http") == 0) {
        temp[
          ind
        ] = `<a href='${elem}' target="_blank" style="color:black">${elem}</a>`;
      }
    });

    data.message = temp.join(" ");

    t++;
    var message = document.createElement("DIV");
    message.id = "msg" + t;
    message.className = "chat";

    document.querySelector(`.pmchat_msg`).appendChild(message);
    document.getElementById(
      "msg" + t
    ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span>${data.message}<span class="chat-time">${data.time}</span></p>`;
    var objDiv = document.querySelector(`.pmchat_msg`);
    objDiv.scrollTop = objDiv.scrollHeight;
    msg1.play();
  }
});

socket.on("load-pmmsgs", (data) => {
  data.forEach((data, index) => {
    t++;
    if (data.receiver == document.querySelector(".pmchathead").innerText) {
      let temp = data.message.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[ind] = `<a href='${elem}' target="_blank">${elem}</a>`;
        }
      });

      data.message = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "y-chat";

      document.querySelector(`.pmchat_msg`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${data.message}<span class="y-chat-time">${data.time}</span></p><span class="y-profile"></span>`;
      var objDiv = document.querySelector(`.pmchat_msg`);
      objDiv.scrollTop = objDiv.scrollHeight;
    }
    if (document.querySelector(".pmchathead").innerText == data.sender) {
      let temp = data.message.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[
            ind
          ] = `<a href='${elem}' target="_blank" style="color:black">${elem}</a>`;
        }
      });

      data.message = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "chat";

      document.querySelector(`.pmchat_msg`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span>${data.message}<span class="chat-time">${data.time}</span></p>`;
      var objDiv = document.querySelector(`.pmchat_msg`);
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  });
});

socket.on("frnd_query", (data) => {
  if (data.status == "accepted") {
    frnds_list.push(data);
    var frnd = document.createElement("DIV");
    if (data.sender == username) {
      var frnd_id = data.receiver_id.replace("user", " ").trim();
      var name = data.receiver;

      frnd.id = "frnd" + frnd_id;
      frnd.className = "freind";

      document.querySelector(`.freinds`).appendChild(frnd);
      document.getElementById(
        "frnd" + frnd_id
      ).innerHTML = `<span class="uprofile" style="background-image: url(${name}/files/profiledp.png);"></span><p class="username">${name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
      document.getElementById("frnd" + frnd_id).classList.add("register");
      document
        .getElementById("frnd" + frnd_id)
        .setAttribute("onclick", "user_profile(this.id)");
    } else {
      var name = data.sender;

      frnd.id = "frnd" + data.sender_id;
      frnd.className = "freind";

      document.querySelector(`.freinds`).appendChild(frnd);
      document.getElementById(
        "frnd" + data.sender_id
      ).innerHTML = `<span class="uprofile" style="background-image: url(${name}/files/profiledp.png);"></span><p class="username">${name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
      document
        .getElementById("frnd" + data.sender_id)
        .classList.add("register");
      document
        .getElementById("frnd" + data.sender_id)
        .setAttribute("onclick", "user_profile(this.id)");
    }
  }

  if (data.status == "send") {
    if (document.getElementById("alert" + data.sender_id)) {
      console.log("already got a request!");
    } else {
      if (document.querySelector("#frnd" + data.sender_id)) {
        console.log("you already are frnd!");
      } else {
        frndr.play();
        alert_noti++;
        document.querySelector(".num_of_noti2").innerText = alert_noti;
        document
          .querySelector(".num_of_noti2")
          .setAttribute("style", "display:flex");

        var noti_div = document.createElement("DIV");

        noti_div.id = "alert" + data.sender_id;
        noti_div.className = "alerts";
        document.querySelector(`.notification_body`).appendChild(noti_div);
        document.getElementById(
          "alert" + data.sender_id
        ).innerHTML = `<div class="alert-warpper" ><span style="background-image: url(${data.sender}/files/profiledp.png);"></span><p>${data.sender} sent you freind request</p><span class="accept" id="${data.sender}" onclick="addfreind(this.className,event)"><i class="fas fa-check"></i></span><span class="decline" onclick="addfreind(this.className,event)"><i class="fas fa-times"></i></span></div>`;
      }
    }
  }

  if (data.status == "declined") {
    console.log(data);
    document.getElementById("frnd" + data.sender_id).remove();
    frnds_list.forEach((items, index) => {
      if (items.receiver == data.sender) {
        frnds_list.splice(index, 1);
      }
      if (items.sender == data.sender) {
        frnds_list.splice(index, 1);
      }
    });
  }
});

socket.on("load_details", (data) => {
  console.log(data);
  document.querySelector(".name").innerText = data.name;
  document.querySelector('.profile_div .head').setAttribute('style',`background: -webkit-linear-gradient(top, ${data.history.theme} 60%, #4D426D 40%);`)
  document.querySelector(
    ".type"
  ).innerHTML = `<i class="fas fa-user"></i> ${data.type}`;
  document.querySelector(".country p").innerText = data.country;
  document.querySelector(".joinat p").innerText = data.joined;
  document
    .querySelector(".dp_pic span")
    .setAttribute(
      "style",
      `background-image: url(${data.name}/files/profiledp.png)`
    );

  document.querySelector(`.friends_display`).innerHTML = ``;
  if (data.frnds) {
    document
      .querySelector(".bdiv span:nth-child(2)")
      .setAttribute("style", "display:flex");
    data.frnds.forEach((item, index) => {
      if (item.sender == data.name) {
        if (item.status == "accepted") {
          var frndp = document.createElement("DIV");
          frndp.id = "frndp" + item.receiver_id.replace("user", " ").trim();
          frndp.className = "profile_wrapper";

          document.querySelector(`.friends_display`).appendChild(frndp);
          document.getElementById(
            frndp.id
          ).innerHTML = `<span class="frnds_profile" style="background-image: url(${item.receiver}/files/profiledp.png);"><p class="frnd_name">${item.receiver}</p></span>`;
          document.getElementById(frndp.id).classList.add("register");
          document
            .getElementById(frndp.id)
            .setAttribute("onclick", "view_profilef(this.id)");
        }
      } else {
        var frndp = document.createElement("DIV");
        frndp.id = "frndp" + item.sender_id;
        frndp.className = "profile_wrapper";

        document.querySelector(`.friends_display`).appendChild(frndp);
        document.getElementById(
          frndp.id
        ).innerHTML = `<span class="frnds_profile" style="background-image: url(${item.sender}/files/profiledp.png);"><p class="frnd_name">${item.sender}</p></span>`;
        document.getElementById(frndp.id).classList.add("register");
        document
          .getElementById(frndp.id)
          .setAttribute("onclick", "view_profilef(this.id)");
      }
    });
  } else {
    document
      .querySelector(".bdiv span:nth-child(2)")
      .setAttribute("style", "display:none");
  }
});

socket.on("room-file", async (data) => {
  t++;
  if (data.filetype == "video") {
    if (data.room == document.querySelector(".room_name").id) {
      active_streams.push(data);
      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "chat";

      document.querySelector(`.main-chat`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span>
                      <p class="chat-msg"> 
                      <span class="chat-name">${data.sender}</span>
                      <video src="" id="${data.id}" class="vid_stream_div" onclick="WatchStream(this.id,event)"></video>
                      <span class="chat-time">${data.time}</span></p>`;
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  } else {
    if (data.room == document.querySelector(".room_name").id) {
      const blob = new Blob([data.file], { type: data.filetype });

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "chat";

      document.querySelector(`.main-chat`).appendChild(message);
      if (data.filetype.includes("image")) {
        document.getElementById(
          "msg" + t
        ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span><img id=file${t} class="msg-img"><span class="chat-time">${data.time}</span></p>`;
      } else if (data.filetype.includes("video")) {
        document.getElementById(
          "msg" + t
        ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span><video id=file${t} class="msg-video"></video><span class="chat-time">${data.time}</span></p>`;
      } else if (data.filetype.includes("audio")) {
        document.getElementById(
          "msg" + t
        ).innerHTML = `<span class="profile" style="background-image: url(${data.sender}/files/profiledp.png);"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span><audio id=file${t} class="msg-audio"></audio><span class="chat-time">${data.time}</span></p>`;
      } else {
        alert("this file is not in support yet");
      }
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;

      console.log(data.file, data.filetype);
      getfile(`file${t}`, blob);
    }
  }
});

function sendresp() {
  t++;
  var msg = $(".type_msg").val();

  if (document.querySelector(".activepm")) {
    var blocked = false;
    block_users_track.forEach((elem) => {
      if (elem.userid == document.querySelector(".pmchathead").id) {
        blocked = true;
      }
    });

    if (!blocked) {
      var user_chat = {
        sender: username,
        sender_id: this_userid,
        sender_type: user_type,
        receiver_type: document.querySelector(".pm_type").classList[1],
        message: msg,
        receiver: document.querySelector(".pmchathead").innerText.trim(),
        receiver_id: document.querySelector(".pmchathead").id,
        time: time,
      };

      if ($(".type_msg").val() != "") {
        socket.emit("pmmsg-send", user_chat);

        let temp = msg.split(" ");

        temp.forEach((elem, ind) => {
          if (elem.indexOf("http") == 0) {
            temp[ind] = `<a href='${elem}' target="_blank">${elem}</a>`;
          }
        });

        msg = temp.join(" ");

        var message = document.createElement("DIV");
        message.id = "msg" + t;
        message.className = "y-chat";

        document.querySelector(`.pmchat_msg`).appendChild(message);
        document.getElementById(
          "msg" + t
        ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name" >you</span>${msg}<span class="y-chat-time">${time}</span></p><span class="y-profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span>`;
        var objDiv = document.querySelector(`.pmchat_msg`);
        objDiv.scrollTop = objDiv.scrollHeight;

        document.querySelector(".type_msg").value = "";
      }
    } else {
      document.querySelector(".notify").classList.add("active");
      document
        .querySelector(".notify")
        .setAttribute("style", "background:rgb(135, 0, 0,0.7);");
      document.getElementById("notifyType").innerText =
        "you have blocked this user!";

      setTimeout(function () {
        $(".notify").removeClass("active");
        $("#notifyType").innerText = "";
      }, 2000);
    }
  } else {
    var user_chat = {
      sender: username,
      message: msg,
      id: this_userid,
      time: time,
      room: document.querySelector(".room_name").id,
    };
    if ($(".type_msg").val() != "") {
      socket.emit("msg-send", user_chat);

      socket.emit("pmmsg-send", user_chat);

      let temp = msg.split(" ");

      temp.forEach((elem, ind) => {
        if (elem.indexOf("http") == 0) {
          temp[ind] = `<a href='${elem}' target="_blank">${elem}</a>`;
        }
      });

      msg = temp.join(" ");

      var message = document.createElement("DIV");
      message.id = "msg" + t;
      message.className = "y-chat";

      document.querySelector(`.main-chat`).appendChild(message);
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name" >you</span>${msg}<span class="y-chat-time">${time}</span></p><span class="y-profile" style="background-image: url(${item.sender}/files/profiledp.png);"></span>`;
      var objDiv = document.querySelector(`.main-chat`);
      objDiv.scrollTop = objDiv.scrollHeight;

      document.querySelector(".type_msg").value = "";
    }
  }
}

// Room Related actions code

const createroom = () => {
  var rname = document.getElementById("Croomname").value;
  var rpassword = document.getElementById("Croompassword").value;

  socket.emit("new-room", {
    roomname: rname,
    roompass: rpassword,
    roomroles: [
      { role: "admin", username: username, userid: `user${this_userid}` },
    ],
  });

  document.getElementById("Croomname").value = "";
  document.getElementById("Croompassword").value = "";
  document.querySelector(".notify").classList.add("active");
  document
    .querySelector(".notify")
    .setAttribute("style", "background:rgb(0, 77, 0,0.7);");
  document.getElementById("notifyType").innerText = "your room is created!";

  setTimeout(function () {
    $(".notify").removeClass("active");
    $("#notifyType").innerText = "";
  }, 2000);
  alertclose(event);
};

const changeroom = (room) => {
  let new_room_name = document.querySelector(`#${room} p`).innerText;

  if (new_room_name != document.querySelector(".room_name").id) {
    if (new_room_name == "Main Room") {
      document.querySelector(".enter_roompass .head  span").innerHTML =
        new_room_name;
      roompass();
    } else {
      document.querySelector(".enter_roompass .head  span").innerHTML =
        new_room_name;

      document.querySelector(".alert").setAttribute("style", "display:block");
      document.querySelector(".enter_roompass").classList.add("activeb2");
      document
        .querySelector(".enter_roompass")
        .setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    }
  }
};

const roompass = () => {
  socket.emit("change-room", {
    croomname: document.querySelector(".room_name").id,
    roompass: document.getElementById("Eroompassword").value,
    nroomname: document.querySelector(".enter_roompass .head  span").innerHTML,
  });

  if (
    document.querySelector(".enter_roompass .head  span").innerText !=
    "Main Room"
  ) {
    alertclose(event);
  }
};

socket.on("load-rooms", (data) => {
  data.forEach(function (item, index) {
    t++;
    var newroom = document.createElement("DIV");
    newroom.id = "room" + t;
    newroom.className = "room";

    document.querySelector(`.rooms`).appendChild(newroom);
    document.getElementById(
      "room" + t
    ).innerHTML = `<span class="uprofile"></span><p class="username">${item}</p><div class="num_of_users">0</div>`;
    document
      .getElementById("room" + t)
      .setAttribute("onclick", "changeroom(this.id)");
  });
});

// File handeling related code

function getfile(id, files) {
  var file = files;
  var reader = new FileReader();

  reader.onload = function (e) {
    var file = document.getElementById(id);

    file.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

const selectFile = (event) => {
  t++;

  if (document.querySelector(".activepm")) {
    var user_chat = {
      sender: username,
      sender_id: this_userid,
      sender_type: user_type,
      receiver_type: document.querySelector(".pm_type").classList[1],
      file: event.target.files[0],
      receiver: document.querySelector(".pmchathead").innerText.trim(),
      receiver_id: document.querySelector(".pmchathead").id,
      time: time,
      filename: event.target.files[0].name,
      filetype: event.target.files[0].type,
    };

    socket.emit("pm-file", user_chat);

    var message = document.createElement("DIV");
    message.id = "msg" + t;
    message.className = "y-chat";

    document.querySelector(`.pmchat_msg`).appendChild(message);
    if (event.target.files[0].type.includes("image")) {
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
    } else if (event.target.files[0].type.includes("video")) {
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
    } else if (event.target.files[0].type.includes("audio")) {
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
    } else {
      alert("this file is not in support yet");
    }
    var objDiv = document.querySelector(`.pmchat_msg`);
    objDiv.scrollTop = objDiv.scrollHeight;
  } else {
    var user_chat = {
      sender: username,
      file: event.target.files[0],
      id: this_userid,
      time: time,
      room: document.querySelector(".room_name").id,
      filename: event.target.files[0].name,
      filetype: event.target.files[0].type,
    };

    var file = event.target.files[0];
    var stream = ss.createStream();

    // upload a file to the server.
    ss(socket).emit("file", stream, { name: event.target.files[0].name });
    ss.createBlobReadStream(file).pipe(stream);

    socket.emit("room-file", user_chat);

    var message = document.createElement("DIV");
    message.id = "msg" + t;
    message.className = "y-chat";

    document.querySelector(`.main-chat`).appendChild(message);
    if (event.target.files[0].type.includes("image")) {
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
    } else if (event.target.files[0].type.includes("video")) {
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
    } else if (event.target.files[0].type.includes("audio")) {
      document.getElementById(
        "msg" + t
      ).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
    } else {
      alert("this file is not in support yet");
    }
    var objDiv = document.querySelector(`.main-chat`);
    objDiv.scrollTop = objDiv.scrollHeight;

    document.querySelector(".type_msg").value = "";
  }

  getfile(`file${t}`, event.target.files[0]);
};

if (user_type == "guest") {
  document.querySelector(".addroom").setAttribute("style", "display:none");
}

let logout = () => {
  fetch("/logout", {
    method: "get",
    credentials: "include",
    redirect: "follow",
  })
    .then((res) => {
      console.log(res);
      window.location.replace("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

socket.on("load-frnds", (data) => {
  frnds_list = data.frnds;
  console.log(frnds_list);

  data.frnds.forEach((item) => {
    if (item.status == "accepted") {
      var frnd = document.createElement("DIV");
      if (item.sender == username) {
        var frnd_id = item.receiver_id.replace("action", "");
        var name = item.receiver;
      } else {
        var frnd_id = item.sender_id;
        var name = item.sender;
      }

      frnd.id = "frnd" + frnd_id;
      frnd.className = "freind";

      document.querySelector(`.freinds`).appendChild(frnd);
      document.getElementById(
        "frnd" + frnd_id
      ).innerHTML = `<span class="uprofile" style="background-image: url(${name}/files/profiledp.png);"></span><p class="username">${name}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
      document.getElementById("frnd" + frnd_id).classList.add("register");
      document
        .getElementById("frnd" + frnd_id)
        .setAttribute("onclick", "user_profile(this.id)");
    }
    if (item.status == "send") {
      console.log(item);
      if (this_userid == item.receiver_id.replace("user", " ").trim()) {
        var noti_div = document.createElement("DIV");

        noti_div.id = "alert" + item.sender_id;
        noti_div.className = "alerts";
        document.querySelector(`.notification_body`).appendChild(noti_div);
        document.getElementById(
          "alert" + item.sender_id
        ).innerHTML = `<div class="alert-warpper" ><span style="background-image: url(${item.sender}/files/profiledp.png);"></span><p>${item.sender} sent you freind request</p><span class="accept" id="${item.sender}" onclick="addfreind(this.className,event)"><i class="fas fa-check"></i></span><span class="decline" onclick="addfreind(this.className,event)"><i class="fas fa-times"></i></span></div>`;
      }
    }
  });
});

function user_profile(event) {
  var user_div = document.getElementById(event);
  var top = user_div.offsetTop;

  document.querySelector(".user-type").innerText =
    document.getElementById(event).classList[1];

  if (event.includes("frnd")) {
    document.querySelector(".addfreind").id = event.replace("frnd", "afrnd");
  } else {
    document.querySelector(".addfreind").id = event.replace("user", "afrnd");
  }

  document.querySelector(".admin_action .head").id = user_div.classList[1];
  document
    .querySelector(".user_details")
    .setAttribute("style", `display:block;top:${top + 30}px`);

  document
    .querySelector(".user_details .ud_head span")
    .setAttribute(
      "style",
      `background-image: url(${
        document.querySelector(`#${event} .username`).innerText
      }/files/profiledp.png)`
    );

  if (
    document.querySelector(".user_details .ud_head p").innerText ==
    document.querySelector(`#${event} .username`).innerText
  ) {
    close_user_profile();
  } else {
    if (event == `user${this_userid}`) {
      document
        .querySelector(".user_details .addfreind")
        .setAttribute("style", "display:none");
      document.querySelector(
        ".pm_chat"
      ).innerHTML = `<i class="far fa-edit"></i> Edit`;
      document
        .querySelector(".pm_chat")
        .setAttribute("onclick", "edit_profile()");
      document.querySelector(".user_details .ud_head p").innerText =
        document.querySelector(`#${event} .username`).innerText;
    } else {
      if (
        document.querySelector(".pm_chat").innerHTML ==
        `<i class="far fa-edit"></i> Edit`
      ) {
        document.querySelector(
          ".pm_chat"
        ).innerHTML = `<i class="fas fa-comments"></i> privatechat`;
      }
      document
        .querySelector(".user_details .addfreind")
        .setAttribute("style", "display:flex");
      document
        .querySelector(".pm_chat")
        .setAttribute("onclick", "pmchat(this.id,this.classList,event)");
      if (user_div.id.includes("frnd")) {
        document.querySelector(".pm_chat").id = user_div.id.replace(
          "frnd",
          "pmuser"
        );
      } else {
        document.querySelector(".pm_chat").id = user_div.id.replace(
          "user",
          "pmuser"
        );
      }
      document.querySelector(".pm_chat").classList = "pm_chat";
      document
        .querySelector(".pm_chat")
        .classList.add(document.querySelector(`#${event} .username`).innerText);
      document.querySelector(".pm_chat").classList.add(user_div.classList[1]);
      document.querySelector(".user_details .ud_head p").innerText =
        document.querySelector(`#${event} .username`).innerText;
    }
  }
}

function close_user_profile() {
  document.querySelector(".user_details").setAttribute("style", `display:none`);
  document.querySelector(".user_details .ud_head p").innerText = "";
}

function addfreind(opretion_type, recv_id) {
  var receiver = document.querySelector(".admin_action .head span").innerText;
  document.querySelector(".user_details").setAttribute("style", "display:none");
  document.querySelector(".user_details .ud_head p").innerText = "";

  if (opretion_type == "accept") {
    var frnd_query = {
      sender: username,
      receiver: event.target.id,
      sender_id: this_userid,
      receiver_id: event.target.parentNode.parentNode.id.replace("alert", ""),
      status: "accepted",
    };

    frnds_list.push(frnd_query);
    var frnd = document.createElement("DIV");
    frnd.id =
      "frnd" + event.target.parentNode.parentNode.id.replace("alert", "");
    frnd.className = "freind";

    document.querySelector(`.freinds`).appendChild(frnd);
    document.getElementById(
      "frnd" + event.target.parentNode.parentNode.id.replace("alert", "")
    ).innerHTML = `<span class="uprofile" style="background-image: url(${event.target.id}/files/profiledp.png);"></span><p class="username">${event.target.id}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
    document
      .getElementById(
        "frnd" + event.target.parentNode.parentNode.id.replace("alert", "")
      )
      .classList.add("register");
    document
      .getElementById(
        "frnd" + event.target.parentNode.parentNode.id.replace("alert", "")
      )
      .setAttribute("onclick", "user_profile(this.id)");
    frnds_list.push(frnd_query);
    socket.emit("frnd_query", frnd_query);
    document.getElementById(event.target.parentNode.parentNode.id).remove();
  }
  if (opretion_type == "decline") {
    var frnd_query = {
      sender: username,
      receiver: event.target.id,
      sender_id: this_userid,
      receiver_id: event.target.parentNode.parentNode.id.replace("alert", ""),
      status: "declined",
    };
    socket.emit("frnd_query", frnd_query);
    document.getElementById(event.target.parentNode.parentNode.id).remove();
  }
  if (opretion_type != "accept" && opretion_type != "decline") {
    var frnd_query = {
      sender: username,
      receiver: document
        .querySelector(".admin_action .head span")
        .innerText.trim(),
      sender_id: this_userid,
      receiver_id: recv_id.replace("frnduser", "user"),
      status: "send",
    };
    socket.emit("frnd_query", frnd_query);
    alertclose(event);
  }
}

const RemoveFreind = (id) => {
  if (id.includes("action")) {
    document.getElementById(id.replace("action", "frnd")).remove();
    var recv_id = id;
  } else {
    console.log(id);
    document.getElementById(id).remove();
    var recv_id = id.replace("frnd", "action");
  }

  const receiver = document.querySelector(".admin_action .head span").innerText;

  var frnd_query = {
    sender: username,
    receiver: receiver,
    sender_id: this_userid,
    receiver_id: recv_id,
    status: "declined",
  };

  socket.emit("frnd_query", frnd_query);
  alertclose(event);

  frnds_list.forEach((items, index) => {
    console.log(items, receiver);
    if (items.receiver == receiver) {
      frnds_list.splice(index, 1);
    }
    if (items.sender == receiver) {
      frnds_list.splice(index, 1);
    }
    console.log(frnds_list);
  });
};

function view_poption(poption) {
  if (poption == "friends") {
    document
      .querySelector(".friends_display")
      .setAttribute("style", "display:grid");
    document
      .querySelector(".profile_display")
      .setAttribute("style", "display:none");
  } else if (poption == "Profile") {
    document
      .querySelector(".friends_display")
      .setAttribute("style", "display:none");
    document
      .querySelector(".profile_display")
      .setAttribute("style", "display:block");
  } else {
    console.log(poption);
  }
}

function view_rr_opt(opt) {
  // var element = document. getElementById(elementId);
  // element. parentNode. removeChild(element);
  if (opt == "option") {
    document
      .getElementById("rset_option")
      .setAttribute("style", "display:block");
    document.getElementById("room_roles").setAttribute("style", "display:none");
    document.getElementById("muted_list").setAttribute("style", "display:none");
    document.getElementById("baned_list").setAttribute("style", "display:none");
  } else if (opt == "staff") {
    document
      .getElementById("rset_option")
      .setAttribute("style", "display:none");
    document
      .getElementById("room_roles")
      .setAttribute("style", "display:block");
    document.getElementById("muted_list").setAttribute("style", "display:none");
    document.getElementById("baned_list").setAttribute("style", "display:none");
  } else if (opt == "muted") {
    document
      .getElementById("rset_option")
      .setAttribute("style", "display:none");
    document.getElementById("room_roles").setAttribute("style", "display:none");
    document
      .getElementById("muted_list")
      .setAttribute("style", "display:block");
    document.getElementById("baned_list").setAttribute("style", "display:none");
  } else {
    document
      .getElementById("rset_option")
      .setAttribute("style", "display:none");
    document.getElementById("room_roles").setAttribute("style", "display:none");
    document.getElementById("muted_list").setAttribute("style", "display:none");
    document
      .getElementById("baned_list")
      .setAttribute("style", "display:block");
  }
}

socket.on("made_mod", (data) => {
  var room_user = document.createElement("DIV");
  room_user.id = "moderator" + data[0].userid;
  room_user.className = "roomroles-wrapper";

  document.querySelector(`.moderator_cont`).appendChild(room_user);
  document.getElementById(
    "moderator" + data[0].userid
  ).innerHTML = `<div class="roomroles" ><span style="background-image: url(${data[0].username}/files/profiledp.png);"></span> <p>${data[0].username}</p> <i class="fas fa-times" onclick="removerole(this.parentNode.parentNode.id)"></i></div>`;

  if (data[1] == document.querySelector(".room_name").id) {
    room_roles_track.push(data[0]);

    if (data[0].userid.replace("user", " ").trim() == this_userid) {
      if (document.getElementById(data[0].userid)) {
        document.getElementById(
          data[0].userid
        ).innerHTML = `<span class="uprofile" style="background-image: url(${data[0].username}/files/profiledp.png);"></span><p class="username">${data[0].username}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
      }
      document
        .querySelector("aside ul li:nth-child(7)")
        .setAttribute("style", "display:flex");
      document
        .getElementById("actions1")
        .parentNode.setAttribute("style", "display:flex");
      document
        .getElementById("actions3")
        .parentNode.setAttribute("style", "display:flex");
    } else {
      if (document.getElementById(data[0].userid)) {
        console.log(data[0].userid);
        document.getElementById(
          data[0].userid
        ).innerHTML = `<span class="uprofile" style="background-image: url(${data[0].username}/files/profiledp.png);"></span><p class="username">${data[0].username}</p><div><i class="fas fa-user-shield"></i><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
      }
    }
  }
});

socket.on("mod_removed", (data) => {
  if (data[1] == document.querySelector(".room_name").id) {
    room_roles_track.forEach((element, ind) => {
      if (element.userid == data[0].userid) {
        room_roles_track.splice(ind, 1);
      }
    });

    document.getElementById(
      data[0].userid
    ).innerHTML = `<span class="uprofile" style="background-image: url(${data[0].username}/files/profiledp.png);"></span><p class="username">${data[0].username}</p><div><img id="flag" src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
    if (document.getElementById("moderator" + data[0].userid)) {
      document.getElementById("moderator" + data[0].userid).remove();
    }
    if (data[0].userid.replace("user", " ").trim() == this_userid) {
      document
        .querySelector("aside ul li:nth-child(7)")
        .setAttribute("style", "display:none");
      document
        .getElementById("actions1")
        .parentNode.setAttribute("style", "display:none");
      document
        .getElementById("actions3")
        .parentNode.setAttribute("style", "display:none");
    }
  }
});

socket.on("user_muted", (data) => {
  mute_users_track.push(data[0]);

  if (data[0].userid.replace("user", " ").trim() == this_userid) {
    document.querySelector(".type_msg").setAttribute("disabled", "disabled");
  }

  var room_user = document.createElement("DIV");
  room_user.id = "mute" + data[0].userid;
  room_user.className = "muted-wrapper";

  document.querySelector(`#muted_list`).appendChild(room_user);
  document.getElementById(
    "mute" + data[0].userid
  ).innerHTML = `<div class="muted" onclick=""><span style="background-image: url(${data[0].username}/files/profiledp.png);"></span> <p>${data[0].username}</p> <i class="fas fa-times" onclick="removemute(this.parentNode.parentNode.id)"></i></div>`;
});

socket.on("mute_removed", (data) => {
  if (data[1] == document.querySelector(".room_name").id) {
    mute_users_track.forEach((elem, ind) => {
      if (elem.userid == data[0].userid) {
        mute_users_track.splice(ind, 1);
      }
    });

    if (document.getElementById("mute" + data[0].userid)) {
      if (data[1] == document.querySelector(".room_name").id) {
        document.getElementById("mute" + data[0].userid).remove();
      }
    }

    if (data[0].userid.replace("user", " ").trim() == this_userid) {
      document.querySelector(".type_msg").removeAttribute("disabled");
    }
  }
});

socket.on("baned_user", (data) => {
  baned_users_track.push(data[0]);

  if (data[0].userid.replace("user", " ").trim() == this_userid) {
    document.getElementById("mainroom").click();
  }

  if (data[1] == document.querySelector(".room_name").id) {
    var room_user = document.createElement("DIV");
    room_user.id = "baned" + data[0].userid;
    room_user.className = "baned-wrapper";

    document.querySelector(`#baned_list`).appendChild(room_user);
    document.getElementById(
      "baned" + data[0].userid
    ).innerHTML = `<div class="baned" onclick=""><span style="background-image: url(${data[0].username}/files/profiledp.png);"></span> <p>${data[0].username}</p> <i class="fas fa-times" onclick="removeban(this.parentNode.parentNode.id)"></i></div>`;
  }
});

socket.on("remove_ban", (data) => {
  if (data[1] == document.querySelector(".room_name").id) {
    baned_users_track.forEach((elem, ind) => {
      if (elem.userid == data[0].userid) {
        baned_users_track.splice(ind, 1);
      }
    });

    if (document.getElementById(data[0].userid)) {
      document.getElementById(data[0].userid).remove();
    }
  }
});

socket.on("remove_block", (data) => {
  block_users_track.forEach((elem, ind) => {
    if (elem.userid == data[0].userid) {
      block_users_track.splice(ind, 1);
    }
  });

  document
    .getElementById("block" + data[0].userid.replace("user", ""))
    .remove();

  document.querySelector(".notify").classList.add("active");
  document
    .querySelector(".notify")
    .setAttribute("style", "background:rgb(0, 77, 0,0.7);");
  document.getElementById("notifyType").innerText = "Action completed!";

  setTimeout(function () {
    $(".notify").removeClass("active");
    $("#notifyType").innerText = "";
  }, 2000);
});

socket.on("all-msg-cleard", (data) => {
  if (data.room == document.querySelector(".room_name").id) {
    document.querySelector(".main-chat").innerHTML = "";
  }
});

socket.on("blocked_user", (data) => {
  document.querySelector(".notify").classList.add("active");
  document
    .querySelector(".notify")
    .setAttribute("style", "background:rgb(0, 77, 0,0.7);");
  document.getElementById("notifyType").innerText = "Action completed!";

  setTimeout(function () {
    $(".notify").removeClass("active");
    $("#notifyType").innerText = "";
  }, 2000);

  block_users_track.push(data[0]);
});

socket.on("pmblock", (data) => {
  // document.querySelector(".notify").classList.add("active");
  // document.querySelector(".notify").setAttribute("style","background:rgb(0, 77, 0,0.7);")
  // document.getElementById("notifyType").innerText = data;

  // setTimeout(function(){
  //   $(".notify").removeClass("active");
  //   $("#notifyType").innerText = "";
  // },2000);

  document.querySelector(".notify").classList.add("active");
  document
    .querySelector(".notify")
    .setAttribute("style", "background:rgb(135, 0, 0,0.7);");
  document.getElementById("notifyType").innerText = data;

  setTimeout(function () {
    $(".notify").removeClass("active");
    $("#notifyType").innerText = "";
  }, 2000);
});

function pmchat(id, name, event) {
  document.querySelector(".type_msg").removeAttribute("disabled");

  var id = id.replace("pmuser", "user");
  if (typeof name == "object") {
    var receiver = name[1];
  } else {
    id = "user" + id;
    var receiver = name;
  }

  document.querySelector(
    ".persnol_chat_model"
  ).innerHTML = `     <div class="pmchathead">
                      <div class="pm_type ${
                        document.querySelector(`.users #${id}`)
                          ? document.querySelector(`.users #${id}`).classList[1]
                          : document.querySelector(
                              `.freinds #${id.replace("user", "frnd")}`
                            ).classList[1]
                      }">
                                                                                <span class="pm_profile" onclick="view_profile(event)" style="background-image: url(${receiver}/files/profiledp.png);"></span> ${receiver}
                                                                            </div>
                                                                            <div class="pm-options">
                                                                                <i class="fas fa-video" id="startvideocall" onclick="pmvideostart()"></i>
                                                                                <i class="fas fa-phone-volume" id="startaudiocall"" onclick="pmaudiostart()"></i>
                                                                                <i class="fas fa-times"onclick="closepm()"></i>
                                                                            </div>
                                                                            </div>
                                                                            <div class="pmchat_msg">
                                                                            </div>
                                                                        `;
  document.querySelector(".persnol_chat_model").classList.add("activepm");
  document.querySelector(".pmchathead").id = id;
  document.querySelector(".user_details").setAttribute("style", "display:none");
  document.querySelector(".user_details .ud_head p").innerText = "";
  socket.emit("load-pmmsgs", { id: this_userid, type: user_type });
  if (name[0] == "msg") {
    event.stopPropagation();
    document
      .querySelector(`#${event.target.id} .num_of_msgs`)
      .setAttribute("style", "display:none");
    alertclose(event);
  }
}

function closepm() {
  mute_users_track.forEach((elem) => {
    if (elem.userid.replace("user", " ").trim() == this_userid) {
      document.querySelector(".type_msg").setAttribute("disabled", "disable");
    }
  });

  document.querySelector(".persnol_chat_model").classList.remove("activepm");
}

document.querySelector("#Rhythm").addEventListener("keyup", function (e) {
  if (e.keyCode == 13) {
    getsong(document.querySelector("#Rhythm").value);
  }
});
