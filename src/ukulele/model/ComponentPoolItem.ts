export class ComponentPoolItem{
    tagName:string;
    templateUrl:string;
    lazy:boolean;
    
    constructor(_tagName,_templateUrl,_lazy){
        this.tagName = _tagName;
        this.templateUrl = _templateUrl;
        this.lazy = _lazy;
    }
}