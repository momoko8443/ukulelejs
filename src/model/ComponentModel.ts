export class ComponentModel{
    tagName:string;
    template:string;
    controllerClazz:Function;
    constructor(tagName,template,clazz){
        this.tagName = tagName;
        this.template = template;
        this.controllerClazz = clazz;
    }
}
