import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BountItemAttrSelected extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "selected"){
            throw new TypeError("it doesn't use uku-selected");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controllers):void{
        let attr:string = this.attributeName;
        let key:string;
        let elementName:string = this.element.tagName;
        if(elementName === "SELECT"){
            let tempArr:Array<string> = this.attributeName.split("|");
            attr = tempArr[0];
            key = tempArr[1];
            let finalValue = UkuleleUtil.getFinalValue(this.uku,controllers,attr);
            let value;
        	if(key){
        		value = finalValue[key];
        	}else{
        		value = finalValue;
        	}
            (this.element as HTMLSelectElement).value = value;
        }

        if(elementName === "INPUT" && this.element.getAttribute("type") === "radio"){
            let finalValue = UkuleleUtil.getFinalValue(this.uku,controllers,attr);
            if((this.element as HTMLInputElement).value === finalValue){
                (this.element as HTMLInputElement).setAttribute("checked","true");
            }
        } 
    }
}