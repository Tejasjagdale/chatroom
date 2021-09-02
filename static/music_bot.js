getsong=()=>{
    var key = "AIzaSyDlfCU-Zsp9_gDLnTQnq0ptVB1_hvFb_LA";
    var search = "";

    $.ajax({ 
         url: `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${key}&type=video&q=onmyway&maxResults=1`,
         type: 'GET',

         success: function(data){
            console.log(data)
         }
         ,error: function(err){
             alert("something went wrong!",err);
         }
      });
  }