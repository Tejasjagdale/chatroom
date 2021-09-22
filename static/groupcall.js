const group_call=()=>{
    socket.emit("join_voice",{'userid':this_userid,'name':username,'current_room':document.querySelector(".room_name").id})
}

socket.on("new_vuser_join",(data)=>{
    var voice_user = document.createElement("DIV");
    voice_user.id = "voice" + data.userid;
    voice_user.className = "voice";


    document.querySelector(`#General_channel_users`).appendChild(voice_user);
    document.getElementById("voice" + data.userid).innerHTML = `<span></span> ${data.name}`;
    // document.getElementById("user"+ data.user.id).setAttribute("onclick", "user_profile(this.id)");
});

const end_groupcall=()=>{
    socket.emit("leave_voice",{'userid':this_userid,'name':username,'current_room':document.querySelector(".room_name").id})
}


socket.on("vuser_left",(data)=>{
    console.log(data)
});