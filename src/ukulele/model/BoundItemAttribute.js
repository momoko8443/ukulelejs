function BoundItemAttribute(attrName, ukuTag, element, uku){
    BoundItemBase.call(this,attrName,element,uku);
    this.ukuTag = ukuTag;
}

BoundItemAttribute.prototype = new BoundItemBase();
BoundItemAttribute.prototype.constructor = BoundItemAttribute;

BoundItemAttribute.prototype.render = function (controller) {
    var attr = this.attributeName;
    var key;
    var elementName = this.element.tagName;
    if(this.ukuTag === "selected" && elementName === "SELECT"){
        var tempArr = this.attributeName.split("|");
        attr = tempArr[0];
        key = tempArr[1];
    }
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,attr);
    
    
    if(this.ukuTag.search('data-item') !== -1){
    	finalValue = JSON.stringify(finalValue);
        this.element.setAttribute('data-item',finalValue);
    }else if(this.ukuTag === "selected" && elementName === "SELECT"){
    	var value;
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
        /*if(!finalValue){
            this.element.setAttribute(this.ukuTag,UkuleleUtil.blankImg);
        }else{
            this.element.setAttribute(this.ukuTag,finalValue);
        }*/
    }
    else{
        if(this.ukuTag === "disabled"){
            this.element.disabled = finalValue;
        }else{
            this.element.setAttribute(this.ukuTag, finalValue);
        }    
    }    
};