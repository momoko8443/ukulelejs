/**
 * @author Huibin
 */
function ControllerModel(ctrlInst) {
    "use strict";
	this.controllerInstance = ctrlInst;
	this.boundAttrs = [];
	//以后重构到prototype中去
	this.addBoundAttr = function (boundAttr) {
		this.boundAttrs.push(boundAttr);
	};
	//以后重构到prototype中去
	this.getBoundAttrByName = function (name) {
		var boundAttrs = [];
		for (var i = 0; i < this.boundAttrs.length; i++) {
		  var boundAttr = this.boundAttrs[i];
		  if(boundAttr.attributeName === name) {
		  	boundAttrs.push(boundAttr);
		  }
		}
		return boundAttrs;
	};
}
