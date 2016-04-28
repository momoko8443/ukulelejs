export class ArgumentUtil{
    static analyze(argumentString,uku){
        let re = /^\{\{.*\}\}$/;
        argumentString = argumentString.replace(/'/g,'"');
        let tempArr = argumentString.split(",");
        for(let i=0;i<tempArr.length;i++){
            let arr = tempArr[i];
            for(let alias in uku._internal_getDefinitionManager().getControllersDefinition()){
                let index = arr.search(alias);
                let index2 = arr.search("parent.");
                if(index > -1 || index2 > -1){
                    tempArr[i] = '"'+ arr +'"';
                }
            }
        }
        argumentString = tempArr.join(",");
        argumentString = '['+argumentString+']';
        try{
            let jsonArr = JSON.parse(argumentString);
            return jsonArr;
        }catch(e){
            console.error(e);
            return;
        }
    }
}
