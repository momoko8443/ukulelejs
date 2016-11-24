import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrVisible extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "visible"){
            throw new TypeError("it doesn't use uku-visible");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controller):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,attr);
        if(finalValue){
            this.element.style.visibility = "visible";
        }else{
            this.element.style.visibility = "hidden";
        }
    }
}