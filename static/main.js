    var pm = new Audio('./sounds/pm-sound.mp3');
    var msg1 = new Audio('./sounds/in-msg.mp3');
    var frndr = new Audio('./sounds/frnd-sound.mp3');
    var ringtone = new Audio('./sounds/Ringtone1.mp3');
    var numbusy = new Audio('./sounds/busy.mp3');

    var frnds_list = [];
    var active_streams = [];
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
            var room_user = document.createElement("DIV");
            if(username == data.name){
                this_userid = data.id;
            }
            room_user.id = "user" + data.id;
            room_user.className = "user";
            var name = data.name;

            document.querySelector(`.users`).appendChild(room_user);
            document.getElementById("user" + data.id).innerHTML = `<span class="uprofile"></span><p class="username">${data.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`

            if(data.type == "guest"){
                document.getElementById("user" + data.id).classList.add('guest');
            }else{
                document.getElementById("user" + data.id).classList.add('register');
            }

            document.getElementById("user" + data.id).setAttribute("onclick", "user_profile(this.id)");
        }
    });

    

    socket.on('load-users',(data)=>{
        data.forEach(function(item, index) {
        var room_user = document.createElement("DIV");
        country = data.country;
        room_user.id = "user" + item.id;
        room_user.className = "user";
        var name = item.name;

        document.querySelector(`.users`).appendChild(room_user);
       
        document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`

        if(item.type == "guest"){
            document.getElementById("user" + item.id).classList.add('guest');
        }else{
            document.getElementById("user" + item.id).classList.add('register');
        }

        document.getElementById("user" + item.id).setAttribute("onclick", "user_profile(this.id)");
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

    socket.on('msg-clear',(data)=>{
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
            document.getElementById("user"+data.id).remove();
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
    });


    socket.on("change-room",(data)=>{
        if(data.result =="passed"){
            if(data.data.nroomname != "Main room"){
                data.data.roles.forEach(element => {
                    if(element._id == this_userid){
                        document.querySelector(".rsetting").setAttribute("style","display:block");
                     }else{
                        document.querySelector(".rsetting").setAttribute("style","display:none");
                     }
                });
            }
            document.querySelector(".room_name").id = data.data.nroomname;
            document.querySelector(".room_name").innerHTML = `<span><i class='fas fa-users'></i></span>${data.data.nroomname}`;

        }else{
            alert("you entered wrong password!");
        }
    });

    socket.on("change-room-left",(data)=>{
        if(data.nroom == document.querySelector(".room_name").id){
            var room_user = document.createElement("DIV");
            room_user.id = "user" + data.user.id;
            room_user.className = "user";
            var name = data.user.name;

            document.querySelector(`.users`).appendChild(room_user);
            document.getElementById("user" + data.user.id).innerHTML = `<span class="uprofile"></span><p class="username">${data.user.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`

        if(data.type == "guest"){
            document.getElementById("user"+data.user.id).classList.add('guest');
        }else{
            document.getElementById("user"+data.user.id).classList.add('register');
        }
        }
        if(data.croom == document.querySelector(".room_name").id){
            document.getElementById("user" + data.user.id).remove();
        }
    });


    socket.on("change-room-load",(data)=>{
        document.querySelector(".users").innerHTML = ``;
        document.querySelector(".main-chat").innerHTML = `<div class="emojis"></div>`;
        document.querySelector(".persnol_chat_model").classList.remove("activepm");


        data.roomusers.forEach(function(item,index){
            var room_user = document.createElement("DIV");
            country = data.country;
            room_user.id = "user" + item.id;
            room_user.className = "user";
            var name = item.name;

            document.querySelector(`.users`).appendChild(room_user);
            console.log(data)
            data.roomroles.forEach(element => {
                if(element.userid == item.id){
                    if(element.role == "admin"){
                        document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><i class="fas fa-crown"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`
                    }else{
                        document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><i class="fas fa-user-shield"></i><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`
                    }
                }else{
                    document.getElementById("user" + item.id).innerHTML = `<span class="uprofile"></span><p class="username">${item.name}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`
                }
            });
            

            if(item.type == "guest"){
                document.getElementById("user" + item.id).classList.add('guest');
            }else{
                document.getElementById("user" + item.id).classList.add('register');
            }

            document.getElementById("user" + item.id).setAttribute("onclick", "user_profile(this.id)");
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
                var frndp = document.createElement("DIV");
                frndp.id = "frndp" + item.receiver_id.replace("user"," ").trim();
                frndp.className = "profile_wrapper";


                document.querySelector(`.friends_display`).appendChild(frndp);
                document.getElementById(frndp.id).innerHTML = `<span class="frnds_profile"><p class="frnd_name">${item.receiver}</p></span>`;
                document.getElementById(frndp.id).classList.add('register');
                document.getElementById(frndp.id).setAttribute("onclick", "view_profilef(this.id)");
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


    socket.on("load-frnds",(data)=>{
        frnds_list =  data.frnds;
        data.frnds.forEach((item,index)=>{
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

        socket.emit("new-room",{"roomname":rname,"roompass":rpassword,"roomroles":[{"role":"admin","username":username,"userid":this_userid}]});

        document.getElementById("Croomname").value = "";
        document.getElementById("Croompassword").value = "";
        alert("your room is created!");
        alertclose(event);
    }

    const changeroom=(room)=>{
        let new_room_name = document.querySelector(`#${room} p`).innerText;

        if(new_room_name == "Main Room"){
            document.querySelector(".enter_roompass .head  span").innerHTML = new_room_name;
            roompass();
        }else{
            document.querySelector(".enter_roompass .head  span").innerHTML = new_room_name;

            document.querySelector(".alert").setAttribute("style", "display:block");
            document.querySelector(".enter_roompass").classList.add("activeb2");
            document.querySelector(".enter_roompass").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
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


    function user_profile(event) {
        var user_div = document.getElementById(event);
        var top = user_div.offsetTop;

        if (user_type == "register") {
            if (user_div.classList[1] == "register") {
                document.querySelector(".user_details .addfreind").setAttribute("style", "display:flex");
                document.querySelector(".user_details .addfreind").id = user_div.id;
            } 
            if (user_div.classList[1] == "guest") {
                document.querySelector(".user_details .addfreind").setAttribute("style", "display:none");
            }
        }
        if (user_type == "guest") {
            document.querySelector(".user_details .addfreind").setAttribute("style", "display:none");
            document.querySelector(".user_details .addfreind").id = user_div.id;
        }

        document.querySelector(".user_details").setAttribute("style", `display:block;top:${top+30}px`);
        
        if (document.querySelector(".user_details .ud_head p").innerText == document.querySelector(`#${event} .username`).innerText) {
            close_user_profile();
        } 
        else {
            if (event == `user${this_userid}`) {
                document.querySelector(".pm_chat").innerHTML = `<i class="far fa-edit"></i> Edit`;
                document.querySelector(".pm_chat").setAttribute("onclick","edit_profile()");
                document.querySelector(".user_details .addfreind").setAttribute("style", "display:none");
                document.querySelector(".user_details .ud_head p").innerText = document.querySelector(`#${event} .username`).innerText;
            } 
            else {
                document.querySelector(".user_details .addfreind").setAttribute("onclick","addfreind(this.id,event)");
                document.querySelector(".user_details .addfreind").innerHTML = `<span class="frd-icon"><i class="fas fa-user-plus"></i></span> Addfreind`;

                frnds_list.forEach((item,index)=> {
                    if(item.sender_id.trim() == event.replace("user"," ").trim() || item.receiver_id.replace("user"," ").trim() == event.replace("user"," ").trim() || item.sender_id.trim() == event.replace("frnd"," ").trim() || item.receiver_id.replace("user"," ").trim() == event.replace("frnd"," ").trim()){
                        document.querySelector(".user_details .addfreind").innerHTML = `<span class="frd-icon"><i class="fas fa-user-times"></i></span> Remove freind`;
                        document.querySelector(".addfreind").setAttribute("style","color:red");
                        document.querySelector(".user_details .addfreind").setAttribute("onclick","RemoveFreind(this.id,event)");
                    }
                });
                
                if (document.querySelector(".pm_chat").innerHTML == `<i class="far fa-edit"></i> Edit`) {
                    document.querySelector(".pm_chat").innerHTML = `<i class="fas fa-comments"></i> privatechat`;
                }
                if (user_type != "guest" && user_div.classList[1] != "guest") {
                    document.querySelector(".user_details .addfreind").setAttribute("style", "display:flex");
                }
                document.querySelector(".pm_chat").setAttribute("onclick","pmchat(this.id,this.classList,event)")
                document.querySelector(".pm_chat").id = user_div.id;
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

    function pmchat(id,name,event) {
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
        document.querySelector(".persnol_chat_model").classList.remove("activepm");
    }

    function addfreind(opretion_type, event) {
        event.stopPropagation();
        var receiver = document.querySelector(".user_details .ud_head p").innerText;
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
            document.getElementById("frnd" + event.target.parentNode.parentNode.id.replace("alert"," ").trim()).innerHTML = `<span class="uprofile" name="hmm"></span><p class="username">${event.target.id}</p><div><img src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg" width="30px" height="20px"/></div>`;
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
                "receiver": receiver.trim(),
                "sender_id":this_userid,
                "receiver_id": event.target.id,
                "status":"send",
            }
            socket.emit("frnd_query",frnd_query);
        }
    }

    const RemoveFreind=(id,event)=>{
        if(id.includes("user")){
            document.getElementById(id.replace("user","frnd")).remove();
            var recv_id =  id;
        }else{
            document.getElementById(id).remove();
            var recv_id =  id.replace("frnd","user");
        }

        const receiver = document.querySelector(".user_details .ud_head").innerText;

        var frnd_query = {
                "sender":username,
                "receiver": receiver,
                "sender_id":this_userid,
                "receiver_id": recv_id,
                "status":"declined",request_video
            }

        socket.emit("frnd_query",frnd_query);
        document.querySelector(".user_details").setAttribute("style","display:none");

        frnds_list.forEach((items,index)=> {
            if(items.receiver == receiver){
                frnds_list.splice(index,1);
            }
            if(items.sender == receiver){
                frnds_list.splice(index,1);
            }
        });
    }

    const deletepm=(event)=>{
        event.stopPropagation();
        document.getElementById(event.target.parentNode.parentNode.id).remove();
    };

    function enter_videochannel(){
        document.querySelector(".main-chat").innerHTML = `<div class="emojis"></div>`;
    document.querySelector(".video_div_wrapper").setAttribute("style","transform: translateY(0%);");
    }

    const view_profile=(event)=>{
        event.stopPropagation();

        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".profile_div").classList = "profile_div";
        document.querySelector(".profile_div").classList.add("activeb2");
        document.querySelector(".profile_div").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
        socket.emit("load_profile",{id:document.querySelector(".pmchathead").id});
    };

    const view_profilef=(event)=>{
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".profile_div").classList = "profile_div";
        document.querySelector(".profile_div").classList.add("activeb2");
        document.querySelector(".profile_div").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
        socket.emit("load_profile",{id:event.replace("frndp"," ").trim()});
    };


    function alertclose(event) {
        event.preventDefault();

        document.querySelector(".activeb2").classList.remove("activeb2");
        document.querySelector(".alert").setAttribute("style", "display:none");
    }

    document.querySelector(".alert").addEventListener("click", (event) => { alertclose(event) });

    document.getElementById("action").addEventListener("click", () => {
        document.querySelector(".admin_action").classList.add("activeb2");
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".admin_action").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    });

    document.getElementById("inbox").addEventListener("click", () => {
        document.querySelector(".inbox").classList.add("activeb2");
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".num_of_noti1").setAttribute("style", "display:none");
        msg_noti = 0;
        document.querySelector(".inbox").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    });

    document.getElementById("notification").addEventListener("click", () => {
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".num_of_noti2").setAttribute("style", "display:none");
        alert_noti = 0;
        document.querySelector(".notification").classList.add("activeb2");
        document.querySelector(".notification").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    });

    document.querySelector("#profile_div").addEventListener("click", () => {
        if(event.target.className == "vprofile"){
            document.querySelector(".alert").setAttribute("style", "display:block");
            document.querySelector(".profile_div").classList.add("activeb2");
            document.querySelector(".profile_div").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
            close_user_profile();
            socket.emit("load_profile",{id:document.querySelector(".addfreind").id});
        }
    });

    document.querySelector("#roomsetting").addEventListener("click", () => {
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".Room_settings").classList.add("activeb2");
        document.querySelector(".Room_settings").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    });

    document.querySelector(".addroom").addEventListener("click", () => {
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".create_room").classList.add("activeb2");
        document.querySelector(".create_room").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    });

    document.querySelector(".show_options").addEventListener("click", () => {
        document.querySelector(".alert").setAttribute("style", "display:block");
        document.querySelector(".video_options").classList.add("activeb2");
        document.querySelector(".video_options").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    });


    document.querySelector(".inbox").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".admin_action").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".Room_settings").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".notification").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".create_room").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".profile_div").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".enter_roompass").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    document.querySelector(".video_options").addEventListener("click", (e) => {
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
        }
    });

    let i=0;

    const asmback=()=>{
        document.querySelector("aside").setAttribute("style","right:-100%");
    }

    const showasm=()=>{
        document.querySelector("aside").setAttribute("style","right:0%");
    }


    const showfrnds=()=>{
        document.querySelector(".freinds").setAttribute("style","display:block");
        document.querySelector(".rooms").setAttribute("style","display:none;");
        document.querySelector(".users").setAttribute("style","display:none;");
        document.querySelector(".voice_channels").setAttribute("style","display:none;");
        document.getElementById("search_any").setAttribute("placeholder","Search friends here...");
        document.getElementById("search_any").setAttribute("cur_option","frnd");
    };

    const showusers=()=>{
        document.querySelector(".users").setAttribute("style","display:block;");
        document.querySelector(".freinds").setAttribute("style","display:none;");
        document.querySelector(".rooms").setAttribute("style","display:none;");
        document.querySelector(".voice_channels").setAttribute("style","display:none;");
        document.getElementById("search_any").setAttribute("placeholder","Search users here...");
        document.getElementById("search_any").setAttribute("cur_option","user");
    };

    const showrooms=()=>{
        document.querySelector(".users").setAttribute("style","display:none;");
        document.querySelector(".freinds").setAttribute("style","left:100%");
        document.querySelector(".rooms").setAttribute("style","display:block;");
        document.querySelector(".voice_channels").setAttribute("style","display:none;");
        document.getElementById("search_any").setAttribute("placeholder","Search rooms here...")
        document.getElementById("search_any").setAttribute("cur_option","room");
    };

    const joinvc=()=>{
        document.querySelector(".users").setAttribute("style","display:none;");
        document.querySelector(".freinds").setAttribute("style","display:none");
        document.querySelector(".rooms").setAttribute("style","display:none;");
        document.querySelector(".voice_channels").setAttribute("style","display:block;");
    };

    document.querySelectorAll(".options span")[0].setAttribute("style","background-color: #F3407A;");


    document.querySelectorAll(".options span")[0].addEventListener("click",()=>{
        document.querySelectorAll(".options span")[0].setAttribute("style","background-color: #F3407A;");
        document.querySelectorAll(".options span")[1].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[2].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[3].setAttribute("style","background-color: #75CAEB;");
    });

    document.querySelectorAll(".options span")[1].addEventListener("click",()=>{
        document.querySelector(".user_details").setAttribute("style", "display:none");
        document.querySelectorAll(".options span")[1].setAttribute("style","background-color: #F3407A;");
        document.querySelectorAll(".options span")[0].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[2].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[3].setAttribute("style","background-color: #75CAEB;");
    });

    document.querySelectorAll(".options span")[2].addEventListener("click",()=>{
        document.querySelector(".user_details").setAttribute("style", "display:none");
        document.querySelectorAll(".options span")[2].setAttribute("style","background-color: #F3407A;");
        document.querySelectorAll(".options span")[0].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[1].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[3].setAttribute("style","background-color: #75CAEB;");
    });

    document.querySelectorAll(".options span")[3].addEventListener("click",()=>{
        document.querySelector(".user_details").setAttribute("style", "display:none");
        document.querySelectorAll(".options span")[2].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[0].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[1].setAttribute("style","background-color: #75CAEB;");
        document.querySelectorAll(".options span")[3].setAttribute("style","background-color: #F3407A;");
    });


    // display and other process

    var curid ;

    document.querySelector("#color3").classList.add("activecol")
    document.querySelector(".activecol").innerHTML = `<i class="fas fa-check"></i>`;
    var col1 = document.querySelector(".activecol").style.backgroundColor;
    document.querySelector(".main-chat").setAttribute("style","background-color:"+col1);

    var colors = ["#E5DDD5","#CBDAEC","#AED8C7","#7ACBA5","#66D2D5","#D6D0F0","#D1DABE","#E6E1B1","#FEEFA9","#FED297","#FD9A9B","#FB4668","#922040","#DC6E4F","#644D52","#517E7E","#1D2326","#35558A","#301E34","#FFFEA2"]

    document.querySelectorAll(".color").forEach((element,index) => {
        element.setAttribute("style",`background-color:${colors[index]}`);

        element.addEventListener("mouseover",()=>{
            if(document.getElementById("doodel").checked){
                document.querySelector(".main-chat").setAttribute("style",`background-image:url("wallpapers/dbg${index+1}.jpg"`);
            }else{
                document.querySelector(".main-chat").setAttribute("style","background:"+colors[index]);
            }
        });

        element.addEventListener("click",()=>{
            if(document.querySelector(".activecol")){
                document.querySelector(".activecol").innerHTML = ``;
                document.querySelector(".activecol").classList.remove("activecol");
            }
            element.classList.add("activecol");
            document.querySelector(".activecol").innerHTML = `<i class="fas fa-check"></i>`;
        })

        element.addEventListener("mouseout",()=>{
            var col = document.querySelector(".activecol");

            if(document.getElementById("doodel").checked){
                if(col.id == "bgimage"){
                    document.querySelector(".main-chat").setAttribute("style",`background-image:${col.style.backgroundImage};background-size:100% 100%`);
                }else{
                    let num =  col.id.split("color")[1];
                    document.querySelector(".main-chat").setAttribute("style",`background-image:url("wallpapers/dbg${num}.jpg"`);
                }
            }else{
                if(col.id == "bgimage"){
                    document.querySelector(".main-chat").setAttribute("style",`background-image:${col.style.backgroundImage};background-size:100% 100%`);
                }else{
                    document.querySelector(".main-chat").setAttribute("style","background:"+col.style.backgroundColor);
                }
            }
        });
    });

    const show_display=()=>{
        document.getElementById("set_display").style.transform = "translateX(0%)";
        if(window.innerWidth <= 825){
            document.querySelector(".ui-left").setAttribute("style","transform:translatex(0%)")
        }
        asmback();
        close_eprofile();
    }

    document.querySelector(".fa-arrow-left").addEventListener("click",()=>{
        document.getElementById("set_display").style.transform = "translateX(100%)";
    });


    const set_wallpaper=()=>{
        var file = document.getElementById("wp_select").files[0];
        var reader  = new FileReader();


        reader.onload = function(e)  {
            var video = document.getElementById("bgimage");
            var bgimage = document.querySelector(".main-chat");
            let buffer = e.target.result;
            let videoBlob = new Blob([new Uint8Array(buffer)]);
            let url = window.URL.createObjectURL(videoBlob);
            video.style.backgroundImage = `url(${url})`;
            bgimage.setAttribute("style",`background-image:url("${url}");background-size:100% 100%;`);
         }
         reader.readAsArrayBuffer(file);
         document.querySelector(".activecol").innerHTML = ``;
        document.querySelector(".activecol").classList.remove("activecol");
        document.getElementById("bgimage").classList.add("activecol");
    }

    const edit_profile=()=>{
        document.getElementById("edit_profile").setAttribute("style","transform:translatex(0%)");
        if(window.innerWidth <= 825){
            document.querySelector(".ui-left").setAttribute("style","transform:translatex(0%)")
        }
        asmback();
        close_user_profile();
    }

    const close_eprofile=()=>{
        document.getElementById("edit_profile").setAttribute("style","transform:translatex(-100%)")
    }