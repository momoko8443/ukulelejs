import {BoundItemAttribute} from "../BoundItemAttribute";
import {UkuleleUtil} from "../../util/UkuleleUtil";

export class BoundItemAttrRender extends BoundItemAttribute{
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        if(ukuTag !== "render"){
            throw new TypeError("it doesn't use uku-render");
        }
        super(attrName,ukuTag,element,uku);
    }
    render(controller):void{
        let attr:string = this.attributeName;
        let elementName:string = this.element.tagName;
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,attr);
        if(finalValue){
            let oldDisplaySetting = this.element.getAttribute("data-old-display");
            if(oldDisplaySetting !== null){
                this.element.style.display = oldDisplaySetting;
            }
        }else{
            let oldDisplaySetting = this.element.getAttribute("data-old-display");
            if(oldDisplaySetting === null){
                oldDisplaySetting = this.element.style.display;
                this.element.setAttribute("data-old-display",oldDisplaySetting);
            }
            this.element.style.display = "none";
        }
    }
}