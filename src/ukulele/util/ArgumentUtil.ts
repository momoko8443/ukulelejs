import {IUkulele} from "../core/IUkulele";
export class ArgumentUtil{
    static analyze(argumentString:string,uku:IUkulele):any{
        let re:RegExp = /^\{\{.*\}\}$/;
        argumentString = argumentString.replace(/'/g,'"');
        let tempArr:Array<string> = argumentString.split(",");
        for(let i=0;i<tempArr.length;i++){
            let arr = tempArr[i];
            for(let alias in uku._internal_getDefinitionManager().getControllersDefinition()){
                let index:number = arr.search(alias);
                let index2:number = arr.search("parent.");
                if(index > -1 || index2 > -1){
                    tempArr[i] = '"'+ arr +'"';
                }
            }
        }
        argumentString = tempArr.join(",");
        argumentString = '['+argumentString+']';
        try{
            let jsonArr:any = JSON.parse(argumentString);
            return jsonArr;
        }catch(e){
            console.error(e);
            return null;
        }
    }
}
