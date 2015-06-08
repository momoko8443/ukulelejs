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
    var watchBoundAttribute = function () {
        for (var alias in self.controllersDefinition) {
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
        watchTimer = setTimeout(watchBoundAttribute, 500);
    };

    function getFinalValue(object, attrName) {
        var temp = attrName.split(".");
        var finalValue = object;
        for (var i = 0; i < temp.length; i++) {
            finalValue = finalValue[temp[i]];
        }
        return finalValue;
    }

    function getFinalAttr(attrName) {
        var temp = attrName.split(".");
        temp.shift();
        return temp.join(".");
    }
    var manageApplication = function () {
        $("[uku-application]").each(function () {
            analyizeElement($(this));
        });

    };
    
    function isRepeat($element){
        if ($element.attr("uku-repeat")) {
            return true;
        }
        return false;
    }
    
    function isInRepeat($element) {
        var parents = $element.parents();
        for (var i = 0; i < parents.length; i++) {
            var parent = parents[i];
            var b = $(parent).attr("uku-repeat");
            if (b) {
                return true;
            }
        }
        return false;
    }
        //解析html中各个uku的tag    
    var analyizeElement = function ($element) {
        var subElements = [];
        //scan element which has uku-* tag
        $element.find("*").each(function () {
            var matchElement = $(this).fuzzyFind('uku-');
            if (isRepeat($(matchElement)) && !isInRepeat($(matchElement))) {
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
                    if (attrName.search('on') === 0) {
                        //is an event 
                        if (!isRepeat($(subElement)) && !isInRepeat($(subElement))) {
                            dealWithEvent($(subElement), attrName);
                        }

                    } else if (attrName.search('repeat') !== -1) {
                        //is an repeat
                        dealWithRepeat($(subElement));
                    } else {
                        //is an attribute
                        if (!isRepeat($(subElement)) && !isInRepeat($(subElement))) {
                            dealWithAttribute($(subElement), attrName);
                        }

                    }
                }
            }
        }
        //scan element which has expression {{}} 
        function searchExpression($element) {
            if ($element.directText().search("{{") != -1) {
                if (!isRepeat($element) && !isInRepeat($element)) {
                    //normal expression
                    dealWithExpression($element);
                }
            }
            $element.children().each(function () {
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
                attr = getFinalAttr(attr);
                element.directText(getFinalValue(controllerInst, attr));

                var boundAttr = new BoundAttribute(attr, null, expression, element);
                controllerModel.addBoundAttr(boundAttr);
            }
        }

        //处理绑定的attribute
        function dealWithAttribute(element, tagName) {
                var attr = element.attr("uku-" + tagName);
                var controllerModel = getBoundControllerModelByName(attr);
                var controllerInst = controllerModel.controllerInstance;
                attr = getFinalAttr(attr);
                element.attr(tagName, getFinalValue(controllerInst, attr));
                var boundAttr = new BoundAttribute(attr, tagName, null, element);
                controllerModel.addBoundAttr(boundAttr);
                var elementName = element[0].tagName;
                if (elementName == "INPUT" && tagName == "value") {
                    element.change(function () {
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
            var handlerName = expression.split("(")[0];
            handlerName = getFinalAttr(handlerName);
            element.bind(eventNameInJQuery, function () {
                var functionName;
                var handlerHost;
                var temp = handlerName.split(".");
                if (temp.length == 1) {
                    functionName = handlerName;
                    handlerHost = controllerInst;
                } else {
                    alert("current version does not support deep function definition");
                }
                handlerHost[functionName]();
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
            attr = getFinalAttr(attr);
            var boundAttr = new BoundAttribute(attr, "repeat", itemName, element);
            controllerModel.addBoundAttr(boundAttr);
            boundAttr.renderRepeat(controllerInst);
        }

        function getBoundModelInstantName(attrName) {
            var controlInstName = attrName.split('.')[0];
            if (controlInstName) {
                return controlInstName;
            }
            return null;
        }

        function getBoundControllerModelByName(attrName) {
            var instanceName = getBoundModelInstantName(attrName);
            var controllerModel = self.controllersDefinition[instanceName];
            return controllerModel;
        }
    }

    return {
        init: function () {
            $(document).ready(function () {
                manageApplication();
                watchBoundAttribute();
            });
        },
        registerController: function (instanceName, controllerInst) {
            self.viewControllerArray.push({
                "view": $(this),
                "controller": controllerInst
            });
            var controllerModel = new ControllerModel(controllerInst);
            self.controllersDefinition[instanceName] = controllerModel;
        },
        dealWithElement: function ($element) {
            analyizeElement($element);
            watchBoundAttribute();
        }
    };
}