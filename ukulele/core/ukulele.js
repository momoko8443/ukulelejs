/**
 * @author momoko
 */

function Ukulele() {
    "use strict";
	this.controllersDefinition = {};
	this.viewControllerArray = [];
	var copyControllers = {};
	var self = this;
	var watchTimer;
    //心跳功能来判断bound的attribute有没有在内存中被更新，从而主动刷新视图
	var watchBoundAttribute = function() {
		for (var alias in self.controllersDefinition){
			var controllerModel = self.controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			
            for (var i = 0; i < controllerModel.boundAttrs.length; i++) {
            var boundAttr = controllerModel.boundAttrs[i];
            var arrtName = boundAttr.attributeName;
            if (previousCtrlModel) {
                var finalValue = getFinalValue(controller, arrtName);
                var previousFinalValue = getFinalValue(previousCtrlModel, arrtName);
                if (finalValue !== previousFinalValue) {
                    if (boundAttr.expression !== null) {
                        boundAttr.renderExpression(controller);
                    } else {
                        //2.与属性bind，目前理论上全属性支持
                        if (boundAttr.ukuTag !== "repeat") {
                            boundAttr.renderAttribute(controller);
                        } else {
                            //3.repeat的处理，先把repeat的render逻辑写在这里，以后移到各自的class
                            boundAttr.renderRepeat(controller);
                        }
                    }
                }
            }


            }
            
			previousCtrlModel = jQuery.extend(true, {}, controller);
			delete copyControllers[alias];
			copyControllers[alias] = previousCtrlModel;
		}
		watchTimer = setTimeout(watchBoundAttribute,5000);
	};
    
    function getFinalValue(object, attrName) {
        var temp = attrName.split(".");
        var finalValue = object;
        for (var i = 0; i < temp.length; i++) {
            finalValue = finalValue[temp[i]];
        }
        return finalValue;
    }
	//解析html中各个uku的tag
	var analyizeDOM = function(){
		analyizeController();
		function analyizeController(){
			$("[uku-application]").each(function(){
				var subElements = [];
                //scan element which has uku-* tag
				$(this).find("*").each(function(){
					var matchElement = $(this).fuzzyFind('uku-');
					if(matchElement){
						subElements.push(matchElement);
					}
				});
                              
				//解析绑定 attribute，注册event
				for(var i=0;i<subElements.length;i++){
					var subElement = subElements[i];
					for(var j=0;j<subElement.attributes.length;j++){
						var attribute = subElement.attributes[j];
						if(attribute.nodeName.search('uku-')>-1){
							var attrName = attribute.nodeName.split('-')[1];
							if(attrName.search('on') === 0){
								//is an event 
								//dealWithEvent($(subElement),attrName,controllerInst);
							}else if(attrName.search('repeat') !== -1){
                                //is an repeat
                                //dealWithRepeat($(subElement),controllerInst,controllerModel);
                            }else{
								//is an attribute
								dealWithAttribute($(subElement),attrName);
							}
						}
					} 
				}
				
				
                //scan element which has expression {{}} 
                $(this).find("*:contains({{)").each(function(){
                    var a = $(this).attr("uku-repeat");
                    var b = $(this).parents().fuzzyFind('uku-repeat');
                    var isRepeat = a || b;
                    if(!isRepeat){
                        //normal expression
                        //dealWithExpression($(this),controllerInst,controllerModel,isRepeat);
                    }	
				});
                
                //处理绑定的expression
                function dealWithExpression(element,controllerInst,controllerModel){
                    var expression = element.directText();					
                    if(expression.search("{{") > -1 && expression.search("}}")>-1){		
                        var attr = expression.slice(2,-2);
                       
                        
                        element.directText(controllerInst[attr]);
                        var boundAttr = new BoundAttribute(attr,null,expression,element);
                        controllerModel.addBoundAttr(boundAttr);	
                    }
                }
				
				//处理绑定的attribute
				function dealWithAttribute(element,tagName){
                    var attr = element.attr("uku-"+tagName);
                    var controllerModel = getBoundControllerModelByName(element,"uku-"+tagName);
                    var controllerInst = controllerModel.controllerInstance;
                    var temp = attr.split(".");
                    temp.shift();
                    var attr = temp.join(".");            
					element.attr(tagName,getFinalValue(controllerInst,attr));
					var boundAttr = new BoundAttribute(attr,tagName,null,element);
					controllerModel.addBoundAttr(boundAttr);			
					var elementName = element[0].tagName;
					if(elementName == "INPUT" && tagName == "value"){
						element.change(function(){
                            var finalInstance = controllerInst;
                            for(var i=0;i<temp.length-1;i++) {
                                finalInstance = finalInstance[temp[i]];
                            }
							finalInstance[temp[temp.length-1]] = element.val();
						});
					}
				}
				//处理 事件 event
				function dealWithEvent(element,eventName,controllerInst){
					var expression = element.attr("uku-"+eventName);
					var eventNameInJQuery = eventName.substring(2);
					var handlerName = expression.split("(")[0];
					element.bind(eventNameInJQuery,function(){
						controllerInst[handlerName]();
					});
				}
                
                //处理 repeat
                function dealWithRepeat(element,controllerInst,controllerModel){
                    var repeatExpression = element.attr("uku-repeat");
                    var tempArr = repeatExpression.split(' in ');
                    var itemName =  tempArr[0];
                    var attr = tempArr[1];
                    //var renderTemplate = element.prop("outerHTML");
                    var boundAttr = new BoundAttribute(attr,"repeat",itemName,element);
					controllerModel.addBoundAttr(boundAttr);
					boundAttr.renderRepeat(controllerInst);
                }
                
                function getBoundModelInstantName(element,attrName){
                    var boundAttr = element.attr(attrName);
                    var controlInstName = boundAttr.split('.')[0];
                    if(controlInstName){
                        return controlInstName;
                    }
                    return null;
                }
                function getBoundControllerModelByName(element,attrName){
                    var instanceName = getBoundModelInstantName(element,attrName);
                    var controllerModel = self.controllersDefinition[instanceName];
                    return controllerModel;
                }
                function getBoundControllerInstanceByName(element,attrName){
                    var controllerModel = getBoundControllerModelByName(element,attrName);
                    return controllerModel.controllerInstance;
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
		registerController:function(instanceName,constractor){
            var controllerInst = new constractor();
            self.viewControllerArray.push({"view":$(this),"controller":controllerInst});
            var controllerModel = new ControllerModel(controllerInst);
            self.controllersDefinition[instanceName] = controllerModel;
		}
	};
}


