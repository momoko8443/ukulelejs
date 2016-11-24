import {BountItemAttrSelected} from "../model/directive/BoundItemAttrSelected";
import {BoundItemAttrDataItem} from "../model/directive/BoundItemAttrDataItem";
import {BoundItemAttrSrc} from "../model/directive/BoundItemAttrSrc";
import {BoundItemAttrDisabled} from "../model/directive/BoundItemAttrDisabled";
import {BoundItemAttrRender} from "../model/directive/BoundItemAttrRender";
import {BoundItemAttrStyle} from "../model/directive/BoundItemAttrStyle";
import {BoundItemAttrValue} from "../model/directive/BoundItemAttrValue";
import {BoundItemAttrVisible} from "../model/directive/BoundItemAttrVisible";
import {BoundItemAttribute} from "../model/BoundItemAttribute";
export class BoundItemAttributeFactory{
    private static _instance = new BoundItemAttributeFactory();
    constructor(){
        if(BoundItemAttributeFactory._instance){
            throw new Error("Error: Instantiation failed: Use BoundItemAttributeFactory.getInstance() instead of new."); 
        }
        BoundItemAttributeFactory._instance = this;

    }
    static getInstance():BoundItemAttributeFactory{
        return BoundItemAttributeFactory._instance;
    }
    generateInstance(attr, tagName, element, uku){
        let instance;
        switch (tagName) {
            case "selected":
                instance = new BountItemAttrSelected(attr, tagName, element, uku);
                break;
            case "data-item":
                instance = new BoundItemAttrDataItem(attr, tagName, element, uku);
                break;
            case "src":
                instance = new BoundItemAttrSrc(attr, tagName, element, uku);
                break;
            case "disabled":
                instance = new BoundItemAttrDisabled(attr, tagName, element, uku);
                break;
            case "render":
                instance = new BoundItemAttrRender(attr, tagName, element, uku);
                break;
            case "style":
                instance = new BoundItemAttrStyle(attr, tagName, element, uku);
                break;
            case "value":
                instance = new BoundItemAttrValue(attr, tagName, element, uku);
                break;
            case "visible":
                instance = new BoundItemAttrVisible(attr, tagName, element, uku);
                break;
            default:
                instance = new BoundItemAttribute(attr, tagName, element, uku);
        }
        return instance;
    }
}