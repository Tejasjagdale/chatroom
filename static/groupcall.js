var gcallstream;
var gpeer;

const showtextchannel=()=>{
    document.querySelector(".group_video_div").style.display = 'none';
}

function mutegMic() {
  if (gcallstream) {
    gcallstream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (gcallstream.getAudioTracks()[0].enabled) {
      document.querySelector(
        ".gmic_btn"
      ).innerHTML = `<i class="fas fa-microphone"></i>`;
      document.querySelector(
        ".mainmic"
      ).innerHTML = `<i class="fas fa-microphone"></i>`;
    } else {
      document.querySelector(
        ".gmic_btn"
      ).innerHTML = `<i class="fas fa-microphone-slash"></i>`;
      document.querySelector(
        ".mainmic"
      ).innerHTML = `<i class="fas fa-microphone-slash"></i>`;
    }
  } else {
    if (
      document.querySelector(".mainmic").innerHTML ==
      `<i class="fas fa-microphone"></i>`
    ) {
      document.querySelector(
        ".mainmic"
      ).innerHTML = `<i class="fas fa-microphone-slash"></i>`;
    } else {
      document.querySelector(
        ".mainmic"
      ).innerHTML = `<i class="fas fa-microphone"></i>`;
    }
  }
}

function mutegCam() {
  if (gcallstream) {
    gcallstream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    document.getElementById("gvideoElement1").srcObject = gcallstream;
    if (gcallstream.getVideoTracks()[0].enabled) {
      document.querySelector(
        ".gvideo_btn"
      ).innerHTML = `<i class="fas fa-video-slash"></i>`;
    } else {
      document.querySelector(
        ".gvideo_btn"
      ).innerHTML = `<i class="fas fa-video"></i>`;
    }
  }
}

async function getstream() {
  try {
    gcallstream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    return gcallstream;
  } catch (error) {
    console.log(error);
  }
}

async function group_call() {
  if (document.querySelector(".group_video_div").style.display != "block" && document.getElementById("gvideoElement1").srcObject == null) {
    const stream = await getstream();
    gcallstream = stream;
    document
      .querySelector(".group_video_div")
      .setAttribute("style", "display:block");
    document.getElementById("gvideoElement1").srcObject = gcallstream;

    socket.emit("join_voice", {
      userid: this_userid,
      name: username,
      current_room: document.querySelector(".room_name").id,
    });
    // document.querySelector(".gvideo_wrapper1 ")

    gpeer = new SimplePeer({
      initiator: true,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
        ],
      },
      trickle: false,
      stream: gcallstream,
    });

    gpeer.on("error", (err) => console.log("error", err));

    gpeer.on("signal", (data) => {
      socket.emit("group_call", {
        id: this_userid,
        name: username,
        current_room: document.querySelector(".room_name").id,
        signal: data,
      });
    });

    gpeer.on("stream", (stream) => {
      document.getElementById(`${curuser}video`).srcObject = stream;
    });

    gpeer.on("dissconnect", (data) => {
      document
        .getElementById("gvideoElement2")
        .setAttribute("style", "display:none");

      var tracks = gcallstream.getTracks();

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
      }

      document.getElementById("gvideoElement1").srcObject = null;
      document
        .querySelector(".group_video_div")
        .setAttribute("style", "display:none");
    });

    socket.on("callstarted", (data) => {
      gpeer.signal(data.signal);
    });
    // mutegCam();
    mutegMic();
  } else {
    document
      .querySelector(".group_video_div")
      .setAttribute("style", "display:block");
  }
}

socket.on("new_vuser_join", async (data) => {
  var voice_user = document.createElement("DIV");
  voice_user.id = "voice" + data.userid;
  voice_user.className = "voice";

  document.querySelector(`#General_channel_users`).appendChild(voice_user);
  document.getElementById("voice" + data.userid).innerHTML = `<span style="background-image: url(${data.name}/files/profiledp.png);"></span> ${data.name}`;

  if (data.name != username) {
    var newuser = document.createElement("DIV");
    newuser.id = `${data.name}video_wrapper`;
    newuser.className = "gvideo_wrapper2";

    document.querySelector(`.gvideo_wrapper`).appendChild(newuser);
    document.getElementById(
      `${data.name}video_wrapper`
    ).innerHTML = `<label>${data.name}</label><span><i class="fas fa-microphone-slash"></i></span><video autoplay="true" id="${data.name}video" class="gvideoElement2" onclick="group_zoomvideo(this.id)" ></video>`;
    curuser = data.name;
  }
});

const end_groupcall = () => {
  var tstream = gcallstream;
  var tracks = tstream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }

  document.getElementById("gvideoElement1").srcObject = null;
  document.getElementById("gvideoElement1").setAttribute('poster',"url(profile/default_dp1.png)");
  document.querySelector(".group_video_div").setAttribute("style","display:none")
  socket.emit("leave_voice", {
    userid: this_userid,
    name: username,
    current_room: document.querySelector(".room_name").id,
  });
  document.querySelectorAll(".gvideo_wrapper2").forEach((elem) => {
    elem.remove();
  });
  gpeer.destroy();
};

socket.on("vuser_left", (data) => {
  if (document.querySelector(".group_video_div").style.display != "none") {
    document.getElementById(`${data.name}video_wrapper`).remove();
  }
  document.getElementById("voice" + data.userid).remove();
});

socket.on("group_call", async (data1) => {
  document
    .querySelector(".group_video_div")
    .setAttribute("style", "display:block");
  const stream = await getstream();
  gcallstream = stream;

  gpeer = new SimplePeer({
    initiator: false,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
      ],
    },
    trickle: false,
    stream: gcallstream,
  });

  gpeer.on("signal", (data) => {
    socket.emit("callstarted", { signal: data, rid: data1.id, name: username });
  });

  gpeer.on("stream", (stream) => {
    document.getElementById(`${data1.name}video`).srcObject = stream;
    // mutegCam();
    mutegMic();
  });

  gpeer.on("dissconnect", (data) => {
    document
      .getElementById("gvideoElement2")
      .setAttribute("style", "display:none");

    var tracks = gcallstream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
    }

    document.getElementById("gvideoElement1").srcObject = null;
    document
      .querySelector(".group_video_div")
      .setAttribute("style", "display:none");
    userinpmcall = false;
  });

  gpeer.signal(data1.signal);
});

async function startCapture(displayMediaOptions) {
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );

    captureStream.addEventListener("ended", () => {
      stopCapture();
      console.log("aiugasiy");
    });
  } catch (err) {
    console.error("Error: " + err);
  }
  document
    .querySelector(".pmshare_btn")
    .setAttribute("onclick", "stopCapture()");
  document
    .querySelector(".pmshare_btn")
    .setAttribute("style", "background-image:url('cshare.png')");
  if (window.innerWidth >= 525) {
    document.getElementById("pmvideoElement1").srcObject = captureStream;
  } else {
    document.getElementById("pmvideoElement1").style.display = "none";
  }
  gpeer.send("screanshare");
  gpeer.replaceTrack(
    gpeer.streams[0].getVideoTracks()[0],
    captureStream.getVideoTracks()[0],
    gpeer.streams[0]
  );
}

async function stopCapture() {
  console.log(captureStream);
  document
    .querySelector(".pmshare_btn")
    .setAttribute("onclick", "startCapture()");
  document
    .querySelector(".pmshare_btn")
    .setAttribute("style", "background-image:url('share.png')");
  document.getElementById("pmvideoElement1").srcObject = gcallstream;
  gpeer.replaceTrack(
    gpeer.streams[0].getVideoTracks()[0],
    gcallstream.getVideoTracks()[0],
    gpeer.streams[0]
  );
}

function enlarge() {
  document
    .querySelector(".pmvideo_enlarge")
    .setAttribute("onclick", "backtosize()");
  document
    .querySelector(".group_video_div")
    .setAttribute("style", "min-height:100vh;width:100vw;top:0%;display:block");
  document.querySelector(".pmvideo_enlarge").classList.remove("fa-expand-wide");
  document.querySelector(".pmvideo_enlarge").classList.add("fa-compress-wide");
  document
    .querySelector(".gvideo_wrapper1")
    .setAttribute("style", "width: 25%;height: 25%;");
  document
    .querySelector(".gvideo_wrapper2")
    .setAttribute("style", "width: 25%;height: 25%;");
}

function backtosize() {
  document
    .querySelector(".pmvideo_enlarge")
    .setAttribute("onclick", "enlarge()");
  document
    .querySelector(".pm_video_div")
    .setAttribute("style", "height:55%;display:block");
  document
    .querySelector(".pmvideo_enlarge")
    .classList.remove("fa-compress-wide");
  document.querySelector(".pmvideo_enlarge").classList.add("fa-expand-wide");
  document
    .querySelector(".video_wrapper1")
    .setAttribute("style", "width: 50%;height: 100%;");
  document
    .querySelector(".video_wrapper2")
    .setAttribute("style", "width: 50%;height: 100%;");
}

function gcall_disc() {
  var stream = gcallstream;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }

  document.getElementById("pmvideoElement1").srcObject = null;
  document.querySelector(".pm_video_div").setAttribute("style", "display:none");
  gpeer.destroy();
}

const group_zoomvideo = (id) => {
  if (window.innerWidth >= 525) {
    if (
      Math.floor(
        (document.getElementById(id).clientWidth /
          document.querySelector(".pmvideo_wrapper").clientWidth) *
          100
      ) === 50
    ) {
      [".gvideo_wrapper1", ".gvideo_wrapper2"].forEach((elem) => {
        document.querySelector(elem).setAttribute("style", "display:none");
      });
      document
        .getElementById(id)
        .parentNode.setAttribute(
          "style",
          "display:flex;width:100%;height:100%"
        );
      console.log(document.getElementById(id).parentNode);
    } else {
      [".gvideo_wrapper1", ".gvideo_wrapper2"].forEach((elem) => {
        document
          .querySelector(elem)
          .setAttribute("style", "display:flex;width:50%;height:100%");
      });
    }
  }
};
