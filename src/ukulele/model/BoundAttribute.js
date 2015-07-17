/**
 * @author Huibin
 */
function BoundAttribute(attrName, ukuTag, expression, element,parentUku) {
    "use strict";
    this.attributeName = attrName;
    this.ukuTag = ukuTag;
    this.expression = expression;
    this.element = element;
    this.renderTemplate = undefined;
    this.parentElement = undefined;
    this.parentUku = undefined;
    if (ukuTag === "repeat") {
        this.renderTemplate = element.prop("outerHTML");
        this.parentElement = element.parent();
        this.parentUku = parentUku;
    }
    this.previousSiblings = undefined;
    this.nextSiblings = undefined;
}
BoundAttribute.prototype.renderAttribute = function (controller) {
    var attr = this.attributeName;
    var key;
    var elementName = this.element[0].tagName;
    if(this.ukuTag === "selecteditem" && elementName === "SELECT"){
        var tempArr = this.attributeName.split("|");
        attr = tempArr[0];
        key = tempArr[1];
    }
    var finalValue = UkuleleUtil.getFinalValue(controller,attr);
    if(this.ukuTag.search('data-item') !== -1){
    	finalValue = JSON.stringify(finalValue);
        this.element.data('data-item',finalValue);
    }else if(this.ukuTag === "selecteditem" && elementName === "SELECT"){
        var value = finalValue[key];
        this.element.val(value);
    }else if(this.ukuTag === "value"){
        this.element.val(finalValue);
    }else{
        this.element.attr(this.ukuTag, finalValue);
    }    
};

BoundAttribute.prototype.renderExpression = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(controller,this.attributeName);
    this.element.directText(finalValue);
};

BoundAttribute.prototype.renderRepeat = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(controller,this.attributeName);
    if(!finalValue){
        return;
    }
    var index = $(this.element).index();
    if(index !== -1){
        this.previousSiblings = $(this.element).prevAll();
        this.nextSiblings = $(this.element).nextAll();
    }
    this.parentElement.children().remove();
    for(var p=0;p<this.previousSiblings.length;p++){
        this.parentElement.append(this.previousSiblings[p]);
    }
    for (var i in finalValue) {
        var item = finalValue[i];
        var itemRender = $(this.renderTemplate).removeAttr("uku-repeat");
        this.parentElement.append(itemRender);

        var ukulele = new Ukulele();
        ukulele.parentUku = this.parentUku;
        ukulele.registerController(this.expression, item);
        ukulele.dealWithElement(itemRender);     
    }
    for(var n=0;n<this.nextSiblings.length;n++){
        this.parentElement.append(this.nextSiblings[n]);
    }
    if(this.element[0].tagName === "OPTION"){
    	var expression = this.parentElement.attr("uku-selecteditem");
    	var tempArr = expression.split("|");
		expression = tempArr[0];
		key = tempArr[1];
    	var value = this.parentUku.getFinalValueByExpression(expression);
    	this.parentElement.val(value[key]);
    }
};