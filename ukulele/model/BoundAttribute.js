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
    var temp = this.attributeName.split(".");
    var finalValue = controller;
    for(var i=0 ;i<temp.length;i++){
        finalValue = finalValue[temp[i]];
    }
    this.element.attr(this.ukuTag,finalValue);
};

BoundAttribute.prototype.renderExpression = function (controller){
	this.element.directText(controller[this.attributeName]);
};

BoundAttribute.prototype.renderRepeat = function (controller){
    var self = this;
	this.parentElement.children().remove();
	for (var index in controller[this.attributeName]) {
        var item = controller[this.attributeName][index];
		var itemRender = $(this.renderTemplate).removeAttr("uku-repeat");
        this.parentElement.append(itemRender);
        
        var ukulele = new Ukulele();
        ukulele.registerController("item", MyController);
        ukulele.dealWithElement(itemRender);
        //deal with expression
		/*itemRender.parent().find("*:contains({{)").each(function(){
			var expression = $(this).directText();					
			if(expression.search("{{") > -1 && expression.search("}}")>-1){		
				var attr = expression.slice(2,-2);
                var temp = attr.split(".");
                if(temp[0] === self.expression){
                    var finalValue = item;
                    for(var i=1;i<temp.length;i++) {
                        finalValue = item[temp[i]];
                    }
                    $(this).directText(finalValue);
                }
								
			}	
		});
        //deal with attribute
        var subElements = [];
        //scan element which has uku-* tag
        itemRender.find("*").each(function(){
            var matchElement = $(this).fuzzyFind('uku-');
            if(matchElement){
                subElements.push(matchElement);
            }
        });*/
        
		
	}
};