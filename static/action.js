document.getElementById("search_any").addEventListener("keyup",(event)=>{
    let val = event.target.value;
    let ao = document.getElementById("search_any").getAttribute("cur_option");

    if(ao == "user"){
        document.querySelectorAll(".user .username").forEach((item,index)=> {
            if(item.innerText.includes(val)){
                document.getElementById(item.parentNode.id).setAttribute("style","display:flex");
            }else{
               document.getElementById(item.parentNode.id).setAttribute("style","display:none");
            }
        });
    }
    else if(ao == "frnd"){
        document.querySelectorAll(".freind .username").forEach((item,index)=> {
            if(item.innerText.includes(val)){
                document.getElementById(item.parentNode.id).setAttribute("style","display:flex");
            }else{
               document.getElementById(item.parentNode.id).setAttribute("style","display:none");
            }
        });
    }else{
        var r = 0
        document.querySelectorAll(".room .username").forEach((item,index)=> {
            r++;
            if(r > 1){
                if(item.innerText.includes(val)){
                    document.getElementById(item.parentNode.id).setAttribute("style","display:flex");
                }else{
                   document.getElementById(item.parentNode.id).setAttribute("style","display:none");
                }
            }
            
        });
    }
    
});

const action=(id)=>{
    document.querySelector(".action-container").id = id.replace("frnd","user");
    document.querySelector(".admin_action .head span").innerHTML =`<span id="action_dp"></span> ${document.querySelector(".user_details .ud_head p").innerText}`
    document.querySelector(".admin_action").classList.add("activeb2");
    document.querySelector(".alert").setAttribute("style", "display:block");
    document.querySelector(".admin_action").setAttribute("style", "animation: ZoomIn 0.3s ease-out");
    frnds_list.forEach((item)=> {
        if(item.sender_id.trim() == id.replace("user"," ").trim() || item.receiver_id.replace("user"," ").trim() == id.replace("user"," ").trim() || item.sender_id.trim() == id.replace("frnd"," ").trim() || item.receiver_id.replace("user"," ").trim() == id.replace("frnd"," ").trim()){
            document.querySelector("#actions4").innerHTML = `<i class="fas fa-user-times"></i> Remove freind`;
            document.querySelector("#actions4 i").setAttribute("style","color:red");
            document.querySelector("#actions4").setAttribute("onclick","RemoveFreind(this.parentNode.parentNode.id)");
        }
    });
    close_user_profile();
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

const make_mod=(userid)=>{
    var mod ={
        "role":"Moderator",
        "username":document.querySelector(".admin_action .head span").innerText,
        "userid":userid,
    }

    socket.emit("make_mod",[mod,document.querySelector(".room_name").innerText]);
    alertclose(event);
}

const mute_user=(userid)=>{
    var mod ={
        "usertype":"Moderator",
        "username":document.querySelector(".admin_action .head span").innerText,
        "userid":userid,
    }

    socket.emit("mute_user",[mod,document.querySelector(".room_name").innerText]);
    alertclose(event);
}

const ban_user=(userid)=>{
    var mod ={
        "usertype":"Moderator",
        "username":document.querySelector(".admin_action .head span").innerText,
        "userid":userid,
    }

    socket.emit("ban_user",[mod,document.querySelector(".room_name").innerText]);
    alertclose(event);
}

const block_user=(userid)=>{
    var mod ={
        "usertype":"Moderator",
        "username":document.querySelector(".admin_action .head span").innerText,
        "userid":userid,
    }

    socket.emit("block_user",[mod,this_userid]);
    alertclose(event);
}