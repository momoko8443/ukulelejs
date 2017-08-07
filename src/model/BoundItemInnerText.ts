import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {IUkulele} from "../core/IUkulele";
export class BoundItemInnerText extends BoundItemBase{
    tagName:string;
    constructor(attrName:string, element:HTMLElement, uku:IUkulele){
        super(attrName,element,uku);
        this.tagName = 'text';
    }

    render(controllers):void {
        let finalValue = UkuleleUtil.getFinalValue(controllers,this.attributeName);
        this.element.innerHTML = finalValue;
    }
}
