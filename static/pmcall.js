var peer;
var userinpmcall;
var userinroomcall;
var callerSignal;
var MyStream;
var captureStream = null;


async function getstream(){
    try {
        MyStream = await navigator.mediaDevices.getUserMedia({ video: true,audio:true});

        return MyStream;
    } catch (error) {
        console.log(error);
    } 
}


function muteMic() {
    if(MyStream){
        MyStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        console.log(MyStream)
        if(MyStream.getAudioTracks()[0].enabled){
            document.querySelector(".pmmic_btn").innerHTML = `<i class="fas fa-microphone"></i>`;
            document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone"></i>`;
        }else{
            document.querySelector(".pmmic_btn").innerHTML = `<i class="fas fa-microphone-slash"></i>`;
            document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        }
    }else{
        if(document.querySelector(".mainmic").innerHTML == `<i class="fas fa-microphone"></i>`){
            document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        }else{
            document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone"></i>`;
        }
    }
}

function muteCam() {
    if(MyStream){
            MyStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        console.log(MyStream)
        if(MyStream.getVideoTracks()[0].enabled){
            document.querySelector(".pmvideo_btn").innerHTML = `<i class="fas fa-video"></i>`;
        }else{
            document.querySelector(".pmvideo_btn").innerHTML = `<i class="fas fa-video-slash"></i>`;
        }
    }
}

async function pmvideostart(){
    if(document.querySelector(".pm_video_div").style.display == "block"){
        alert("you are already in call with this person!")
    }else{
        const stream = await getstream();
        MyStream = stream;
        document.querySelector(".pm_video_div").setAttribute("style","display:block");
        document.querySelector(".video_wrapper1 label").innerText = username;
        document.querySelector(".video_wrapper2 label").innerText = document.querySelector(".pm_type").innerText;
        document.getElementById("pmvideoElement1").srcObject = MyStream;
        document.querySelector(".pmvideo_btn").innerHTML = `<i class="fas fa-video-slash"></i>`;

        peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream:MyStream
        });

        peer.on('error', err => console.log('error', err));

        peer.on("signal",data =>{
            if(data === 'screenshare'){
                console.log(data)
            }else{
            socket.emit("pmcall",{"id":this_userid,"name":username,"rcallid":document.querySelector(".pmchathead").id,"call":"video","signal":data});
            }
        });

        peer.on("stream",stream =>{
            document.getElementById("pmvideoElement2").srcObject = stream;
            if(stream){
                stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                if(stream.getAudioTracks()[0].enabled){
                    document.querySelector(".pmmic_btn").innerHTML = `<i class="fas fa-microphone"></i>`;
                    document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone"></i>`;
                }else{
                    document.querySelector(".pmmic_btn").innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                    document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                }
            }else{
                if(document.querySelector(".mainmic").innerHTML == `<i class="fas fa-microphone"></i>`){
                    document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                }else{
                    document.querySelector(".mainmic").innerHTML = `<i class="fas fa-microphone"></i>`;
                }
            }
        });

        peer.on('dissconnect', (data) => {
            document.getElementById("pmvideoElement2").setAttribute("style","display:none");

            var tracks = MyStream.getTracks();

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];
                track.stop();
            }

            document.getElementById("pmvideoElement1").srcObject = null;
            document.querySelector(".pm_video_div").setAttribute("style","display:none");
            userinpmcall = false;
        });

        socket.on("callAccepted",(data) =>{
            peer.signal(data.signal);
        });

        socket.on("callDeclined",(data) =>{
            call_disc();
        });

        muteMic();
    }
};

async function pmaudiostart(){
    if(document.querySelector(".pm_video_div").style.display == "block"){
        alert("you are already in call with this person!")
    }else{
        const stream = await getstream();
        MyStream = stream;
        document.querySelector(".pm_video_div").setAttribute("style","display:block");
        document.getElementById("pmvideoElement1").srcObject = MyStream;

        peer = new SimplePeer({
            initiator: true,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
            trickle: false,
            stream:MyStream
        });

        peer.on('error', err => console.log('error', err));

        peer.on("signal",data =>{
            if(data === 'screenshare'){
                console.log(data)
            }else{
            socket.emit("pmcall",{"id":this_userid,"name":username,"rcallid":document.querySelector(".pmchathead").id,"call":"video","signal":data});
            }
        });

        peer.on("stream",stream =>{
            document.getElementById("pmvideoElement2").srcObject = stream;
        });

        peer.on('dissconnect', (data) => {
            document.getElementById("pmvideoElement2").setAttribute("style","display:none");
            
            var tracks = MyStream.getTracks();

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];
                track.stop();
            }

            document.getElementById("pmvideoElement1").srcObject = null;
            document.querySelector(".pm_video_div").setAttribute("style","display:none");
            userinpmcall = false;
        });

        socket.on("callAccepted",(data) =>{
            peer.signal(data.signal);
            userinpmcall = true;
        });

        socket.on("callDeclined",(data) =>{
            call_disc();
        });

        muteCam();
        muteMic();
    }
};



socket.on("pmcall",(data)=>{
    if(userinpmcall){
        socket.emit("inothercall",{"status":"inothercall","id":data.id});
    }else{
        document.querySelector(".incoming_pmcall").setAttribute("style","display:block");
        document.querySelector(".incoming_pmcall").id = data.id;
        document.querySelector(".scall_name").innerText = data.name;
        document.querySelector(".incom_dp").setAttribute("style",`background-image:url(${data.name}/files/profiledp.png)`)
        document.querySelector(".incoming_pmcall").setAttribute("call",data.call);
        callerSignal = data.signal;
        ringtone.play();
    }
});

socket.on("inothercall",(data)=>{
    console.log(data);
    numbusy.play();
});

async function acceptcall(event){
    userinpmcall = true;
    ringtone.pause();
    ringtone.src = ringtone.src;

    document.querySelector(".video_wrapper1 label").innerText = username;
    document.querySelector(".video_wrapper2 label").innerText = document.querySelector(".scall_name").innerText;

    pmchat(document.querySelector(".incoming_pmcall").id,document.querySelector(".scall_name").innerText,event); 
    MyStream = await getstream();

    peer = new SimplePeer({
        initiator: false,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
        trickle:false,
        stream:MyStream
    });

    peer.on("signal",data =>{
        if(data === 'screenshare'){
            console.log(data)
        }else{
            socket.emit("callAccepted",{signal:data,id:document.querySelector(".pmchathead").id});
        }
    });

    peer.on("stream",stream =>{
        document.getElementById("pmvideoElement1").srcObject = MyStream;
        document.getElementById("pmvideoElement2").srcObject = stream;
        muteCam();
        muteMic();
    });

    peer.on('dissconnect', (data) => {
        document.getElementById("pmvideoElement2").setAttribute("style","display:none");
        
        var tracks = MyStream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }

        document.getElementById("pmvideoElement1").srcObject = null;
        document.querySelector(".pm_video_div").setAttribute("style","display:none");
        userinpmcall = false;
    });

    peer.signal(callerSignal);

    document.querySelector(".incoming_pmcall").setAttribute("style","display:none");
    document.querySelector(".pm_video_div").setAttribute("style","display:block");  
}

async function declinecall(){
    socket.emit("callDeclined",{id:document.querySelector(".incoming_pmcall").id});
    document.querySelector(".incoming_pmcall").setAttribute("style","display:none");
    ringtone.pause();
    ringtone.src = ringtone.src;
}


async function startCapture(displayMediaOptions) {
    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

        captureStream.addEventListener('ended', () => {
            stopCapture();
            console.log("aiugasiy")
        });
    } catch(err) {
        console.error("Error: " + err);
    }
    document.querySelector(".pmshare_btn").setAttribute("onclick","stopCapture()");
    document.querySelector(".pmshare_btn").setAttribute("style","background-image:url('cshare.png')")
    if(window.innerWidth >= 525){
        document.getElementById("pmvideoElement1").srcObject = captureStream;
    }else{
        document.getElementById("pmvideoElement1").style.display = 'none';
    }
    peer.send('screanshare');
    peer.replaceTrack(peer.streams[0].getVideoTracks()[0], captureStream.getVideoTracks()[0], peer.streams[0]);
}

async function stopCapture() {
    console.log(captureStream)
    document.querySelector(".pmshare_btn").setAttribute("onclick","startCapture()");
    document.querySelector(".pmshare_btn").setAttribute("style","background-image:url('share.png')")
    document.getElementById("pmvideoElement1").srcObject = MyStream;
    peer.replaceTrack(peer.streams[0].getVideoTracks()[0],MyStream.getVideoTracks()[0],peer.streams[0])
}

function enlarge(){
    document.querySelector(".pmvideo_enlarge").setAttribute("onclick","backtosize()");
    document.querySelector(".pm_video_div").setAttribute("style","min-height:100vh;width:100vw;top:0%;display:block");
    document.querySelector(".pmvideo_enlarge").classList.remove("fa-expand-wide");
    document.querySelector(".pmvideo_enlarge").classList.add("fa-compress-wide");
    document.querySelector(".video_wrapper1").setAttribute("style","width: 50%;height: 70%;");
    document.querySelector(".video_wrapper2").setAttribute("style","width: 50%;height: 70%;");
};

function backtosize(){
    document.querySelector(".pmvideo_enlarge").setAttribute("onclick","enlarge()");
    document.querySelector(".pm_video_div").setAttribute("style","height:55%;display:block");
    document.querySelector(".pmvideo_enlarge").classList.remove("fa-compress-wide");
    document.querySelector(".pmvideo_enlarge").classList.add("fa-expand-wide");
    document.querySelector(".video_wrapper1").setAttribute("style","width: 50%;height: 100%;");
    document.querySelector(".video_wrapper2").setAttribute("style","width: 50%;height: 100%;");
}



function call_disc() {
    var stream = MyStream;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }

    document.getElementById("pmvideoElement1").srcObject = null;
    document.querySelector(".pm_video_div").setAttribute("style","display:none");
    peer.destroy();
    userinpmcall = false;
}

var filterIndex = 0;

function toggel_filter(){
    console.log(document.querySelector(".activefil"))
    if(document.querySelector(".activefil")){
        document.querySelector(".activefil").classList.remove("activefil");;
    }else{
        document.querySelector(".css_filters").classList.add("activefil");
    }
}

function cssfilter(opr){
    const filters = [
        "normal",
        "blur",
        "brightness",
        "contrast",
        "grayscale",
        "hue-rotate",
        "invert",
        "saturate",
        "sepia",
      ];

      if(opr == "add"){
          if(filterIndex == (filters.length - 1)){
            filterIndex = 0;
          }else{
            filterIndex++;
          }

        document.getElementById("cur_filter").innerText = filters[filterIndex];
        document.getElementById("pmvideoElement1").className = filters[filterIndex];
      }else{
          if(filterIndex == 0){
            filterIndex = filters.length - 1
          }else{
              filterIndex--;
          }

            document.getElementById("cur_filter").innerText = filters[filterIndex];
          document.getElementById("pmvideoElement1").className = filters[filterIndex];
      }
}

const zoomvideo=(id)=>{
    if(window.innerWidth >= 525){
        if(Math.floor((document.getElementById(id).clientWidth/document.querySelector('.pmvideo_wrapper').clientWidth)*100) === 50){
            ['.video_wrapper1','.video_wrapper2'].forEach((elem)=>{
                document.querySelector(elem).setAttribute('style',"display:none")
            });
            document.getElementById(id).parentNode.setAttribute("style","display:flex;width:100%;height:100%");
            console.log(document.getElementById(id).parentNode)
        }else{
            ['.video_wrapper1','.video_wrapper2'].forEach((elem)=>{
                document.querySelector(elem).setAttribute('style',"display:flex;width:50%;height:100%")
            })
        }
    }
}
