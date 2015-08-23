function Ajax(){

}

Ajax.prototype.get = function(url,success,error){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
       if (request.readyState===4){
           if (request.status===200){
               success(request.responseText);
           }else{
               if(error){
                   error();
               }             
           }
       }
    };
    request.open("GET",url,true);
    request.send(null);
};

