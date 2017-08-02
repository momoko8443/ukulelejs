import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";
//import {SelectedDecorator} from "./decorator/SelectedDecorator";
export class BoundItemAttribute extends BoundItemBase{
    ukuTag:string;
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        super(attrName,element,uku);
        this.ukuTag = ukuTag;
    }
    
    render(controllers):void{
        let attr:string = this.attributeName;
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controllers,attr);
        this.element.setAttribute(this.ukuTag, finalValue);
    }
}
