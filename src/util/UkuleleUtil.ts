import { Selector } from "../extend/Selector";
import { ComponentConfiguration } from "../model/ComponentConfiguration";
import { IUkulele } from "../core/IUkulele";
import { ControllerModel } from "../model/ControllerModel";
class ValueAndParent {
    value: any;
    parent: Object;
    constructor(_value: any, _parant: Object) {
        this.value = _value;
        this.parent = _parant;
    }
}
export class UkuleleUtil {

    static searchHtmlTag(htmlString: string, tagName: string): number {
        let reTemp: string = "^<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">$";
        let re: RegExp = new RegExp(reTemp);
        let index: number = htmlString.search(re);
        return index;
    }

    static getInnerHtml(htmlString: string, tagName: string): string {
        let reTemp: string = "<" + tagName + "[\\s\\S]*>" + "[\\s\\S]*</" + tagName + ">";
        let re: RegExp = new RegExp(reTemp);
        let match: RegExpMatchArray = htmlString.match(re);
        if (match.index > -1) {
            let matchString: string = match[0];
            let index: number = matchString.search(">");
            let tempString = matchString.substr(index + 1);
            let index2: number = tempString.lastIndexOf("</");
            tempString = tempString.substring(0, index2);
            tempString = tempString.replace(/(^\s*)|(\s*$)/g, "");
            return tempString;
        } else {
            return null;
        }
    }

    static getComponentConfiguration(htmlString: string): ComponentConfiguration {
        let tempDom: HTMLElement = document.createElement("div");
        tempDom.innerHTML = htmlString;
        let tpl: NodeList = Selector.querySelectorAll(tempDom, "template");
        let scripts: NodeList = Selector.querySelectorAll(tempDom, "script");
        let stylesheet: NodeList = Selector.querySelectorAll(tempDom, "style");
        let deps: Array<string> = [];
        let ccs: string = null;
        for (let i = 0; i < scripts.length; i++) {
            let script: HTMLScriptElement = scripts[i] as HTMLScriptElement;
            if (script.src !== "") {
                deps.push(script.src);
            } else {
                ccs = script.innerHTML;
            }
        }
        if (stylesheet && stylesheet[0]) {
            return new ComponentConfiguration((tpl[0] as HTMLElement).innerHTML, deps, ccs, (stylesheet[0] as HTMLElement).innerHTML);
        } else {
            return new ComponentConfiguration((tpl[0] as HTMLElement).innerHTML, deps, ccs);
        }

    }

    static searchUkuAttrTag(htmlString: string): number {
        let re: RegExp = /^uku\-.*/;
        let index: number = htmlString.search(re);
        return index;
    }

    static getAttrFromUkuTag(ukuTag: string, camelCase: boolean = false) {
        if (UkuleleUtil.searchUkuAttrTag(ukuTag) === 0) {
            ukuTag = ukuTag.replace('uku-', '');
        }
        if (camelCase) {
            let names: Array<string> = ukuTag.split('-');
            ukuTag = names[0];
            for (let i = 1; i < names.length; i++) {
                let firstLetter: string = names[i].charAt(0).toUpperCase();
                ukuTag = ukuTag + firstLetter + names[i].substr(1);
            }
        }
        return ukuTag;
    }

    static searchUkuExpTag(expression: string): number {
        let re: RegExp = /^\{\{.*\}\}$/;
        let index: number = expression.search(re);
        return index;
    }

    static searchUkuFuncArg(htmlString: string): number {
        let re1: RegExp = /[\+\-\*\/\%\?\:\>\<]/;
        let index = htmlString.search(re1);
        if (index === -1) {
            let re2: RegExp = /\(.*\)$/;
            index = htmlString.search(re2);
            return index;
        } else {
            return -1;
        }
    }

    static isRepeat(element: HTMLElement): boolean {
        if (element.getAttribute("uku-repeat")) {
            return true;
        }
        return false;
    }

    static isInRepeat(element: HTMLElement): boolean {
        let parents: Array<HTMLElement> = Selector.parents(element);
        for (let i = 0; i < parents.length; i++) {
            let parent: HTMLElement = parents[i] as HTMLElement;
            if (parent.nodeType !== 9) {
                let b: string = parent.getAttribute("uku-repeat");
                if (b) {
                    return true;
                }
            }
        }
        return false;
    }

    static getBoundModelInstantName(expression: string): string {
        let controlInstName: string = expression.split('.')[0];
        if (controlInstName) {
            return controlInstName;
        }
        return undefined;
    }

    static getBoundModelInstantNames(controller_alias_list, expression): any {
        let arr = [];
        controller_alias_list.forEach(alias => {
            let pattern = new RegExp("\\b" + alias, "gm");
            console.count('getBoundModelInstantNames执行的次数');
            if (expression.search(pattern) > -1) {
                arr.push(alias);
            }
        });
        return arr;
    }

    static getFinalValue(objects: Object[], attrName: string) {
        return (function () {
            var tempScope = {};
            objects.forEach(object => {
                tempScope[object['_alias']] = object;
                let alias = object['_alias'];
                let pattern = new RegExp("\\b" + alias + "\\b", "gm");
                attrName = attrName.replace(pattern, "tempScope." + alias);

                let pattern2 = new RegExp("\\.tempScope\\." + alias, "gm");
                attrName = attrName.replace(pattern2, "." + alias);

            });
            var result;
            try {
                result = eval(attrName);
            } catch (err) {
                result = '';
            }
            tempScope = null;
            return result;
        })();
    }

    static setFinalValue(object: Object, attrName: string, value: any) {
        return (function () {
            var tempScope = {};
            tempScope[object['_alias']] = object;

            let valueString;
            if (typeof value === "string") {
                valueString = '"' + value + '"';
            } else if (typeof value === "object") {
                valueString = "JSON.parse('" + JSON.stringify(value) + "')";
            } else {
                valueString = value;
            }

            let evalString = "tempScope." + attrName + "=" + valueString;
            eval(evalString);
        })();
    }

    static wrapScriptInComponent(originalScript): string {
        let trimScript = originalScript.replace(new RegExp('\\s', 'gm'), '');
        if (trimScript.search(new RegExp('\\(function\\(')) === 0) {
            return originalScript;
        } else {
            let selfExcutingFrame =
                `	(function(){
                        return function(uku){                
                            Object.defineProperty(this, 'currentState', {
                                set: function(value){
                                    if(value){
                                        this._currentState = value;
                                        uku.refresh(this._alias);
                                    }
                                }
                            });

                            this.setState = function(state){
                                this._currentState = state;
                                uku.refresh(this._alias);
                            };

                            ${originalScript}
                        };
                    })();
                `;
            return selfExcutingFrame;
        }
    }
}
