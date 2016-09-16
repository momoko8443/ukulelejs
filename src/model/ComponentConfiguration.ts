export class ComponentConfiguration{
    template:string;
    dependentScripts:Array<string>;
    componentControllerScript:string;
    stylesheet:string;
    
    constructor(_template:string,_dependentScripts:Array<string>,_componentControllerScript:string,_stylesheet:string = undefined){
        this.template = _template;
        this.dependentScripts = _dependentScripts;
        this.componentControllerScript = _componentControllerScript;
        this.stylesheet = _stylesheet;
    }
}