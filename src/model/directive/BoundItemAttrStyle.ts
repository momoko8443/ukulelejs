import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrStyle extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "style"){
            throw new TypeError("it doesn't use uku-style");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controllers):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controllers,attr);
        for(let cssName in finalValue){
            this.element.style[cssName] = finalValue[cssName];
        }
    }
}