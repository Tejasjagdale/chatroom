getsong=(query)=>{
    var key = "AIzaSyDlfCU-Zsp9_gDLnTQnq0ptVB1_hvFb_LA";

    $.ajax({ 
         url: `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${key}&type=audio&q=${query}&maxResults=1`,
         type: 'GET',

         success: function(data){
            const link = `http://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
            $.ajax({ 
                url: `/rhythm`,
                type: 'POST',
                data: {"link":link,"title":data.items[0].snippet.title},
       
                success: async (data) =>{
                    var rhythm =  new Audio(`./Main Room/${data.title}.mp3`);
                    rhythm.play()
                }
                ,error: function(err){
                    alert("something went wrong!",err);
                }
             });
         }
         ,error: function(err){
             alert("something went wrong!",err);
         }
      });
}

