import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";

export class BoundItemInnerText extends BoundItemBase{
    constructor(attrName, element, uku){
        super(attrName,element,uku);
        this.tagName = 'text';
    }

    render(controller) {
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
        this.element.innerHTML = finalValue;
    }
}
