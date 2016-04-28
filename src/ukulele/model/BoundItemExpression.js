import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {Selector} from "../extend/Selector";

export class BoundItemExpression extends BoundItemBase{
    constructor(attrName, expression, element, uku){
        super(attrName,element,uku);
        this.expression = expression;
    }

    render(controller) {
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
        Selector.directText(this.element,finalValue);
    }
}
