import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrSrc extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "src"){
            throw new TypeError("it doesn't use uku-src");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controllers):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(controllers,attr);
        if(elementName === "IMG"){
    		if(finalValue){
                this.element.setAttribute(this.ukuTag,finalValue);
            }
    	}else{
            throw new Error("uku-src doesn't work with current dom");
        }
    }
}