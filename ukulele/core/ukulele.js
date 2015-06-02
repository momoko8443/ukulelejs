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
			var controllerDefinition = self.controllersDefinition[alias];
			var controller = controllerDefinition.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			//目前暂时所有属性都遍历，以后优化只遍历bound的属性
			for (var attrName in controller){			
				if(previousCtrlModel && controller[attrName] !== previousCtrlModel[attrName]){
					var boundAttrs = controllerDefinition.getBoundAttrByName(attrName);
					for (var i=0; i < boundAttrs.length; i++) {
						var boundAttr = boundAttrs[i];
                        //处理3种情况
                        //1.html text是{{}}表达式,现在暂时只支持简单赋值，暂不支持运算符
                        if(boundAttr.expression !== null){
							boundAttr.element.directText(controller[attrName]);
						}else{
                            //2.与属性bind，目前理论上全属性支持
                            if(boundAttr.ukuTag !== "repeat"){
                                boundAttr.element.attr(boundAttr.ukuTag,controller[attrName]);
                            }else{
                                //3.repeat的处理，先把repeat的render逻辑写在这里，以后移到各自的class
                                for (var item in controller[attrName]) {
                                    var itemRender = element.removeAttr("uku-repeat");       
                                }
                            }
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
	//解析html中各个uku的tag
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
							if(attrName.search('on') === 0){
								//is an event 
								dealWithEvent($(subElement),attrName,controllerInst);
							}else if(attrName.search('repeat') !== -1){
                                //is an repeat
                                dealWithRepeat($(subElement),controllerInst,controllerModel);
                            }else{
								//is an attribute
								dealWithAttribute($(subElement),attrName,controllerInst,controllerModel);
							}
						}
					} 
				}
				
				//解析，绑定expression in html
				$(this).find("*:contains({{)").each(function(){
                    var isRepeat = $(this).filter("[uku-repeat]") || $(this).parents("[uku-repeat]");
                    if(!isRepeat){
                        var expression = $(this).directText();					
                        if(expression.search("{{") > -1 && expression.search("}}")>-1){		
                            var attr = expression.slice(2,-2);
                            $(this).directText(controllerInst[attr]);
                            var boundAttr = new BoundAttribute(attr,null,expression,$(this));
                            controllerModel.addBoundAttr(boundAttr);	
                        }
                    }	
				});
				//处理绑定的attribute
				function dealWithAttribute(element,tagName,controllerInst,controllerModel){
					var attr = element.attr("uku-"+tagName);
					element.attr(tagName,controllerInst[attr]);
					var boundAttr = new BoundAttribute(attr,tagName,null,element);
					controllerModel.addBoundAttr(boundAttr);			
					var elementName = element[0].tagName;
					if(elementName == "INPUT" && tagName == "value"){
						element.change(function(){
							controllerInst[attr] = element.val();
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


