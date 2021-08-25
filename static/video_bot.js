var stream_peer;
var VideoStream;
var videotrack;
var stream_watchers = [];



function getVideo(files) {

    var file = files;
    var reader  = new FileReader();
  
    reader.onload = function(e)  {
        var video = document.getElementById("streamed-video");
        let buffer = e.target.result;
        let videoBlob = new Blob([new Uint8Array(buffer)], { type: 'video/mp4' });
        let url = window.URL.createObjectURL(videoBlob);
        video.src = url;
     }
     reader.readAsArrayBuffer(file);
 }

 async function localvideo(event){
     t++;
     getVideo(event.target.files[0]);

    var video_chat = {
        "sender": username,
        "id":this_userid,
        "time": time,
        "room":document.querySelector(".room_name").id, 
        "file":"file",
        "status":"live",
        "filetype":"video",
        "filename":event.target.files[0].name
        }

    var options = {
        'constraints': {
            'mandatory': {
                'OfferToReceiveAudio': true,
                'OfferToReceiveVideo': true
            }
        }
    }

    socket.emit("room-file",video_chat);

    VideoStream = document.getElementById("streamed-video").captureStream(25);

    document.getElementById("streamed-video").onplay = function() {

        var stream = document.getElementById("streamed-video").captureStream(25);

        videotrack = stream.getVideoTracks()[0];
        
    };
    


    socket.on("request_video",(data)=>{
        stream_peer = new Peer();


        stream_peer.on('open', function(){
            stream_peer.call(data.signal, VideoStream ,options);
        });

        console.log(stream_peer.getSenders())


    });

    document.querySelector(".video_div_wrapper").setAttribute("style","display:flex");
    var message = document.createElement("DIV");
    message.id = "msg"+t;
    message.className = "y-chat";

    document.querySelector(`.main-chat`).appendChild(message);
    document.getElementById("msg"+t).innerHTML = `<p class="y-chat-msg"> 
                                                    <span class="y-chat-name">you</span>
                                                    <video src="" class="vid_stream_div"></video>
                                                    <span class="y-chat-time">${time}</span>
                                                    </p>
                                                    <span class="y-profile"></span>`;
    var objDiv = document.querySelector(`.main-chat`);
    objDiv.scrollTop = objDiv.scrollHeight;
    alertclose(event);
 }

 async function WatchStream(idr){

        const stream = await getstream();
        MyStream = stream;
        
        stream_peer = new Peer();

        stream_peer.on('open', function(id) {
            socket.emit("request_video",{"id":this_userid,"rcallid":idr,"signal":id});
        });

        stream_peer.on('call', function(call) {
            call.answer(MyStream);

            call.on('stream', function(stream) {
                const videoTracks = stream.getVideoTracks();
                const audioTracks = stream.getAudioTracks();
                if (videoTracks.length > 0) {
                    console.log(`Using video device: ${videoTracks[0].label}`);
                }
                if (audioTracks.length > 0) {
                    console.log(`Using audio device: ${audioTracks[0].label}`);
                }
                document.querySelector(".video_div_wrapper").setAttribute("style","display:flex");
                document.getElementById("streamed-video").srcObject = stream;
            });
        });
        
 }
