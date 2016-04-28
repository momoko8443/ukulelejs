import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";

export class BoundItemAttribute extends BoundItemBase{
    constructor(attrName, ukuTag, element, uku){
        super(attrName,element,uku);
        this.ukuTag = ukuTag;
    }

    render(controller) {
        let attr = this.attributeName;
        let key;
        let elementName = this.element.tagName;
        if(this.ukuTag === "selected" && elementName === "SELECT"){
            let tempArr = this.attributeName.split("|");
            attr = tempArr[0];
            key = tempArr[1];
        }
        let finalValue = UkuleleUtil.getFinalValue(this.uku,controller,attr);


        if(this.ukuTag.search('data-item') !== -1){
        	finalValue = JSON.stringify(finalValue);
            this.element.setAttribute('data-item',finalValue);
        }else if(this.ukuTag === "selected" && elementName === "SELECT"){
        	let value;
        	if(key){
        		value = finalValue[key];
        	}else{
        		value = finalValue;
        	}
            this.element.value = value;
        }else if(this.element.getAttribute("type") === "checkbox"){
    		this.element.checked = finalValue;
    	}
    	else if(this.ukuTag === "value"){
            this.element.value = finalValue;
        }
        else if(this.element.getAttribute("type") === "radio"){
            if(this.element.value === finalValue){
                this.element.setAttribute("checked",true);
            }
        }
        else if(this.element.nodeName === "IMG" && this.ukuTag === "src"){
            if(finalValue){
                this.element.setAttribute(this.ukuTag,finalValue);
            }
        }
    	else if(this.ukuTag === "style"){
    		for(let cssName in finalValue){
    			this.element.style[cssName] = finalValue[cssName];
    		}
    	}
        else{
            if(this.ukuTag === "disabled"){
                this.element.disabled = finalValue;
            }else{
                this.element.setAttribute(this.ukuTag, finalValue);
            }
        }
    }
}
