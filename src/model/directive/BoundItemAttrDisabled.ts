import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrDisabled extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "disabled"){
            throw new TypeError("it doesn't use uku-disabled");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controllers):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(controllers,attr);
        (this.element as HTMLInputElement).disabled = finalValue;
    }
}