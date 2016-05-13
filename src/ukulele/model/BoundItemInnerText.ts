import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {IUkulele} from "../core/IUkulele";
export class BoundItemInnerText extends BoundItemBase{
    tagName:string;
    constructor(attrName:string, element:HTMLElement, uku:IUkulele){
        super(attrName,element,uku);
        this.tagName = 'text';
    }

    render(controller):void {
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
        this.element.innerHTML = finalValue;
    }
}
