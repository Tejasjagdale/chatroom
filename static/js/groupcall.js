var gcallstream;
var gpeer;

const showtextchannel = () => {
  document.querySelector(".group_video_div").style.display = "none";
};

function mutegMic() {
  if (gcallstream) {
    gcallstream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
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
    gcallstream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    document.getElementById("gvideoElement1").srcObject = gcallstream;
    if (gcallstream.getVideoTracks()[0].enabled) {
      document.querySelector(
        ".gvideo_btn"
      ).innerHTML = `<i class="fas fa-video"></i>`;
    } else {
      document.querySelector(
        ".gvideo_btn"
      ).innerHTML = `<i class="fas fa-video-slash"></i>`;
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
  if (
    document.querySelector(".group_video_div").style.display != "block" &&
    document.getElementById("gvideoElement1").srcObject == null
  ) {
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

    gpeer.on("close", (data) => {
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
    mutegCam();
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
  document.getElementById(
    "voice" + data.userid
  ).innerHTML = `<span style="background-image: url(${data.userid}/files/profiledp.png);"></span> ${data.name}`;

  if (data.name != username) {
    var newuser = document.createElement("DIV");
    newuser.id = `${data.name}video_wrapper`;
    newuser.className = "gvideo_wrapper2";

    document.querySelector(`.gvideo_wrapper`).appendChild(newuser);
    document.getElementById(
      `${data.name}video_wrapper`
    ).innerHTML = `<label>${data.name}</label><span><i class="fas fa-microphone-slash"></i></span><video autoplay="true" id="${data.name}video" class="gvideoElement2" ></video>`;
    curuser = data.name;
    document.getElementById(`${data.name}video_wrapper`).setAttribute('onclick', 'group_zoomvideo(event,this.id)')
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
  document
    .getElementById("gvideoElement1")
    .setAttribute("poster", "url(profile/default_dp1.png)");
  document
    .querySelector(".group_video_div")
    .setAttribute("style", "display:none");
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
    mutegCam();
    mutegMic();
  });

  gpeer.on("close", (data) => {
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

async function gstartCapture(displayMediaOptions) {
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );

    captureStream.addEventListener("ended", () => {
      stopCapture();
    });
  } catch (err) {
    console.error("Error: " + err);
  }
  document
    .querySelector(".gshare_btn")
    .setAttribute("onclick", "stopCapture()");
  document
    .querySelector(".gshare_btn")
    .setAttribute("style", "background-image:url('cshare.png')");
  if (window.innerWidth >= 525) {
    document.getElementById("gvideoElement1").srcObject = captureStream;
  } else {
    document.getElementById("gvideoElement1").style.display = "none";
  }

  gpeer.replaceTrack(gpeer.streams[0].getVideoTracks()[0], captureStream.getVideoTracks()[0], gpeer.streams[0]
  );
}

async function gstopCapture() {
  console.log(captureStream);
  document
    .querySelector(".gshare_btn")
    .setAttribute("onclick", "startCapture()");
  document
    .querySelector(".gshare_btn")
    .setAttribute("style", "background-image:url('share.png')");
  document.getElementById("gvideoElement1").srcObject = gcallstream;
  gpeer.replaceTrack(
    gpeer.streams[0].getVideoTracks()[0],
    gcallstream.getVideoTracks()[0],
    gpeer.streams[0]
  );
}

function genlarge() {
  document.querySelector(".gvideo_enlarge").setAttribute("onclick", "gbacktosize()");
  document.querySelector(".group_video_div").setAttribute("style", "min-height:100vh;width:100vw;top:0%;display:block");
  document.querySelector(".gvideo_enlarge").classList.remove("fa-expand-wide");
  document.querySelector(".gvideo_enlarge").classList.add("fa-compress-wide");
  document.querySelector(".gvideo_wrapper1").setAttribute("style", "width: 350px;height: 200px;");
  document.querySelector(".gvideo_wrapper2").setAttribute("style", "width: 350px;height: 200px;");
}

function gbacktosize() {
  document
    .querySelector(".gvideo_enlarge")
    .setAttribute("onclick", "enlarge()");
  document
    .querySelector(".group_video_div")
    .setAttribute("style", "height:100%;display:block");
  document
    .querySelector(".gvideo_enlarge")
    .classList.remove("fa-compress-wide");
  document.querySelector("gvideo_enlarge").classList.add("fa-expand-wide");
  document
    .querySelector(".gvideo_wrapper1")
    .setAttribute("style", "width: 50%;height: 100%;");
  document
    .querySelector(".gvideo_wrapper2")
    .setAttribute("style", "width: 50%;height: 100%;");
}

function gcall_disc() {
  var stream = gcallstream;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }

  document.getElementById("gvideoElement1").srcObject = null;
  document.querySelector(".group_video_div").setAttribute("style", "display:none");
  gpeer.destroy();
}

const group_zoomvideo = (event, id) => {
  console.log(id)
  if (Math.floor((document.getElementById(id).clientWidth / document.querySelector(".gvideo_wrapper").clientWidth) * 100) < 100) {
    document.querySelector(".gvideo_wrapper1").setAttribute("style", "display:none");

    document.querySelectorAll(".gvideo_wrapper2").forEach((elem) => {
      elem.setAttribute("style", "display:none");
    })

    document.getElementById(id).setAttribute("style", "display:flex;width:100%;height:100%");
    console.log(1)
  } else {
    console.log(2)
    document.querySelector(".gvideo_wrapper1").setAttribute("style", "display:flex");

    document.querySelectorAll(".gvideo_wrapper2").forEach((elem) => {
      document.getElementById(elem.getAttribute('id')).setAttribute("style", "display:flex;width:350px;height:200px");
    })
  }
};
