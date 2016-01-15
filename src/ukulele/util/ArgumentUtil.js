function ArgumentUtil(){
    'use strict';
}
ArgumentUtil.analyze = function(argumentString,uku){
    var re = /^\{\{.*\}\}$/;
    argumentString = argumentString.replace(/'/g,'"');
    var tempArr = argumentString.split(",");
    for(var i=0;i<tempArr.length;i++){
        var arr = tempArr[i];
        for(var alias in uku.getControllersDefinition()){
            var index = arr.search(alias);
            var index2 = arr.search("parent.");
            if(index > -1 || index2 > -1){
                tempArr[i] = '"'+ arr +'"';
            }
        }
    }
    argumentString = tempArr.join(",");
    argumentString = '['+argumentString+']';
    try{
        var jsonArr = JSON.parse(argumentString);
        return jsonArr;
    }catch(e){
        console.error(e);
        return;
    }
};
