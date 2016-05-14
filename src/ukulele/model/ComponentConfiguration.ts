export class ComponentConfiguration{
    template:string;
    dependentScripts:Array<string>;
    componentControllerScript:string;
    
    constructor(_template:string,_dependentScripts:Array<string>,_componentControllerScript:string){
        this.template = _template;
        this.dependentScripts = _dependentScripts;
        this.componentControllerScript = _componentControllerScript;
    }
}