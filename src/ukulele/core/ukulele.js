/**
 * Create a new Ukulele
 * @class
 */

function Ukulele() {
	"use strict";
	var controllersDefinition = {};
	var componentsDefinition = {};
	var copyControllers = {};
	var self = this;
	/**
	 * @access a callback function when view was refreshed.
	 */
	this.refreshHandler = null;

	/**
	 * @access a callback function when view was initialized.
	 */
	this.initHandler = null;
	/**
	 * @access When using uku-repeat, parentUku to reference the Parent controller model's uku
	 */
	this.parentUku = null;

	this.getComponentsDefinition = function(){
        return componentsDefinition;
    };
    this.setComponentsDefinition = function(value){
        componentsDefinition = value;
    };

	this.init = function () {
		if(ajaxCounter > 0){
			setTimeout(this.init,200);
		}else{
			manageApplication();
		}
	};
	/**
	 * @description Register a controller model which you want to bind with view
	 * @param {string} instanceName controller's alias
	 * @param {object}  controllerInst controller's instance
	 */
	this.registerController = function (instanceName, controllerInst) {
		var controllerModel = new ControllerModel(instanceName, controllerInst);
		controllerInst._alias = instanceName;
		controllersDefinition[instanceName] = controllerModel;
	};
	/**
	 * @description deal with partial html element you want to manage by UkuleleJS
	 * @param {object} $element jquery html object e.g. $("#myButton")
	 * @param {boolean} watch whether refresh automatically or not
	 */
	this.dealWithElement = function (element) {
		analyizeElement(element);
	};
	/**
	 * @description deal with the uku-include componnent which need be to lazy loaded.
	 * @param {object} element dom
	 */
	this.loadIncludeElement = function (element) {
		if (element.getAttribute("load") === "false") {
			element.setAttribute("load", true);
			analyizeElement(element.parentNode);
		}
	};
	/**
	 * @description get the controller model's instance by alias.
	 * @param {object} expression  controller model's alias.
	 * @returns {object} controller model's instance
	 */
	this.getControllerModelByName = function (expression) {
		return getBoundControllerModelByName(expression);
	};
	/**
	 * @description refresh the view manually, e.g. you can call refresh in sync request's callback.
	 */
	this.refresh = function (alias) {
		runDirtyChecking(alias);
	};
	/**
	 * @description get value by expression
	 * @param {string} expression
	 */
	this.getFinalValueByExpression = function (expression) {
		var controller = this.getControllerModelByName(expression).controllerInstance;
		return UkuleleUtil.getFinalValue(this, controller, expression);
	};
	/**
	 * @description register component is ukujs
	 * @param {string} tag component's tag in html e.g 'user-list' (<user-list></user-list>)
	 * @param {string} templateUrl component's url
	 */
	var ajax;
	var ajaxCounter = 0;
	this.registerComponent = function (tag,templateUrl){
		if(!ajax){
			ajax = new Ajax();
		}
		ajaxCounter++;
		ajax.get(templateUrl,function(result){
			var componentTemplate = UkuleleUtil.getInnerHtml(result,'template');
			var script = UkuleleUtil.getInnerHtml(result,'script');
			script = '('+script+")";
			var controllerClazz = eval(script);
			var newComp = new ComponentModel(tag, componentTemplate,controllerClazz);
			componentsDefinition[tag] = newComp;
			ajaxCounter--;
		});
	};

	//脏检测
	function runDirtyChecking(ctrlAliasName, excludeElement) {
		if (ctrlAliasName) {
			if (typeof (ctrlAliasName) === "string") {
				watchController(ctrlAliasName);
			} else if (ObjectUtil.isArray(ctrlAliasName)) {
				for (var i = 0; i < ctrlAliasName.length; i++) {
					watchController(ctrlAliasName[i]);
				}
			}
		} else {
			for (var alias in controllersDefinition) {
				watchController(alias);
			}
		}

		function watchController(alias) {
			var controllerModel = controllersDefinition[alias];
			if (!controllerModel) {
				if (self.parentUku) {
					self.parentUku.refresh(alias);
				}
				return;
			}
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = copyControllers[alias];
			for (var i = 0; i < controllerModel.boundItems.length; i++) {
				var boundItem = controllerModel.boundItems[i];
				var attrName = boundItem.attributeName;
				if (previousCtrlModel) {
					if (boundItem.ukuTag === "selected") {
						attrName = attrName.split("|")[0];
					}
					var finalValue = UkuleleUtil.getFinalValue(self, controller, attrName);
					var previousFinalValue = UkuleleUtil.getFinalValue(self, previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						attrName = boundItem.attributeName;
						var changedBoundItems = controllerModel.getBoundItemsByName(attrName);
						for (var j = 0; j < changedBoundItems.length; j++) {
							var changedBoundItem = changedBoundItems[j];
							if(changedBoundItem.element !== excludeElement){
								changedBoundItem.render(controller);
							}
						}
						if (self.refreshHandler) {
							self.refreshHandler.call(self);
						}
					}
				}
			}
			copyControllerInstance(controller, alias);
		}
	}

	function copyAllController() {
		for (var alias in controllersDefinition) {
			var controllerModel = controllersDefinition[alias];
			var controller = controllerModel.controllerInstance;
			copyControllerInstance(controller, alias);
		}
	}

	function copyControllerInstance(controller, alias) {
		var previousCtrlModel = ObjectUtil.deepClone(controller);
		delete copyControllers[alias];
		copyControllers[alias] = previousCtrlModel;
	}


	//解析html中各个uku的tag
	function analyizeElement(element) {
		var onloadHandlerQueue = [];
		searchIncludeTag(element, function () {
			element = searchComponent(element);
			var subElements = [];
			//scan element which has uku-* tag
			var isSelfHasUkuTag = Selector.fuzzyFind(element, 'uku-');
			if (isSelfHasUkuTag) {
				subElements.push(isSelfHasUkuTag);
			}
			var allChildren = element.querySelectorAll("*");
			for (var i = 0; i < allChildren.length; i++) {
				var child = allChildren[i];
				var matchElement = Selector.fuzzyFind(child, 'uku-');
				if (matchElement && !UkuleleUtil.isInRepeat(matchElement)) {
					subElements.push(matchElement);
				}
			}
			searchExpression(element);
			//解析绑定 attribute，注册event
			for (var n = 0; n < subElements.length; n++) {
				var subElement = subElements[n];
				var orderAttrs = sortAttributes(subElement);
				for (var j = 0; j < orderAttrs.length; j++) {
					var attribute = orderAttrs[j];
					if (UkuleleUtil.searchUkuAttrTag(attribute.nodeName) > -1) {
						var tempArr = attribute.nodeName.split('-');
						tempArr.shift();
						var attrName = tempArr.join('-');
						if (attrName !== "application") {
							if (attrName.search('on') === 0) {
								//is an event
								if (!UkuleleUtil.isRepeat(subElement) && !UkuleleUtil.isInRepeat(subElement)) {
									dealWithEvent(subElement, attrName);
								}
							} else if (attrName.search('repeat') !== -1) {
								//is an repeat
								dealWithRepeat(subElement);
							} else {
								//is an attribute
								if (!UkuleleUtil.isRepeat(subElement) && !UkuleleUtil.isInRepeat(subElement)) {
									if (attrName !== "text") {
										dealWithAttribute(subElement, attrName);
									} else {
										dealWithInnerText(subElement);
									}

								}
							}
						}
					}
				}
			}
			copyAllController();
			while (onloadHandlerQueue.length > 0) {
				var handler = onloadHandlerQueue.pop();
				handler.func.apply(this, handler.args);
			}
			if (self.refreshHandler) {
				self.refreshHandler.call(self);
			}
			if (self.initHandler) {
				self.initHandler.call(self, element);
			}


			function sortAttributes(subElement) {
				var orderAttrs = [];
				for (var i = 0; i < subElement.attributes.length; i++) {
					var attribute = subElement.attributes[i];
					if (attribute.nodeName.search("uku-on") !== -1) {
						orderAttrs.push(attribute);
					} else {
						orderAttrs.unshift(attribute);
					}
				}
				return orderAttrs;
			}
		});

		function isComponent(element){
			for(var key in componentsDefinition){
				if(element.localName === key){
					return key;
				}
			}
			return null;
		}

		function searchComponent(element) {
			var key = isComponent(element);
			if(key){
				if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
					var attrs = element.attributes;
                    var compDef = componentsDefinition[key];
                    element = dealWithComponent(element,compDef.template,compDef.controllerClazz,attrs);
			    }
			}else{
				for (var i = 0; i < element.children.length; i++) {
					var child = element.children[i];
					searchComponent(child);
				}
			}
			return element;


			function dealWithComponent(tag,template,Clazz,attrs) {
				var randomAlias = 'cc_'+Math.floor(10000 * Math.random()).toString();
				template = template.replace(new RegExp('cc.','gm'),randomAlias+'.');
				tag.insertAdjacentHTML('beforeBegin', template);
				var htmlDom = tag.previousElementSibling;
				var cc = new Clazz(self);
				cc._dom = htmlDom;
                cc.fire = function(eventType,data){
                    var event = document.createEvent('HTMLEvents');
                    event.initEvent("on"+eventType.toLowerCase(), true, true);
                    event.data = data;
                    cc._dom.dispatchEvent(event);
                };
				self.registerController(randomAlias,cc);
				for(var i=0;i<attrs.length;i++){
					var attr = attrs[i];
					if(UkuleleUtil.searchUkuAttrTag(attr.nodeName) !== 0){
						htmlDom.setAttribute(attr.nodeName,attr.nodeValue);
					}else{
						var tagName = UkuleleUtil.getAttrFromUkuTag(attr.nodeName,true);
						var controllerModel = getBoundControllerModelByName(attr.nodeValue);
						if (controllerModel) {
							var boundItem = new BoundItemComponentAttribute(attr.nodeValue, tagName, cc, self);
							controllerModel.addBoundItem(boundItem);
							boundItem.render(controllerModel.controllerInstance);
						}
					}
				}
				tag.parentNode.removeChild(tag);
				for (var j = 0; j < htmlDom.children.length; j++) {
					var child = htmlDom.children[j];
					searchComponent(child);
				}
				return htmlDom;
			}
		}

		function searchIncludeTag(element, retFunc) {
			var tags = element.querySelectorAll('.uku-include');
			var index = 0;
			if (index < tags.length) {
				dealWithInclude(index);
			} else {
				retFunc();
			}

			function dealWithInclude(index) {
				var tag = tags[index];
				var isLoad = tag.getAttribute("load");
				if (isLoad === "false") {
					index++;
					if (index < tags.length) {
						dealWithInclude(index);
					} else {
						retFunc();
					}
				} else {
					var src = tag.getAttribute("src");
					var replace = tag.getAttribute("replace");
					var replaceController = tag.getAttribute("replace-controller");
					var ajax = new Ajax();
					if (replace && replace === "true") {
						(function (x) {
							ajax.get(src, function (html) {
								if (replaceController) {
									html = doReplace(html, replaceController);
								}
								x.insertAdjacentHTML('beforeBegin', html);
								var htmlDom = x.previousElementSibling;
								x.parentNode.removeChild(x);
								onloadHandlerQueue.push({
									'func': runOnLoadFunc,
									'args': [x, htmlDom]
								});
								//searchComponent(htmlDom);
								searchIncludeTag(htmlDom, function () {
									index++;
									if (index < tags.length) {
										dealWithInclude(index);
									} else {
										retFunc();
									}
								});
							});
						})(tag);

					} else {
						(function (x) {
							ajax.get(src, function (html) {
								if (replaceController) {
									html = doReplace(html, replaceController);
								}
								x.insertAdjacentHTML('afterBegin', html);
								x.classList.remove('uku-include');
								onloadHandlerQueue.push({
									'func': runOnLoadFunc,
									'args': [x]
								});
								//searchComponent(x.children[0]);
								searchIncludeTag(x, function () {
									index++;
									if (index < tags.length) {
										dealWithInclude(index);
									} else {
										retFunc();
									}
								});
							});
						})(tag);
					}
				}

				function runOnLoadFunc(hostElement, replaceElement) {
					var expression = hostElement.getAttribute("uku-onload");
					if (expression) {
						if (replaceElement) {
							getBoundAttributeValue(expression, [replaceElement]);
						} else {
							getBoundAttributeValue(expression, [hostElement]);
						}
					}
				}

				function doReplace(html, replaceController) {
					var tempArr = replaceController.split("|");
					if (tempArr && tempArr.length === 2) {
						var oldCtrl = tempArr[0];
						var newCtrl = tempArr[1];
						html = html.replace(new RegExp(oldCtrl, "gm"), newCtrl);
						return html;
					} else {
						return html;
					}
				}
			}
		}

		//scan element which has expression {{}}
		function searchExpression(element) {
			if (UkuleleUtil.searchUkuExpTag(Selector.directText(element)) !== -1) {
				if (!UkuleleUtil.isRepeat(element) && !UkuleleUtil.isInRepeat(element)) {
					//normal expression
					dealWithExpression(element);
				}
			}
			for (var i = 0; i < element.children.length; i++) {
				searchExpression(element.children[i]);
			}
		}
		//处理绑定的expression
		function dealWithExpression(element) {
			//通常的花括号声明方式
			var expression = Selector.directText(element);
			if (UkuleleUtil.searchUkuExpTag(expression) !== -1) {
				var attr = expression.slice(2, -2);
				var controllerModel = getBoundControllerModelByName(attr);
				if (controllerModel) {
					var boundItem = new BoundItemExpression(attr, expression, element, self);
					controllerModel.addBoundItem(boundItem);
					boundItem.render(controllerModel.controllerInstance);
				}
			}
		}
		//处理绑定的attribute
		function dealWithAttribute(element, tagName) {
			var attr = element.getAttribute("uku-" + tagName);
			var elementName = element.tagName;
			var controllerModel = getBoundControllerModelByName(attr);
			if (controllerModel) {
				var boundItem = new BoundItemAttribute(attr, tagName, element, self);
				controllerModel.addBoundItem(boundItem);
				boundItem.render(controllerModel.controllerInstance);
				elementChangedBinder(element, tagName, controllerModel, runDirtyChecking);
			}
		}

		//
		function dealWithInnerText(element) {
			var attr = element.getAttribute("uku-text");
			if (attr) {
				var controllerModel = getBoundControllerModelByName(attr);
				if (controllerModel) {
					var boundItem = new BoundItemInnerText(attr, element, self);
					controllerModel.addBoundItem(boundItem);
					boundItem.render(controllerModel.controllerInstance);
				}
			}
		}

		//处理 事件 event
		function dealWithEvent(element, eventName) {
			var expression = element.getAttribute("uku-" + eventName);
			var eventNameInListener = eventName.substring(2);
			var controllerModel = getBoundControllerModelByName(expression);
			if (controllerModel) {
				var controller = controllerModel.controllerInstance;
				var temArr = expression.split(".");
				var alias;
				if (temArr[0] === "parent") {
					alias = temArr[1];
				} else {
					alias = temArr[0];
				}
				element.addEventListener(eventNameInListener, function (event) {
					copyControllerInstance(controller, alias);
					getBoundAttributeValue(expression, arguments);
					runDirtyChecking(alias, element);
				});
			}
		}
		//处理 repeat
		function dealWithRepeat(element) {
			var repeatExpression = element.getAttribute("uku-repeat");
			var tempArr = repeatExpression.split(' in ');
			var itemName = tempArr[0];
			var attr = tempArr[1];
			var controllerModel = getBoundControllerModelByName(attr);
			if (controllerModel) {
				var controllerInst = controllerModel.controllerInstance;
				var boundItem = new BoundItemRepeat(attr, itemName, element, self);
				controllerModel.addBoundItem(boundItem);
				boundItem.render(controllerInst);
			}
		}
	}

	//根据attrName 确定对应的ControllerModel ，比如  parent.mgr.xxx.yyy来找到以mgr为别名的ControllerModel
	function getBoundControllerModelByName(attrName) {
		var instanceName = UkuleleUtil.getBoundModelInstantName(attrName);
		var controllerModel = controllersDefinition[instanceName];
		if (!controllerModel) {
			var tempArr = attrName.split(".");
			var isParentScope = tempArr[0];
			if (isParentScope === "parent" && self.parentUku) {
				tempArr.shift();
				attrName = tempArr.join(".");
				return self.parentUku.getControllerModelByName(attrName);
			}
		}
		return controllerModel;
	}

	function getBoundAttributeValue(attr, additionalArgu) {
		var controllerModel = getBoundControllerModelByName(attr);
		var controllerInst = controllerModel.controllerInstance;
		var result = UkuleleUtil.getFinalValue(self, controllerInst, attr, additionalArgu);
		return result;
	}

	function manageApplication() {
		var apps = document.querySelectorAll("[uku-application]");
		if (apps.length === 1) {
			analyizeElement(apps[0]);
		} else {
			throw new Error("Only one 'uku-application' can be declared in a whole html.");
		}
	}
}
