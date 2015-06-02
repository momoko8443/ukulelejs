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
    if(ukuTag === "repeat"){
        this.renderTemplate = element.prop("outerHTML");
        this.parentElement = element.parent();
    }
}
