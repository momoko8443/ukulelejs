/**
 * @author momoko
 */

function Ukulele() {
	"use strict";
	this.controllersDefinition = {};
	this.viewControllerArray = [];
	this.refreshHandler = undefined;
	var copyControllers = {};
	var self = this;
	var watchTimer;
	//心跳功能来判断bound的attribute有没有在内存中被更新，从而主动刷新视图
	function watchBoundAttribute() {
		for (var alias in self.controllersDefinition) {
			var controllerModel = self.controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			for (var i = 0; i < controllerModel.boundAttrs.length; i++) {
				var boundAttr = controllerModel.boundAttrs[i];
				var attrName = boundAttr.attributeName;
				if (previousCtrlModel) {
					var finalValue = ObjectUtil.getFinalValue(controller, attrName);
					var previousFinalValue = ObjectUtil.getFinalValue(previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						var changedBoundAttrs = controllerModel.getBoundAttrByName(attrName);
						for (var j = 0; j < changedBoundAttrs.length; j++) {
							var changedBoundAttr = changedBoundAttrs[j];
							if (changedBoundAttr.ukuTag === "repeat") {
								//1.repeat的处理，先把repeat的render逻辑写在这里，以后移到各自的class
								changedBoundAttr.renderRepeat(controller);
							} else if (changedBoundAttr.expression !== null) {
								//2. 处理expression
								changedBoundAttr.renderExpression(controller);
							} else {
								//3. 与属性attribute bind，目前理论上全属性支持
								changedBoundAttr.renderAttribute(controller);
							}
							if (self.refreshHandler) {
								self.refreshHandler.call(null);
							}
						}
					}
				}

			}
			previousCtrlModel = ObjectUtil.deepClone(controller);
			delete copyControllers[alias];
			copyControllers[alias] = previousCtrlModel;
		}
		watchTimer = setTimeout(watchBoundAttribute, 500);
	}

	var manageApplication = function() {
		$("[uku-application]").each(function() {
			analyizeElement($(this));
		});

	};

	//解析html中各个uku的tag
	var analyizeElement = function($element) {
		var subElements = [];
		//scan element which has uku-* tag
		var isSelfHasUkuTag = $element.fuzzyFind('uku-');
		if (isSelfHasUkuTag) {
			subElements.push(isSelfHasUkuTag);
		}
		$element.find("*").each(function() {
			var matchElement = $(this).fuzzyFind('uku-');
			if (matchElement && !UkuleleUtil.isInRepeat($(matchElement))) {
				subElements.push(matchElement);
			}
		});
		searchExpression($element);

		//解析绑定 attribute，注册event
		for (var i = 0; i < subElements.length; i++) {
			var subElement = subElements[i];
			for (var j = 0; j < subElement.attributes.length; j++) {
				var attribute = subElement.attributes[j];
				if (attribute.nodeName.search('uku-') > -1) {
					var attrName = attribute.nodeName.split('-')[1];
					if (attrName !== "application") {
						if (attrName.search('on') === 0) {
							//is an event
							if (!UkuleleUtil.isRepeat($(subElement)) && !UkuleleUtil.isInRepeat($(subElement))) {
								dealWithEvent($(subElement), attrName);
							}

						} else if (attrName.search('repeat') !== -1) {
							//is an repeat
							dealWithRepeat($(subElement));
						} else {
							//is an attribute
							if (!UkuleleUtil.isRepeat($(subElement)) && !UkuleleUtil.isInRepeat($(subElement))) {
								dealWithAttribute($(subElement), attrName);
							}

						}
					}

				}
			}
		}
		if (self.refreshHandler) {
			self.refreshHandler.call(null);
		}
		//scan element which has expression {{}}
		function searchExpression($element) {
			if ($element.directText().search("{{") !== -1) {
				if (!UkuleleUtil.isRepeat($element) && !UkuleleUtil.isInRepeat($element)) {
					//normal expression
					dealWithExpression($element);
				}
			}
			$element.children().each(function() {
				searchExpression($(this));
			});
		}

		//处理绑定的expression
		function dealWithExpression(element) {

			var expression = element.directText();
			if (expression.search("{{") > -1 && expression.search("}}") > -1) {
				var attr = expression.slice(2, -2);
				var controllerModel = getBoundControllerModelByName(attr);
				var controllerInst = controllerModel.controllerInstance;
				attr = UkuleleUtil.getFinalAttribute(attr);
				element.directText(ObjectUtil.getFinalValue(controllerInst, attr));
				var boundAttr = new BoundAttribute(attr, null, expression, element);
				controllerModel.addBoundAttr(boundAttr);
			}
		}

		//处理绑定的attribute
		function dealWithAttribute(element, tagName) {
			var attr = element.attr("uku-" + tagName);
			var controllerModel = getBoundControllerModelByName(attr);
			var controllerInst = controllerModel.controllerInstance;
			attr = UkuleleUtil.getFinalAttribute(attr);
			element.attr(tagName, ObjectUtil.getFinalValue(controllerInst, attr));
			var boundAttr = new BoundAttribute(attr, tagName, null, element);
			controllerModel.addBoundAttr(boundAttr);
			var elementName = element[0].tagName;
			if (elementName === "INPUT" && tagName === "value") {
				element.change(function() {
					var temp = attr.split(".");
					var finalInstance = controllerInst;
					for (var i = 0; i < temp.length - 1; i++) {
						finalInstance = finalInstance[temp[i]];
					}
					finalInstance[temp[temp.length - 1]] = element.val();
				});
			}
		}

		//处理 事件 event
		function dealWithEvent(element, eventName) {
			var expression = element.attr("uku-" + eventName);
			var controllerModel = getBoundControllerModelByName(expression);
			var controllerInst = controllerModel.controllerInstance;

			var eventNameInJQuery = eventName.substring(2);

			var re = /\(.*\)/;
			var index = expression.search(re);
			var functionName = expression.substring(0, index);
			functionName = UkuleleUtil.getFinalAttribute(functionName);
			var finalValueObject = ObjectUtil.getAttributeFinalValue2(controllerInst, functionName);
			var finalValue = finalValueObject.value;
			var _arguments = expression.substring(index + 1, expression.length - 1);
			_arguments = _arguments.split(",");

			element.bind(eventNameInJQuery, function() {

				var new_arguments = [];
				for (var i = 0; i < _arguments.length; i++) {
					var argument = _arguments[i];
					var temp = ObjectUtil.getFinalValue(controllerInst, argument);
					new_arguments.push(temp);
				}
				finalValue.apply(finalValueObject.parent, new_arguments.concat(arguments));
			});
		}

		//处理 repeat
		function dealWithRepeat(element) {
			var repeatExpression = element.attr("uku-repeat");
			var tempArr = repeatExpression.split(' in ');
			var itemName = tempArr[0];
			var attr = tempArr[1];
			var controllerModel = getBoundControllerModelByName(attr);
			var controllerInst = controllerModel.controllerInstance;
			attr = UkuleleUtil.getFinalAttribute(attr);
			var boundAttr = new BoundAttribute(attr, "repeat", itemName, element);
			controllerModel.addBoundAttr(boundAttr);
			boundAttr.renderRepeat(controllerInst);
		}


		function getBoundControllerModelByName(attrName) {
			var instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
			var controllerModel = self.controllersDefinition[instanceName];
			return controllerModel;
		}

	};

	return {
		init : function() {
			$(document).ready(function() {
				manageApplication();
				watchBoundAttribute();
			});
		},
		registerController : function(instanceName, controllerInst) {
			self.viewControllerArray.push({
				"view" : $(this),
				"controller" : controllerInst
			});
			var controllerModel = new ControllerModel(controllerInst);
			self.controllersDefinition[instanceName] = controllerModel;
		},
		dealWithElement : function($element, watch) {
			analyizeElement($element);
			if (watch) {
				watchBoundAttribute();
			}
		},
		refreshHandler : function(handler) {
			self.refreshHandler = handler;
		}
	};
}