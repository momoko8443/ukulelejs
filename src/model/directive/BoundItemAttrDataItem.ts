import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrDataItem extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "data-item"){
            throw new TypeError("it doesn't use uku-item");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controllers):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(controllers,attr);
        if(elementName === "OPTION"){
        	finalValue = JSON.stringify(finalValue);
            this.element.setAttribute('data-item',finalValue);
        }
    }
}