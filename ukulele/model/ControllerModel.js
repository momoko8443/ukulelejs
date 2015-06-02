/**
 * @author Huibin
 */
function ControllerModel(_ctrlInst){
	this.controllerInstance = _ctrlInst;
	this.boundAttrs = [];	
	//以后重构到prototype中去
	this.addBoundAttr = function(_boundAttr){
		this.boundAttrs.push(_boundAttr);
	};
	//以后重构到prototype中去
	this.getBoundAttrByName = function(_name){
		var boundAttrs = [];
		for (var i=0; i < this.boundAttrs.length; i++) {
		  var boundAttr = this.boundAttrs[i];
		  if(boundAttr.attributeName === _name){
		  	boundAttrs.push(boundAttr);
		  }
		}
		return boundAttrs;
	};
}
