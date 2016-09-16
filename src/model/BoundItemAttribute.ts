import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";

export class BoundItemAttribute extends BoundItemBase{
    ukuTag:string;
    constructor(attrName:string, ukuTag:string, element:HTMLElement, uku:any){
        super(attrName,element,uku);
        this.ukuTag = ukuTag;
    }

    render(controller) :void{
        let attr:string = this.attributeName;
        let key:string;
        let elementName:string = this.element.tagName;
        if(this.ukuTag === "selected" && elementName === "SELECT"){
            let tempArr:Array<string> = this.attributeName.split("|");
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
            (this.element as HTMLSelectElement).value = value;
        }else if(this.element.getAttribute("type") === "checkbox"){
    		(this.element as HTMLInputElement).checked = finalValue;
    	}
    	else if(this.ukuTag === "value"){
            (this.element as HTMLInputElement).value = finalValue;
        }
        else if(this.element.getAttribute("type") === "radio"){
            if((this.element as HTMLInputElement).value === finalValue){
                (this.element as HTMLInputElement).setAttribute("checked","true");
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
    	}else if(this.ukuTag === "visible"){
            if(finalValue){
                this.element.style.visibility = "visible";
            }else{
                this.element.style.visibility = "hidden";
            }
        }else if(this.ukuTag === "render"){
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
        else{
            if(this.ukuTag === "disabled"){
                (this.element as HTMLInputElement).disabled = finalValue;
            }else{
                this.element.setAttribute(this.ukuTag, finalValue);
            }
        }
    }
}
