import {BoundItemBase} from "./BoundItemBase";
import {UkuleleUtil} from "../util/UkuleleUtil";
import {IUkulele} from "../core/IUkulele";

export class BoundItemRepeat extends BoundItemBase{
    expression:string;
    renderTemplate:string;
    parentElement:Node;
    beginCommentString:string;
    endCommentString:string;
    constructor(attrName, itemName, element, uku){
        super(attrName, element, uku);
        this.expression = itemName;
        this.renderTemplate = element.outerHTML;
        this.parentElement = element.parentNode;
        this.beginCommentString = undefined;
        this.endCommentString = undefined;
    }

    replaceVarible(element:HTMLElement, varName, alias){
        let pattern = new RegExp("\\b"+ varName + "(?!\\w)","gm");
        let attributes = element.attributes;
        for(let i=0; i<attributes.length; i++){
            let attr = attributes[i];
            if(UkuleleUtil.isUkuAttrTag(attr.nodeName)){
                attr.nodeValue = attr.nodeValue.replace(pattern, alias);
            }
        }
        let childTag = element.innerHTML.match(new RegExp("\\<\\w*.*\\>","gm"))
        let innerText = element.innerHTML.match(new RegExp("\\{{[\\w\\W]*\\}\\}","gm"));
        if(childTag === null
            && innerText !== null
            && innerText.length === 1){
            element.textContent = element.textContent.replace(pattern, alias);
        }
        if(element.children && element.children.length > 0){
            for(let j=0; j<element.children.length; j++){
                let child:HTMLElement = element.children[j] as HTMLElement;
                this.replaceVarible(child, varName, alias);
            }    
        }
    }

    render(controllers) {
        let finalValue = UkuleleUtil.getFinalValue(controllers, this.attributeName);
        if (!finalValue) {
            return;
        }
        if(typeof finalValue === "number" && Math.floor(finalValue) === finalValue){
            //finalValue = 
            let newFinalValue = [];
            for(let num=1; num <= finalValue; num++){
                //let item = {value: num};
                newFinalValue.push(num);
            }
            finalValue = newFinalValue;
        }

        let self = this;
        if (this.element && this.element.parentNode) {
            //create repeate begin comment
            this.beginCommentString = "begin uku-repeat: " + this.expression + " in " + this.attributeName;
            let beginComment = document.createComment(this.beginCommentString);
            this.element.parentNode.insertBefore(beginComment, this.element);
            //create repeate end comment
            this.endCommentString = "end uku-repeat: " + this.expression + " in " + this.attributeName;
            let endComment = document.createComment(this.endCommentString);
            this.element.parentNode.insertBefore(endComment, this.element.nextSibling);
            //remove definition dom
            this.element.parentNode.removeChild(this.element);
        }
        let filter:NodeFilter = {acceptNode: function(node){
            if (node.nodeValue === self.beginCommentString) {
                return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
        }};
        let safeFilter:any = filter.acceptNode;
        safeFilter.acceptNode = filter.acceptNode;
        let treeWalker = document.createTreeWalker(this.parentElement,
            NodeFilter.SHOW_COMMENT,
            safeFilter,
            false);

        function generateTempContainer():HTMLElement{
            let index = UkuleleUtil.searchHtmlTag(self.renderTemplate,"tr");
            let index2 = UkuleleUtil.searchHtmlTag(self.renderTemplate,"th");
            if(index === -1 || index2 === -1 ){
                return document.createElement("tbody");
            }else{
                return document.createElement("div");
            }
        }

        while (treeWalker.nextNode()) {
            let commentNode = treeWalker.currentNode;
            if (commentNode && commentNode.nodeValue === this.beginCommentString) {
                //remove overtime dom.
                while (commentNode.nextSibling && commentNode.nextSibling.nodeValue !== this.endCommentString) {
                    commentNode.parentNode.removeChild(commentNode.nextSibling);
                }
                //create new dom
                let tempDiv = generateTempContainer();
                let blankDiv = generateTempContainer();
                commentNode.parentNode.insertBefore(blankDiv, commentNode.nextSibling);
                for (let i = 0; i < finalValue.length; i++) {
                    tempDiv.insertAdjacentHTML('beforeEnd' as InsertPosition, this.renderTemplate);
                    if (i === finalValue.length - 1) {
                        let childrenHTML = tempDiv.innerHTML;
                        blankDiv.insertAdjacentHTML('beforeBegin' as InsertPosition, childrenHTML);
                        commentNode.parentNode.removeChild(blankDiv);
                        tempDiv = null;
                        blankDiv = null;
                    }
                }

                let child:HTMLElement = (commentNode as HTMLElement).nextElementSibling as HTMLElement;
                let time = new Date().getTime();
                for (let j = 0; j < finalValue.length; j++) {
                    child.removeAttribute("uku-repeat");
                    let compDef = this.uku._internal_getDefinitionManager().getComponentsDefinition();
                    let compPool = this.uku._internal_getDefinitionManager().getComponentsPool();
                    this.uku._internal_getDefinitionManager().setComponentsDefinition(compDef);
                    this.uku._internal_getDefinitionManager().setComponentsPool(compPool);
                    let sibling:HTMLElement = child.nextSibling as HTMLElement;
                    let itemType = typeof finalValue[j];
                    let alias =  "repeatItem_"+Math.floor(time * Math.random()).toString() + "_" + this.expression + "$";
                    if(itemType === "object"){
                        this.uku.registerController(alias, finalValue[j]);
                    }else {
                        this.uku.registerController(alias, {'value':finalValue[j]});
                        alias = alias + ".value";
                    }
                    this.replaceVarible(child,this.expression,alias);
                    child.insertAdjacentHTML('afterend',child.outerHTML);
                    let newItemDom:HTMLElement = child.nextSibling as HTMLElement;
                    child.parentNode.removeChild(child);
                    child = newItemDom;
                    this.uku._internal_dealWithElement(child,(element)=>{
                        if (this.element.tagName === "OPTION") {
                            let expression = (this.parentElement as HTMLInputElement).getAttribute("uku-selected");
                            let tempArr = expression.split("|");
                            expression = tempArr[0];
                            let key = tempArr[1];
                            let value = this.uku._internal_getDefinitionManager().getFinalValueByExpression(expression);
                            if (key) {
                                (this.parentElement as HTMLInputElement).value = value[key];
                            } else {
                                (this.parentElement as HTMLInputElement).value = value;
                            }
                        }
                    });
                    child = sibling;
                }
            }
        }
    }
}
