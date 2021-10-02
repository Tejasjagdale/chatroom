getsong = (query) => {
  var key = "AIzaSyDlfCU-Zsp9_gDLnTQnq0ptVB1_hvFb_LA";

  $.ajax({
    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${key}&type=audio&q=${query}&maxResults=1`,
    type: "GET",

    success: function (data) {
      const link = `http://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
      $.ajax({
        url: `/rhythm`,
        type: "POST",
        data: { link: link, title: data.items[0].snippet.title },

        success: async (data) => {
            console.log(data);
          var rhythm = new Audio(`./Main Room/${data.title}.mp3`);
          rhythm.play();
        },
        error: function (err) {
          alert("something went wrong!", err);
        },
      });
    },
    error: function (err) {
      alert("something went wrong!", err);
    },
  });
};

var box = document.querySelector(".Bots_cmd");

box.addEventListener("touchmove", function (e) {
  var touchLocation = e.targetTouches[0];

  if ((parseInt(touchLocation.pageY)/innerHeight)*100 >= 0 && (parseInt(touchLocation.pageY)/innerHeight)*100 <= 88) {
    box.style.top = (parseInt(touchLocation.pageY)/innerHeight)*100+"%";
  }
});

dragElement(document.querySelector(".bots_cube"));

function dragElement(elmnt) {
  var pos2 = 0, pos4 = 0;
  if (elmnt) {
    elmnt.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    pos2 = pos4 - e.clientY;
    pos4 = e.clientY;

    if((document.querySelector(".Bots_cmd").offsetTop - pos2) >= 4 && (document.querySelector(".Bots_cmd").offsetTop - pos2) <= (innerHeight-innerHeight/3.5)){
        document.querySelector(".Bots_cmd").style.top = (document.querySelector(".Bots_cmd").offsetTop - pos2) + "px";
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
