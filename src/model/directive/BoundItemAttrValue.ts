import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrValue extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "value"){
            throw new TypeError("it doesn't use uku-value");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controller):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,attr);
        if(elementName === "INPUT" && this.element.getAttribute("type") === "checkbox"){
    		(this.element as HTMLInputElement).checked = finalValue;
    	}
    	else{
            (this.element as HTMLInputElement).value = finalValue;
        }
    }
}