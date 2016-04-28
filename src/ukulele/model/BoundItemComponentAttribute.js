import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";

export class BoundItemComponentAttribute extends BoundItemBase{
    constructor(attrName, ukuTag, cc, uku){
        super(attrName,null,uku);
        this.ukuTag = ukuTag;
        this.componentController = cc;
    }
    render(controller) {
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
        this.componentController[this.ukuTag] = finalValue;
        this.uku.refresh(this.componentController._alias);
    }
}
