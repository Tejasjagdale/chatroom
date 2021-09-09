    var pm = new Audio('./sounds/pm-sound.mp3');
    var msg1 = new Audio('./sounds/in-msg.mp3');
    var frndr = new Audio('./sounds/frnd-sound.mp3');
    var ringtone = new Audio('./sounds/Ringtone1.mp3');
    var numbusy = new Audio('./sounds/busy.mp3');

    var frnds_list = [];
    var active_streams = [];
    var room_roles_track = [];
    var baned_users_track = [];
    var mute_users_track = [];
    var block_users_track = [];

    var t=0;
    var msg_noti = 0;
    var alert_noti = 0;
    var user_pms = 0;
    const socket = io('http://localhost:3812');
   
    var ca = document.cookie.split(';').map(cookie => cookie.split('=')).reduce((accumulator,[key,value])=>({...accumulator, [key.trim()]:decodeURIComponent(value)}),{});
    
    var token = JSON.parse(ca.jwt.substr(2,ca.jwt.length)).token;
    var user_type = JSON.parse(ca.jwt.substr(2,ca.jwt.length)).user_type;
    var username = JSON.parse(ca.jwt.substr(2,ca.jwt.length)).name;
    var this_userid;
    var country;

    socket.emit('new-user-joined',{"token":token,"user_type":user_type});

    socket.on('room-users',(data)=>{
        data.forEach((items,index)=> {
            if(items.roomname == "Main Room"){
                document.querySelector(`.rooms #mainroom .num_of_users`).innerHTML = items.roomusers.length+`<i class="fas fa-user"></i>`;
            }
            else{
                document.querySelectorAll(".room .username").forEach((item,index)=> {
                    if(item.innerText == items.roomname){
                        document.querySelector(`#${item.parentNode.id} .num_of_users`).innerHTML = items.roomusers.length+`<i class="fas fa-user"></i>`;
                    }
                });
            }
        });
    });


    document.querySelector(".this_user_identity").innerHTML = `<span></span> ${username}`;

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    var time = formatAMPM(new Date);
    socket.on("refresh",(data)=>{
        location.reload();
    })

    socket.on('user-joined',(data)=>{
        if(data.current_room == document.querySelector(".room_name").id){
            console.log("hmm")
            var room_user = document.createElement("DIV");
            if(username == data.name){
                this_userid = data.id;
            }
            room_user.id ="user"+data.id;
            room_user.className = "user";

            document.querySelector(`.users`).appendChild(room_user);
            document.getElementById("user"+data.id).setAttribute("onclick","user_profile(this.id)");

            document.getElementById("user" + data.id).innerHTML = `<span class="uprofile"></span><p class="username">${data.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`

            if(data.type == "guest"){
                document.getElementById("user" + data.id).classList.add('guest');
            }else{
                document.getElementById("user" + data.id).classList.add('register');
            }

            data.roomdata.roomroles.forEach((elem)=>{
                if(elem.userid.replace("user"," ").trim() == this_userid){
                    if(elem.role == "admin"){
                        document.getElementById("user"+this_userid).innerHTML = `<span class="uprofile"></span><p class="username">${elem.username}</p><div><i class="fas fa-crown"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                    }else{
                        document.getElementById("user"+this_userid).innerHTML = `<span class="uprofile"></span><p class="username">${elem.username}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                    }
                }
            });

            block_users_track = data.blocks;
        }
    });

    

    socket.on('load-users',(data)=>{
        data[0].forEach(function(item, index) {
        var room_user = document.createElement("DIV");
        country = data[0].country;
        room_user.id = "user" + item.id;
        room_user.className = "user";

        document.querySelector(`.users`).appendChild(room_user);
       
        document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`

        if(item.type == "guest"){
            document.getElementById("user" + item.id).classList.add('guest');
        }else{
            document.getElementById("user" + item.id).classList.add('register');
        }

        document.getElementById("user" + item.id).setAttribute("onclick", "user_profile(this.id)");
        data[1].forEach(element => {
            if(element.userid.replace("user"," ").trim() == item.id){
                if(element.role == "admin"){
                    document.getElementById("user"+item.id).innerHTML = `<span class="uprofile"></span><p class="username">${element.username}</p><div><i class="fas fa-crown"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                }else{
                    document.getElementById("user"+item.id).innerHTML = `<span class="uprofile"></span><p class="username">${element.username}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                }
            }
        });
    });
    });

    socket.on('load-msgs',(data)=>{
        data.forEach(function(item, index) {
            t++;
            if(item.file){
                if(item.filetype == "video"){
                    if(this_userid != item.id){
                        var message = document.createElement("DIV");
                        message.id = "msg"+t;
                        message.className = "chat";

                        document.querySelector(`.main-chat`).appendChild(message);
                        document.getElementById("msg"+t).innerHTML = `<span class="profile"></span>
                                                                        <p class="chat-msg"> 
                                                                        <span class="chat-name">${item.sender}</span>
                                                                        <video src="" id="${item.id}" class="vid_stream_div" onclick="WatchStream(this.id,event)"></video>
                                                                        <span class="chat-time">${item.time}</span></p>`;
                        var objDiv = document.querySelector(`.main-chat`);
                        objDiv.scrollTop = objDiv.scrollHeight;
                    }else{
                        var message = document.createElement("DIV");
                        message.id = "msg"+t;
                        message.className = "y-chat";

                        document.querySelector(`.main-chat`).appendChild(message);
                        document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> 
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
                }else{
                    if(this_userid != item.id){
                        const blob =  new Blob([item.file],{type:item.filetype});

                        var message = document.createElement("DIV");
                        message.id = "msg"+t;
                        message.className = "chat";

                        document.querySelector(`.main-chat`).appendChild(message);
                        if(item.filetype.includes("image")){
                            document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><img id=file${t} class="msg-img"><span class="chat-time">${item.time}</span></p>`;
                        }
                        else if(item.filetype.includes("video")){
                            document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><video id=file${t} class="msg-video"></video><span class="chat-time">${item.time}</span></p>`;
                        }
                        else if(item.filetype.includes("audio")){
                            document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><audio id=file${t} class="msg-audio"></audio><span class="chat-time">${item.time}</span></p>`;
                        }
                        else{
                            alert("this file is not in support yet");
                        }
                        var objDiv = document.querySelector(`.main-chat`);
                        objDiv.scrollTop = objDiv.scrollHeight;

                        console.log(item.file,item.filetype);
                        getfile(`file${t}`,blob);
                    }else{
                        const blob =  new Blob([item.file],{type:item.filetype});

                        var message = document.createElement("DIV");
                        message.id = "msg"+t;
                        message.className = "y-chat";

                        document.querySelector(`.main-chat`).appendChild(message);
                        if(item.filetype.includes("image")){
                            document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                        }
                        else if(item.filetype.includes("video")){
                            document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                        }
                        else if(item.filetype.includes("audio")){
                            document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                        }
                        else{
                            alert("this file is not in support yet");
                        }
                        var objDiv = document.querySelector(`.main-chat`);
                        objDiv.scrollTop = objDiv.scrollHeight;

                        getfile(`file${t}`,blob);
                    }
            }
            }
            else if(this_userid == item.id){
                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "y-chat";

                document.querySelector(`.main-chat`).appendChild(message);
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${item.message}<span class="y-chat-time">${item.time}</span></p><span class="y-profile"></span>`;
                var objDiv = document.querySelector(`.main-chat`);
                objDiv.scrollTop = objDiv.scrollHeight;
            }else{
            var message = document.createElement("DIV");
            message.id = "msg"+t;
            message.className = "chat";

            document.querySelector(`.main-chat`).appendChild(message);
            document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span>${item.message}<span class="chat-time">${item.time}</span></p>`;
            var objDiv = document.querySelector(`.main-chat`);
            objDiv.scrollTop = objDiv.scrollHeight;
            }
        });
    });

    socket.on('msg-send',(data)=>{
        if(data.room == document.querySelector(".room_name").id){
        t++;
        var message = document.createElement("DIV");
        message.id = "msg"+t;
        message.className = "chat";

        document.querySelector(`.main-chat`).appendChild(message);
        document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span>${data.message}<span class="chat-time">${data.time}</span></p>`;
        var objDiv = document.querySelector(`.main-chat`);
        objDiv.scrollTop = objDiv.scrollHeight;
        msg1.play();
        }
    });

    socket.on('auto-msg-clear',(data)=>{
        if(data.room == document.querySelector(".room_name").id){
            console.log(data);
            var element1 = document.querySelectorAll(".y-chat")[0].id.split("msg")[1];
            var element2 = document.querySelectorAll(".chat")[0].id.split("msg")[1];
            if(element1 > element2){
                document.querySelectorAll(".chat")[0].remove();
            }else{
                document.querySelectorAll(".y-chat")[0].remove();
            }
        }
    });

    document.querySelector('.type_msg').addEventListener("keyup", (e) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            sendresp();
        }
    });

    socket.on('user-left',(data)=>{
        if(data.current_room == document.querySelector(".room_name").id){
            document.querySelector(`.users #user${data.id}`).remove();
        }
    });

    socket.on('new-room',(data)=>{
        t++;
        var newroom = document.createElement("DIV");
        newroom.id = "room"+t;
        newroom.className = "room";

        document.querySelector(`.rooms`).appendChild(newroom);
        document.getElementById("room"+t).innerHTML = `<span class="uprofile"></span><p class="username">${data.roomname}</p><div class="num_of_users">0<i class="fas fa-user"></i></div>`;
        document.getElementById("room"+t).setAttribute("onclick","changeroom(this.id)");
        data.roomroles.forEach((elem)=>{
            if(elem.userid == this_userid){
                document.getElementById("room"+t).click();
            }
        })
    });


    socket.on("change-room",(data)=>{
        if(data.result =="passed"){
            document.querySelector(".room_name").id = data.data.nroomname;
            document.querySelector(".room_name").innerHTML = `<span><i class='fas fa-users'></i></span>${data.data.nroomname}`;
        }else if(data.result =="baned"){
            alert("you are baned from this room");
        }else{
            alert("you entered wrong password!");
        }
    });

    socket.on("change-room-left",(data)=>{
        console.log(data)
        if(data.nroom == document.querySelector(".room_name").id){
            var room_user = document.createElement("DIV");
            room_user.id = "user" + data.user.id;
            room_user.className = "user";


            document.querySelector(`.users`).appendChild(room_user);
            document.getElementById("user"+ data.user.id).setAttribute("onclick", "user_profile(this.id)");

            data.roomroles.every(function (element) {
                if(element.userid.replace("user"," ").trim() == data.user.id){
                    if(element.role == "admin"){
                        document.getElementById("user" +data.user.id).innerHTML = `<span class="uprofile"></span><p class="username">${data.user.name}</p><div><i class="fas fa-crown"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                        return false;
                    }else{
                        document.getElementById("user" +data.user.id).innerHTML = `<span class="uprofile"></span><p class="username">${data.user.name}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                        return false;
                    }
                }else{
                    document.getElementById("user" +data.user.id).innerHTML = `<span class="uprofile"></span><p class="username">${data.user.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                    return true;
                }
            });
            
            if(data.type == "guest"){
                document.getElementById("user"+data.user.id).classList.add('guest');
            }else{
                document.getElementById("user"+data.user.id).classList.add('register');
            }
        }if(data.croom == document.querySelector(".room_name").id){
            document.getElementById("user"+data.user.id).remove();
        }
    });


    socket.on("change-room-load",(data)=>{
        document.querySelector(".users").innerHTML = ``;
        document.querySelector(".main-chat").innerHTML = `<div class="emojis"></div>`;
        document.querySelector(".persnol_chat_model").classList.remove("activepm");
        document.querySelector(".options span:nth-child(1)").click();

        room_roles_track = data.roomroles;
        baned_users_track = data.muteusers;
        mute_users_track = data.banusers;

        data.roomroles.every(function (element) {
            console.log(element.userid.replace("user"," ").trim())
            console.log(this_userid);
            if(element.userid.replace("user"," ").trim() == this_userid){
                document.querySelector("aside ul li:nth-child(7)").setAttribute("style","display:flex");
                document.getElementById("actions1").parentNode.setAttribute("style","display:flex");
                document.getElementById("actions3").parentNode.setAttribute("style","display:flex");
                if(element.role == "admin"){
                    document.querySelector("#roomsetting").setAttribute("style","display:flex");
                    document.getElementById("actions5").parentNode.setAttribute("style","display:flex");
                }
                return false;
            }else{
                document.querySelector("aside ul li:nth-child(7)").setAttribute("style","display:none");
                document.querySelector("#roomsetting").setAttribute("style","display:none");
                document.getElementById("actions1").parentNode.setAttribute("style","display:none");
                document.getElementById("actions3").parentNode.setAttribute("style","display:none");
                document.getElementById("actions5").parentNode.setAttribute("style","display:none");
                return true;
            }
        });

        data.muteusers.every(function(elem){
            if(elem.userid.replace("user"," ").trim() == this_userid){
                document.querySelector(".type_msg").setAttribute("disabled","disabled");
                return false;
            }else{
                document.querySelector(".type_msg").removeAttribute("disabled");
                return true;
            }
        });

        data.roomroles.forEach(element => {
            if(element.userid.replace("user"," ").trim() == this_userid){
                if(element.role == "admin"){
                    data.roomroles.forEach(element=>{
                        if(element.role == "admin"){
                            var room_user = document.createElement("DIV");
                            room_user.id = "admin"+element.userid;
                            room_user.className = "roomroles-wrapper";

                            document.querySelector(`.admin_cont`).appendChild(room_user);
                            document.getElementById("admin"+element.userid).innerHTML = `<div class="roomroles" ><span></span> <p>${element.username}</p> <i class="fas fa-times"></i></div>`
                        }else{
                            var room_user = document.createElement("DIV");
                            room_user.id = "moderator"+element.userid;
                            room_user.className = "roomroles-wrapper";

                            document.querySelector(`.moderator_cont`).appendChild(room_user);
                            document.getElementById("moderator"+element.userid).innerHTML = `<div class="roomroles" ><span></span> <p>${element.username}</p> <i class="fas fa-times" onclick="removerole(this.parentNode.parentNode.id)"></i></div>`
                        }
                    });

                    data.muteusers.forEach(element=>{
                        var room_user = document.createElement("DIV");
                        room_user.id = "mute"+element.userid;
                        room_user.className = "muted-wrapper";

                        document.querySelector(`#muted_list`).appendChild(room_user);
                        document.getElementById("mute"+element.userid).innerHTML = `<div class="muted" onclick=""><span></span> <p>${element.username}</p> <i class="fas fa-times" onclick="removemute(this.parentNode.parentNode.id)"></i></div>`
                    });

                    data.banusers.forEach(element=>{
                        var room_user = document.createElement("DIV");
                        room_user.id = "baned"+element.userid;
                        room_user.className = "baned-wrapper";

                        document.querySelector(`#baned_list`).appendChild(room_user);
                        document.getElementById("baned"+element.userid).innerHTML = `<div class="baned" onclick=""><span></span> <p>${element.username}</p> <i class="fas fa-times" onclick="removeban(this.parentNode.parentNode.id)"></i></div>`
                    });
                }
            }
        });

        data.roomusers.forEach(function(item,index){
            var room_user = document.createElement("DIV");
            country = data.country;
            room_user.id = "user"+item.id;
            room_user.className = "user";

            document.querySelector(`.users`).appendChild(room_user);
            document.getElementById("user"+item.id).setAttribute("onclick", "user_profile(this.id)");

            data.roomroles.every(function (element) {
                if(element.userid.replace("user"," ").trim() == item.id){
                    if(element.role == "admin"){
                        document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><i class="fas fa-crown"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`
                        return false;
                    }else{
                        document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`
                        return false;
                    }
                }else{
                    document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`
                    return true;
                }
            });
            

            if(item.type == "guest"){
                document.getElementById("user" + item.id).classList.add('guest');
            }else{
                document.getElementById("user" + item.id).classList.add('register');
            }

        });

        data.roommsgs.forEach(function(item,index){
            t++;
            if(item.file){
                if(this_userid != item.id){
                    const blob =  new Blob([item.file],{type:item.filetype});

                    var message = document.createElement("DIV");
                    message.id = "msg"+t;
                    message.className = "chat";

                    document.querySelector(`.main-chat`).appendChild(message);
                    if(item.filetype.includes("image")){
                        document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><img id=file${t} class="msg-img"><span class="chat-time">${item.time}</span></p>`;
                    }
                    else if(item.filetype.includes("video")){
                        document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><video id=file${t} class="msg-video"></video><span class="chat-time">${item.time}</span></p>`;
                    }
                    else if(item.filetype.includes("audio")){
                        document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span><audio id=file${t} class="msg-audio"></audio><span class="chat-time">${item.time}</span></p>`;
                    }
                    else{
                        alert("this file is not in support yet");
                    }
                    var objDiv = document.querySelector(`.main-chat`);
                    objDiv.scrollTop = objDiv.scrollHeight;

                    getfile(`file${t}`,blob);
                }else{
                    const blob =  new Blob([item.file],{type:item.filetype});

                    var message = document.createElement("DIV");
                    message.id = "msg"+t;
                    message.className = "y-chat";

                    document.querySelector(`.main-chat`).appendChild(message);
                    if(item.filetype.includes("image")){
                        document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                    }
                    else if(item.filetype.includes("video")){
                        document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                    }
                    else if(item.filetype.includes("audio")){
                        document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                    }
                    else{
                        alert("this file is not in support yet");
                    }
                    var objDiv = document.querySelector(`.main-chat`);
                    objDiv.scrollTop = objDiv.scrollHeight;

                    getfile(`file${t}`,blob);
                }
            }
            else if(this_userid == item.id){
                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "y-chat";

                document.querySelector(`.main-chat`).appendChild(message);
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${item.message}<span class="y-chat-time">${item.time}</span></p><span class="y-profile"></span>`;
                var objDiv = document.querySelector(`.main-chat`);
                objDiv.scrollTop = objDiv.scrollHeight;
            }else{
            var message = document.createElement("DIV");
            message.id = "msg"+t;
            message.className = "chat";

            document.querySelector(`.main-chat`).appendChild(message);
            document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${item.sender}</span>${item.message}<span class="chat-time">${item.time}</span></p>`;
            var objDiv = document.querySelector(`.main-chat`);
            objDiv.scrollTop = objDiv.scrollHeight;
            }
        });
    });

    socket.on("pmmsg-send",(data)=>{
        var num_of_msgs = 1;
        if(username == data.receiver){
            if(document.getElementById("msg" + data.sender_id)){
                    document.querySelector(`#msg${data.sender_id} .msg .num_of_msgs`).setAttribute("style","display:flex");
                    num_of_msgs = document.querySelector(`#msg${data.sender_id} .msg .num_of_msgs`).innerText;
                    num_of_msgs++;
                    document.querySelector(`#msg${data.sender_id} .msg .num_of_msgs`).innerText = num_of_msgs;
                    
            }else{
                    msg_noti++;
                    document.querySelector(".num_of_noti1").innerText = msg_noti;
                    document.querySelector(".num_of_noti1").setAttribute("style","display:flex");
                    const pm_div = document.createElement("DIV");
                
                    pm_div.id = "msg" + data.sender_id;
                    pm_div.className = "msg-wrapper";
                    document.querySelector(`.msg-container`).appendChild(pm_div);
                    document.getElementById("msg" + data.sender_id).innerHTML = `<div class="msg ${data.sender} " id="user${data.sender_id}" onclick="pmchat(this.id,this.classList,event)"><span></span> <p>${data.sender}</p> <label class="num_of_msgs">${num_of_msgs}</label> <i class="fas fa-times" onclick="deletepm(event)"></i></div>`;
            }
            if(document.querySelector(".activepm")){
                document.querySelector(`#msg${data.sender_id} .msg .num_of_msgs`).setAttribute("style","display:none");
                num_of_msgs = 1;
            }
            pm.play();
        }

        if(document.querySelector(".activepm")){
            t++;
            var message = document.createElement("DIV");
            message.id = "msg"+t;
            message.className = "chat";

            document.querySelector(`.pmchat_msg`).appendChild(message);
            document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span>${data.message}<span class="chat-time">${data.time}</span></p>`;
            var objDiv = document.querySelector(`.pmchat_msg`);
            objDiv.scrollTop = objDiv.scrollHeight;
            msg1.play();
        }
    });

    socket.on("load-pmmsgs",(data)=>{
        data.forEach((data,index)=> {
        t++;
        if(data.receiver == document.querySelector(".pmchathead").innerText){
                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "y-chat";

                document.querySelector(`.pmchat_msg`).appendChild(message);
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${data.message}<span class="y-chat-time">${data.time}</span></p><span class="y-profile"></span>`;
                var objDiv = document.querySelector(`.pmchat_msg`);
                objDiv.scrollTop = objDiv.scrollHeight;
        }
        if(document.querySelector(".pmchathead").innerText == data.sender){
                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "chat";

                document.querySelector(`.pmchat_msg`).appendChild(message);
                document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span>${data.message}<span class="chat-time">${data.time}</span></p>`;
                var objDiv = document.querySelector(`.pmchat_msg`);
                objDiv.scrollTop = objDiv.scrollHeight;
            } 
        });
    });

    socket.on('frnd_query',(data)=>{
        if(data.status == "accepted"){
            frnds_list.push(data);
            var frnd = document.createElement("DIV");
            if(data.sender == username){
                var frnd_id = data.receiver_id.replace("user"," ").trim();
                var name = data.receiver;

                frnd.id = "frnd" + frnd_id;
                frnd.className = "freind";

                document.querySelector(`.freinds`).appendChild(frnd);
                document.getElementById("frnd" + frnd_id).innerHTML = `<span class="uprofile"></span><p class="username">${name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                document.getElementById("frnd" + frnd_id).classList.add('register');
                document.getElementById("frnd" + frnd_id).setAttribute("onclick", "user_profile(this.id)");
            }else{
                var name = data.sender;

                frnd.id = "frnd"+ data.sender_id;
                frnd.className = "freind";

                document.querySelector(`.freinds`).appendChild(frnd);
                document.getElementById("frnd" + data.sender_id).innerHTML = `<span class="uprofile"></span><p class="username">${name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                document.getElementById("frnd" + data.sender_id).classList.add('register');
                document.getElementById("frnd" + data.sender_id).setAttribute("onclick", "user_profile(this.id)");
            }
        }

        if(data.status == "send"){
            if(document.getElementById("alert" + data.sender_id)){
                console.log("already got a request!")
            }else{
                if(document.querySelector("#frnd"+data.sender_id)){
                    console.log("you already are frnd!")
                }else{
                    frndr.play();
                    alert_noti++;
                    document.querySelector(".num_of_noti2").innerText = alert_noti;
                    document.querySelector(".num_of_noti2").setAttribute("style","display:flex");

                    var noti_div = document.createElement("DIV");

                    noti_div.id = "alert" + data.sender_id;
                    noti_div.className = "alerts";
                    document.querySelector(`.notification_body`).appendChild(noti_div);
                    document.getElementById("alert" + data.sender_id).innerHTML = `<div class="alert-warpper" ><span></span><p>${data.sender} sent you freind request</p><span class="accept" id="${data.sender}" onclick="addfreind(this.className,event)"><i class="fas fa-check"></i></span><span class="decline" onclick="addfreind(this.className,event)"><i class="fas fa-times"></i></span></div>`;
                }
            }
        }

        if(data.status == "declined"){
            document.getElementById("frnd"+data.sender_id).remove();
            frnds_list.forEach((items,index)=> {
                if(items.receiver == data.sender){
                    frnds_list.splice(index,1);
                }
                if(items.sender == data.sender){
                    frnds_list.splice(index,1);
                }
            });
        }
    });

    socket.on("load_details",(data)=>{
        document.querySelector(".name").innerText = data.name;
        document.querySelector(".type").innerHTML = `<i class="fas fa-user"></i> ${data.type}`;
        document.querySelector(".country p").innerHTML = data.country;

        document.querySelector(`.friends_display`).innerHTML = ``;
        data.frnds.forEach((item,index)=> {
            if(item.sender == data.name){
                if(item.status == "accepted"){
                    var frndp = document.createElement("DIV");
                    frndp.id = "frndp" + item.receiver_id.replace("user"," ").trim();
                    frndp.className = "profile_wrapper";


                    document.querySelector(`.friends_display`).appendChild(frndp);
                    document.getElementById(frndp.id).innerHTML = `<span class="frnds_profile"><p class="frnd_name">${item.receiver}</p></span>`;
                    document.getElementById(frndp.id).classList.add('register');
                    document.getElementById(frndp.id).setAttribute("onclick", "view_profilef(this.id)");
                }
            }else{
                var frndp = document.createElement("DIV");
                frndp.id = "frndp" + item.sender_id;
                frndp.className = "profile_wrapper";


                document.querySelector(`.friends_display`).appendChild(frndp);
                document.getElementById(frndp.id).innerHTML = `<span class="frnds_profile"><p class="frnd_name">${item.sender}</p></span>`;
                document.getElementById(frndp.id).classList.add('register');
                document.getElementById(frndp.id).setAttribute("onclick", "view_profilef(this.id)");
            }
        });
    });

        
    socket.on("room-file",async (data)=>{
        t++;
        if(data.filetype == "video"){
            if(data.room == document.querySelector(".room_name").id){
                active_streams.push(data);
                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "chat";

                document.querySelector(`.main-chat`).appendChild(message);
                document.getElementById("msg"+t).innerHTML = `<span class="profile"></span>
                                                                <p class="chat-msg"> 
                                                                <span class="chat-name">${data.sender}</span>
                                                                <video src="" id="${data.id}" class="vid_stream_div" onclick="WatchStream(this.id,event)"></video>
                                                                <span class="chat-time">${data.time}</span></p>`;
                var objDiv = document.querySelector(`.main-chat`);
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        }else{
            if(data.room == document.querySelector(".room_name").id){
                const blob =  new Blob([data.file],{type:data.filetype});

                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "chat";

                document.querySelector(`.main-chat`).appendChild(message);
                if(data.filetype.includes("image")){
                    document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span><img id=file${t} class="msg-img"><span class="chat-time">${data.time}</span></p>`;
                }
                else if(data.filetype.includes("video")){
                    document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span><video id=file${t} class="msg-video"></video><span class="chat-time">${data.time}</span></p>`;
                }
                else if(data.filetype.includes("audio")){
                    document.getElementById("msg"+t).innerHTML = `<span class="profile"></span><p class="chat-msg"> <span class="chat-name">${data.sender}</span><audio id=file${t} class="msg-audio"></audio><span class="chat-time">${data.time}</span></p>`;
                }
                else{
                    alert("this file is not in support yet");
                }
                var objDiv = document.querySelector(`.main-chat`);
                objDiv.scrollTop = objDiv.scrollHeight;

                console.log(data.file,data.filetype);
                getfile(`file${t}`,blob);
            }
        }
    })


    function sendresp() {
        t++;
        var msg = $('.type_msg').val();

        if(document.querySelector(".activepm")){
            var blocked=false;
            block_users_track.forEach((elem)=>{
                if(elem.userid == document.querySelector(".pmchathead").id){
                    blocked = true;
                }
            });

            if(!(blocked)){
                var user_chat = {"sender": username,"sender_id":this_userid,"sender_type":user_type,"receiver_type":document.querySelector(".pm_type").classList[1],"message": msg,"receiver":document.querySelector(".pmchathead").innerText.trim(),"receiver_id":document.querySelector(".pmchathead").id,"time": time};

                if ($('.type_msg').val() != "") {
                    socket.emit("pmmsg-send",user_chat);

                    var message = document.createElement("DIV");
                    message.id = "msg"+t;
                    message.className = "y-chat";

                    document.querySelector(`.pmchat_msg`).appendChild(message);
                    document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${msg}<span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                    var objDiv = document.querySelector(`.pmchat_msg`);
                    objDiv.scrollTop = objDiv.scrollHeight;

                    document.querySelector('.type_msg').value = "";
                }
            }else{
                alert("you have blocked this user!")
            }
        }else{
            var user_chat = {"sender": username,"message": msg,"id":this_userid,"time": time,"room":document.querySelector(".room_name").id};
            if ($('.type_msg').val() != "") {
                socket.emit("msg-send",user_chat);

                var message = document.createElement("DIV");
                message.id = "msg"+t;
                message.className = "y-chat";

                document.querySelector(`.main-chat`).appendChild(message);
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span>${msg}<span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
                var objDiv = document.querySelector(`.main-chat`);
                objDiv.scrollTop = objDiv.scrollHeight;

                document.querySelector('.type_msg').value = "";
            }
        }
    }


    // Room Related actions code

    const createroom=()=>{
        var rname = document.getElementById("Croomname").value;
        var rpassword = document.getElementById("Croompassword").value;

        socket.emit("new-room",{"roomname":rname,"roompass":rpassword,"roomroles":[{"role":"admin","username":username,"userid":`user${this_userid}`}]});

        document.getElementById("Croomname").value = "";
        document.getElementById("Croompassword").value = "";
        alert("your room is created!");
        alertclose(event);
    }

    const changeroom=(room)=>{
        let new_room_name = document.querySelector(`#${room} p`).innerText;

        if(new_room_name != document.querySelector(".room_name").id){
            if(new_room_name == "Main Room"){
                document.querySelector(".enter_roompass .head  span").innerHTML = new_room_name;
                roompass();
            }else{
                document.querySelector(".enter_roompass .head  span").innerHTML = new_room_name;

                document.querySelector(".alert").setAttribute("style", "display:block");
                document.querySelector(".enter_roompass").classList.add("activeb2");
                document.querySelector(".enter_roompass").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
            }
        }
    };

    const roompass=()=>{
        socket.emit("change-room",{"croomname":document.querySelector(".room_name").id,"roompass":document.getElementById("Eroompassword").value,"nroomname":document.querySelector(".enter_roompass .head  span").innerHTML});

        if(document.querySelector(".enter_roompass .head  span").innerText != "Main Room"){
            alertclose(event);
        }
    };

    socket.on("load-rooms",(data)=>{
        data.forEach(function(item, index) {
            t++;
            var newroom = document.createElement("DIV");
            newroom.id = "room"+t;
            newroom.className = "room";

            document.querySelector(`.rooms`).appendChild(newroom);
            document.getElementById("room"+t).innerHTML = `<span class="uprofile"></span><p class="username">${item}</p><div class="num_of_users">0</div>`;
            document.getElementById("room"+t).setAttribute("onclick","changeroom(this.id)");
        });
    });


    // File handeling related code


    function getfile(id,files) {

        var file = files;
        var reader  = new FileReader();
      
        reader.onload = function(e)  {
            var file = document.getElementById(id);
            
            file.src = e.target.result;
         }

         reader.readAsDataURL(file);
     }
         
    
    
     const selectFile=(event)=>{
        t++;

        if(document.querySelector(".activepm")){
            var user_chat = {
                             "sender": username,
                             "sender_id":this_userid,
                             "sender_type":user_type,
                             "receiver_type":document.querySelector(".pm_type").classList[1],
                             "file": event.target.files[0],
                             "receiver":document.querySelector(".pmchathead").innerText.trim(),
                             "receiver_id":document.querySelector(".pmchathead").id,
                             "time": time,
                             "filename":event.target.files[0].name,
                             "filetype":event.target.files[0].type
                            };

            socket.emit("pm-file",user_chat);

            var message = document.createElement("DIV");
            message.id = "msg"+t;
            message.className = "y-chat";

            document.querySelector(`.pmchat_msg`).appendChild(message);
            if(event.target.files[0].type.includes("image")){
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
            }
            else if(event.target.files[0].type.includes("video")){
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
            }
            else if(event.target.files[0].type.includes("audio")){
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
            }
            else{
                alert("this file is not in support yet")
            }
            var objDiv = document.querySelector(`.pmchat_msg`);
            objDiv.scrollTop = objDiv.scrollHeight;


        }else{
            var user_chat = {
                             "sender": username,
                             "file": event.target.files[0],
                             "id":this_userid,
                             "time": time,
                             "room":document.querySelector(".room_name").id,
                             "filename":event.target.files[0].name,
                             "filetype":event.target.files[0].type
                            };

            var file = event.target.files[0];
            var stream = ss.createStream();
                        
            // upload a file to the server.
            ss(socket).emit('file', stream, {name:event.target.files[0].name});
            ss.createBlobReadStream(file).pipe(stream);
           
            socket.emit("room-file",user_chat);

            var message = document.createElement("DIV");
            message.id = "msg"+t;
            message.className = "y-chat";

            document.querySelector(`.main-chat`).appendChild(message);
            if(event.target.files[0].type.includes("image")){
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><img id=file${t} class="msg-img"><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
            }
            else if(event.target.files[0].type.includes("video")){
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><video id=file${t} class="msg-video" controls></video><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
            }
            else if(event.target.files[0].type.includes("audio")){
                document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> <span class="y-chat-name">you</span><audio id=file${t} class="msg-audio" controls></audio><span class="y-chat-time">${time}</span></p><span class="y-profile"></span>`;
            }
            else{
                alert("this file is not in support yet");
            }
            var objDiv = document.querySelector(`.main-chat`);
            objDiv.scrollTop = objDiv.scrollHeight;

            document.querySelector('.type_msg').value = "";
        }

        getfile(`file${t}`,event.target.files[0]);
    }
    

    if (user_type == "guest") {
            document.querySelector(".addroom").setAttribute("style", "display:none");
    }
   
    let logout = () => {

        fetch('/logout', {
        method: 'get',
        credentials: 'include', 
        redirect: "follow"
        }).then(res => {
        console.log(res);
        window.location.replace("/");
        }).catch(err => {
        console.log(err);
        });
    }

    socket.on("load-frnds",(data)=>{
        frnds_list =  data.frnds
         
        data.frnds.forEach((item)=>{
            if(item.status == "accepted"){
                var frnd = document.createElement("DIV");
                if(item.sender == username){
                    var frnd_id = item.receiver_id.replace("user"," ").trim();
                    var name = item.receiver;
                }else{
                    var frnd_id = item.sender_id;
                    var name = item.sender;
                }

                frnd.id = "frnd" + frnd_id;
                frnd.className = "freind";

                document.querySelector(`.freinds`).appendChild(frnd);
                document.getElementById("frnd" + frnd_id).innerHTML = `<span class="uprofile"></span><p class="username">${name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                document.getElementById("frnd" + frnd_id).classList.add('register');
                document.getElementById("frnd" + frnd_id).setAttribute("onclick", "user_profile(this.id)");
            }
            if(item.status == "send"){
                console.log(item)
                if(this_userid == item.receiver_id.replace("user"," ").trim()){
                    var noti_div = document.createElement("DIV");

                    noti_div.id = "alert" + item.sender_id;
                    noti_div.className = "alerts";
                    document.querySelector(`.notification_body`).appendChild(noti_div);
                    document.getElementById("alert" + item.sender_id).innerHTML = `<div class="alert-warpper" ><span></span><p>${item.sender} sent you freind request</p><span class="accept" id="${item.sender}" onclick="addfreind(this.className,event)"><i class="fas fa-check"></i></span><span class="decline" onclick="addfreind(this.className,event)"><i class="fas fa-times"></i></span></div>`;
                }
            }
        });
    });


    function user_profile(event) {
        var user_div = document.getElementById(event);
        var top = user_div.offsetTop;

        document.querySelector(".admin_action .head").id = user_div.classList[1];

        document.querySelector(".user_details").setAttribute("style", `display:block;top:${top+30}px`);
        
        if (document.querySelector(".user_details .ud_head p").innerText == document.querySelector(`#${event} .username`).innerText) {
            close_user_profile();
        }
        else {
            if (event == `user${this_userid}`) {
                document.querySelector(".user_details .addfreind").setAttribute("style", "display:none");
                document.querySelector(".pm_chat").innerHTML = `<i class="far fa-edit"></i> Edit`;
                document.querySelector(".pm_chat").setAttribute("onclick","edit_profile()");
                document.querySelector(".user_details .ud_head p").innerText = document.querySelector(`#${event} .username`).innerText;
            } 
            else {
                
                if (document.querySelector(".pm_chat").innerHTML == `<i class="far fa-edit"></i> Edit`) {
                    document.querySelector(".pm_chat").innerHTML = `<i class="fas fa-comments"></i> privatechat`;
                }
                document.querySelector(".user_details .addfreind").setAttribute("style", "display:flex");
                document.querySelector(".pm_chat").setAttribute("onclick","pmchat(this.id,this.classList,event)")
                document.querySelector(".pm_chat").id = user_div.id.replace("user","pmuser");
                document.querySelector(".pm_chat").classList = "pm_chat";
                document.querySelector(".pm_chat").classList.add(document.querySelector(`#${event} .username`).innerText);
                document.querySelector(".pm_chat").classList.add(user_div.classList[1]);
                document.querySelector(".user_details .ud_head p").innerText = document.querySelector(`#${event} .username`).innerText;
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
                "sender":username,
                "receiver": event.target.id,
                "sender_id":this_userid,
                "receiver_id": event.target.parentNode.parentNode.id.replace("alert"," "),
                "status":"accepted",
            }

            frnds_list.push(frnd_query);
            var frnd = document.createElement("DIV");
            frnd.id = "frnd" + event.target.parentNode.parentNode.id.replace("alert"," ").trim();
            frnd.className = "freind";

            document.querySelector(`.freinds`).appendChild(frnd);
            document.getElementById("frnd" + event.target.parentNode.parentNode.id.replace("alert"," ").trim()).innerHTML = `<span class="uprofile" ></span><p class="username">${event.target.id}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
            document.getElementById("frnd" + event.target.parentNode.parentNode.id.replace("alert"," ").trim()).classList.add('register');
            document.getElementById("frnd" + event.target.parentNode.parentNode.id.replace("alert"," ").trim()).setAttribute("onclick", "user_profile(this.id)");
            frnds_list.push(frnd_query);
            socket.emit("frnd_query",frnd_query);
            document.getElementById(event.target.parentNode.parentNode.id).remove();
        } if (opretion_type == "decline") {
            var frnd_query = {
                "sender":username,
                "receiver": event.target.id,
                "sender_id":this_userid,
                "receiver_id": event.target.parentNode.parentNode.id.replace("alert"," "),
                "status":"declined",
            }
            socket.emit("frnd_query",frnd_query);
            document.getElementById(event.target.parentNode.parentNode.id).remove();

        } if (opretion_type != "accept" && opretion_type != "decline") {

            var frnd_query = {
                "sender":username,
                "receiver": document.querySelector(".admin_action .head span").innerText.trim(),
                "sender_id":this_userid,
                "receiver_id": recv_id.replace("frnduser","user"),
                "status":"send",
            }
            socket.emit("frnd_query",frnd_query);
            alertclose(event);
        }
    }

    const RemoveFreind=(id)=>{
        if(id.includes("user")){
            document.getElementById(id.replace("user","frnd")).remove();
            var recv_id=  id;
        }else{
            document.getElementById(id).remove();
            var recv_id =  id
        }

        const receiver = document.querySelector(".admin_action .head span").innerText;

        var frnd_query = {
                "sender":username,
                "receiver": receiver,
                "sender_id":this_userid,
                "receiver_id": recv_id,
                "status":"declined",
            }
        console.log(frnd_query)
        socket.emit("frnd_query",frnd_query);
        alertclose(event);

        frnds_list.forEach((items,index)=> {
            if(items.receiver == receiver){
                frnds_list.splice(index,1);
            }
            if(items.sender == receiver){
                frnds_list.splice(index,1);
            }
        });
    }

    function view_poption(poption) {
        if(poption == "friends"){
            document.querySelector(".friends_display").setAttribute("style","display:grid");
            document.querySelector(".profile_display").setAttribute("style","display:none");
        }else if(poption == "Profile"){
            document.querySelector(".friends_display").setAttribute("style","display:none");
            document.querySelector(".profile_display").setAttribute("style","display:block");
        }else{
            console.log(poption);
        }
    }

    function view_rr_opt(opt) {
        // var element = document. getElementById(elementId);
        // element. parentNode. removeChild(element);
        if(opt == "option"){
            document.getElementById("rset_option").setAttribute("style","display:block");
            document.getElementById("room_roles").setAttribute("style","display:none");
            document.getElementById("muted_list").setAttribute("style","display:none");
            document.getElementById("baned_list").setAttribute("style","display:none");
        }else if(opt == "staff"){
            document.getElementById("rset_option").setAttribute("style","display:none");
            document.getElementById("room_roles").setAttribute("style","display:block");
            document.getElementById("muted_list").setAttribute("style","display:none");
            document.getElementById("baned_list").setAttribute("style","display:none");
        }else if(opt == "muted"){
            document.getElementById("rset_option").setAttribute("style","display:none");
            document.getElementById("room_roles").setAttribute("style","display:none");
            document.getElementById("muted_list").setAttribute("style","display:block");
            document.getElementById("baned_list").setAttribute("style","display:none");
        }else{
            document.getElementById("rset_option").setAttribute("style","display:none");
            document.getElementById("room_roles").setAttribute("style","display:none");
            document.getElementById("muted_list").setAttribute("style","display:none");
            document.getElementById("baned_list").setAttribute("style","display:block");
        }
    }

    socket.on('made_mod',(data)=>{
        var room_user = document.createElement("DIV");
        room_user.id = "moderator"+data[0].userid;
        room_user.className = "roomroles-wrapper";

        document.querySelector(`.moderator_cont`).appendChild(room_user);
        document.getElementById("moderator"+data[0].userid).innerHTML = `<div class="roomroles" ><span></span> <p>${data[0].username}</p> <i class="fas fa-times" onclick="removerole(this.parentNode.parentNode.id)"></i></div>`

        if(data[1] == document.querySelector(".room_name").id){
            room_roles_track.push(data[0]);

            if(data[0].userid.replace("user"," ").trim() == this_userid){
                if(document.getElementById(data[0].userid)){
                    document.getElementById(data[0].userid).innerHTML = `<span class="uprofile"></span><p class="username">${data[0].username}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                }
                document.querySelector("aside ul li:nth-child(7)").setAttribute("style","display:flex");
                document.getElementById("actions1").parentNode.setAttribute("style","display:flex");
                document.getElementById("actions3").parentNode.setAttribute("style","display:flex");

            }else{
                if(document.getElementById(data[0].userid)){
                    console.log(data[0].userid);
                    document.getElementById(data[0].userid).innerHTML = `<span class="uprofile"></span><p class="username">${data[0].username}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
                }
            }
        }
    });

    socket.on('mod_removed',(data)=>{
        if(data[1] == document.querySelector(".room_name").id){
            room_roles_track.forEach((element,ind) => {
                if(element.userid == data[0].userid){
                    room_roles_track.splice(ind,1)
                }
            });

            document.getElementById(data[0].userid).innerHTML = `<span class="uprofile"></span><p class="username">${data[0].username}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
            if(document.getElementById("moderator"+data[0].userid)){
                document.getElementById("moderator"+data[0].userid).remove();
            }
            if(data[0].userid.replace("user"," ").trim() == this_userid){
                document.querySelector("aside ul li:nth-child(7)").setAttribute("style","display:none");
                document.getElementById("actions1").parentNode.setAttribute("style","display:none");
                document.getElementById("actions3").parentNode.setAttribute("style","display:none");
            }
        }
    });

    socket.on('user_muted',(data)=>{
        mute_users_track.push(data[0])

        if(data[0].userid.replace("user"," ").trim() == this_userid){
            document.querySelector(".type_msg").setAttribute("disabled","disabled");
        }

        var room_user = document.createElement("DIV");
        room_user.id = "mute"+data[0].userid;
        room_user.className = "muted-wrapper";

        document.querySelector(`#muted_list`).appendChild(room_user);
        document.getElementById("mute"+data[0].userid).innerHTML = `<div class="muted" onclick=""><span></span> <p>${data[0].username}</p> <i class="fas fa-times" onclick="removemute(this.parentNode.parentNode.id)"></i></div>`
    });

    socket.on('mute_removed',(data)=>{
        if(data[1] == document.querySelector(".room_name").id){
            mute_users_track.forEach((elem,ind)=>{
                if(elem.userid == data[0].userid){
                    mute_users_track.splice(ind,1);
                }
            })

            if(document.getElementById("mute"+data[0].userid)){
                if(data[1] == document.querySelector(".room_name").id){
                    document.getElementById("mute"+data[0].userid).remove();
                }
            }
    
            if(data[0].userid.replace("user"," ").trim() == this_userid){
                document.querySelector(".type_msg").removeAttribute("disabled")
            }
        }
    });

    socket.on('baned_user',(data)=>{
        baned_users_track.push(data[0]);

        if(data[0].userid.replace("user"," ").trim() == this_userid){
            document.getElementById("mainroom").click()
        }

        if(data[1] == document.querySelector(".room_name").id){
            var room_user = document.createElement("DIV");
            room_user.id = "baned"+data[0].userid;
            room_user.className = "baned-wrapper";

            document.querySelector(`#baned_list`).appendChild(room_user);
            document.getElementById("baned"+data[0].userid).innerHTML = `<div class="baned" onclick=""><span></span> <p>${data[0].username}</p> <i class="fas fa-times" onclick="removeban(this.parentNode.parentNode.id)"></i></div>`
        }
    });

    socket.on('remove_ban',(data)=>{
        if(data[1] == document.querySelector(".room_name").id){
            baned_users_track.forEach((elem,ind)=>{
                if(elem.userid == data[0].userid){
                    baned_users_track.splice(ind,1);
                }
            })

            if(document.getElementById(data[0].userid)){
                document.getElementById(data[0].userid).remove();
            }
        }
    });

    socket.on('remove_blocks',(data)=>{
        block_users_track.forEach((elem,ind)=>{
            if(elem.userid == data[0].userid){
                block_users_track.splice(ind,1);
            }
        })
    });

    socket.on('all-msg-cleard',(data)=>{
        console.log(data)
        if(data.room == document.querySelector(".room_name").id){
            document.querySelector(".main-chat").innerHTML = "";
        }
    });

    socket.on('blocked_user',(data)=>{
        block_users_track.push(data[0]);
    });

    function pmchat(id,name,event) {

        document.querySelector('.type_msg').removeAttribute("disabled");

        var id = id.replace("pmuser","user");
        if(typeof(name) == "object"){
            var receiver = name[1];
        }else{
            id = "user"+id;
            var receiver = name;
        }
        if(id.includes("frnd")){
            id = id.replace("frnd","user");
        }
            document.querySelector(".persnol_chat_model").innerHTML = `<div class="pmchathead"><div class="pm_type ${document.querySelector(`.users #${id}`).classList[1]}"><span class="pm_profile" onclick="view_profile(event)"></span> ${receiver}</div>
                                                                        <div class="pm-options"><i class="fas fa-video" id="startvideocall" onclick="pmvideostart()"></i><i class="fas fa-phone-volume" id="startaudiocall"" onclick="pmaudiostart()"></i><i class="fas fa-times"onclick="closepm()"></i></div></div>
                                                                        <div class="pmchat_msg">
                                                                        <div class="pm_video_div">
                                                                        <div class="pmvideo_wrapper">
                                                                        <video autoplay="true" id="pmvideoElement1"  muted></video>
                                                                        <video autoplay="true" id="pmvideoElement2"></video>
                                                                        <video autoplay="true" id="pmscreenshare1"></video>
                                                                        <video autoplay="true" id="pmscreenshare1"></video>
                                                                        <div class="css_filters">
                                                                        <span onclick="cssfilter('sub')"><i class="fas fa-caret-left"></i></span><p id="cur_filter">normal</p><span onclick="cssfilter('add')"><i class="fas fa-caret-right"></i></span>
                                                                        </div>
                                                                        </div>
                                                                        <div class="pmvideo_control_wrapper">
                                                                        <div class="pmvideo_control">
                                                                        <button class="pmvideo_btn" onclick="muteCam()"><i class="fas fa-video"></i></button>
                                                                        <button class="pmshare_btn" onclick="startCapture()"></button>
                                                                        <button class="pmmic_btn" onclick="muteMic()"><i class="fas fa-microphone"></i></button>
                                                                        <button class="pmcall_btn" onclick="call_disc()"><i class="fas fa-phone-slash"></i></button>
                                                                        </div>
                                                                        <i class="fas fa-cog pmvideo_setting" onclick="toggel_filter()"></i>
                                                                        <i class="fas fa-expand-wide pmvideo_enlarge" onclick="enlarge()"></i>
                                                                        </div></div></div>`;
            document.querySelector(".persnol_chat_model").classList.add("activepm");
            document.querySelector(".pmchathead").id = id;
            document.querySelector(".user_details").setAttribute("style", "display:none");
            document.querySelector(".user_details .ud_head p").innerText = "";
            socket.emit("load-pmmsgs",{id:this_userid,type:user_type})
            if(name[0] == "msg"){
                event.stopPropagation();
                document.querySelector(`#${event.target.id} .num_of_msgs`).setAttribute("style","display:none");
                alertclose(event);
            }
    }

    function closepm() {
        mute_users_track.forEach((elem)=>{
            if(elem.userid.replace("user"," ").trim() == this_userid){
                document.querySelector('.type_msg').setAttribute("disabled","disable");
            }
        })

        document.querySelector(".persnol_chat_model").classList.remove("activepm");
    }