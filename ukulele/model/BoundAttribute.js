/**
 * @author Huibin
 */
function BoundAttribute(attrName, ukuTag, expression, element) {
    "use strict";
    this.attributeName = attrName;
    this.ukuTag = ukuTag;
    this.expression = expression;
    this.element = element;
    this.renderTemplate;
    this.parentElement;
    if (ukuTag === "repeat") {
        this.renderTemplate = element.prop("outerHTML");
        this.parentElement = element.parent();
    }
}
BoundAttribute.prototype.renderAttribute = function (controller) {
    this.element.attr(this.ukuTag,controller[this.attributeName]);
};

BoundAttribute.prototype.renderExpression = function (controller){
	this.element.directText(controller[this.attributeName]);
};

BoundAttribute.prototype.renderRepeat = function (controller){
	this.parentElement.children().remove();
	for (var item in controller[this.attributeName]) {
		var itemRender = $(this.renderTemplate).removeAttr("uku-repeat");
		itemRender.find("*:contains({{)").each(function(){
			var expression = $(this).directText();					
			if(expression.search("{{") > -1 && expression.search("}}")>-1){		
				var attr = expression.slice(2,-2);
				$(this).directText(item[attr]);				
			}	
		});
		this.parentElement.append(itemRender);
	}
};