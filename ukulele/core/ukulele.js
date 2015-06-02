/**
 * @author momoko
 */

function Ukulele(){
	this.controllersDefinition = {};
	this.viewControllerArray = [];
	var copyControllers = {};
	var self = this;
	var watchTimer;
	var watchBoundAttribute = function(){
		for(alias in self.controllersDefinition){
			var controllerDefinition = self.controllersDefinition[alias];
			var controller = controllerDefinition.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			//目前暂时所有属性都遍历，以后优化只遍历bound的属性
			for(var attrName in controller){			
				if(previousCtrlModel && controller[attrName] !== previousCtrlModel[attrName]){
					//console.log(attrName+"has changed, old value is "+previousCtrlModel[attrName] + " and new value is "+controller[attrName]);
					var boundAttrs = controllerDefinition.getBoundAttrByName(attrName);
					for (var i=0; i < boundAttrs.length; i++) {
						var boundAttr = boundAttrs[i];
						if(boundAttr.ukuTag === "value"){
							boundAttr.element.val(controller[attrName]);
						}
						if(boundAttr.expression !== null){
							boundAttr.element.directText(controller[attrName]);
						}
						
					}
				}
			}
			previousCtrlModel = jQuery.extend(true, {}, controller);
			delete copyControllers[alias];
			copyControllers[alias] = previousCtrlModel;
		}
		watchTimer = setTimeout(watchBoundAttribute,100);
	};
	
	var analyizeDOM = function(){
		analyizeController();
		function analyizeController(){
			$("[uku-controller]").each(function(){
				var subElements = [];
				$(this).find("*").each(function(){
					var matchElement = $(this).fuzzyFind('uku-');
					if(matchElement){
						subElements.push(matchElement);
					}
				});
				var alias = $(this).attr('uku-controller');
				var clazz = self.controllersDefinition[alias];
				var controllerInst = new clazz();
				self.viewControllerArray.push({"view":$(this),"controller":controllerInst});
				var controllerModel = new ControllerModel(controllerInst);
				self.controllersDefinition[alias] = controllerModel;
				//解析绑定 attribute，注册event
				for(var i=0;i<subElements.length;i++){
					var subElement = subElements[i];
					for(var j=0;j<subElement.attributes.length;j++){
						var attribute = subElement.attributes[j];
						if(attribute.nodeName.search('uku-')>-1){
							var attrName = attribute.nodeName.split('-')[1];
							if(attrName.search('on') == 0){
								//is an event 
								dealWithEvent($(subElement),attrName,controllerInst);
							}else{
								//is an attribute
								dealWithAttribute($(subElement),attrName,controllerInst,controllerModel);
							}
						}
					} 
				}
				
				//解析，绑定expression in html
				$(this).find("*:contains({{)").each(function(){
					var expression = $(this).directText();					
					if(expression.search("{{") > -1 && expression.search("}}")>-1){		
						var attr = expression.slice(2,-2);
						$(this).directText(controllerInst[attr]);
						var boundAttr = new BoundAttribute(attr,null,expression,$(this));
						controllerModel.addBoundAttr(boundAttr);	
					}
				});
				
				function dealWithAttribute(element,attrName,_controllerInst,_controllerModel){
					var attr = element.attr("uku-"+attrName);
					element.attr(attrName,_controllerInst[attr]);
					var boundAttr = new BoundAttribute(attr,attrName,null,element);
					_controllerModel.addBoundAttr(boundAttr);			
					var elementName = element[0].tagName;
					if(elementName == "INPUT" && attrName == "value"){
						element.change(function(){
							_controllerInst[attr] = element.val();
						});
					}
				}
				
				function dealWithEvent(element,eventName,_controllerInst){
					var expression = element.attr("uku-"+eventName);
					var eventNameInJQuery = eventName.substring(2);
					var handlerName = expression.split("(")[0];
					element.bind(eventNameInJQuery,function(){
						_controllerInst[handlerName]();
					});
				}						
			});
		}
	};
	
	return {
		init:function(){
			$(document).ready(function(){
				analyizeDOM();
				watchBoundAttribute();
			});
		},
		registerController:function(alias,constractor){
			self.controllersDefinition[alias] = constractor;
		}
	};
}


