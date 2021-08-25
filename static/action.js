// Search bar code

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

