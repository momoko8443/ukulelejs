import {IUkulele} from "../core/IUkulele";
export class BoundItemBase{
    attributeName:string;
    element:HTMLElement;
    uku:IUkulele;
    constructor(_attrName:string, _element:HTMLElement, _uku:IUkulele){
        this.attributeName = _attrName;
        this.element = _element;
        this.uku = _uku;
    }
}
