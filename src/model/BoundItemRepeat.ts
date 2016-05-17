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

    render(controller) {
        let finalValue = UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);
        if (!finalValue) {
            return;
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
        let treeWalker = document.createTreeWalker(this.parentElement,
            NodeFilter.SHOW_COMMENT,
            {acceptNode: function(node){
                if (node.nodeValue === self.beginCommentString) {
                return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }},
            false);

        /*function filter(node:Node) :any{
            if (node.nodeValue === self.beginCommentString) {
                return (NodeFilter.FILTER_ACCEPT);
            }
            return (NodeFilter.FILTER_SKIP);
        }*/

        function generateTempContainer():HTMLElement{
            let index = UkuleleUtil.searchHtmlTag(self.renderTemplate,"tr");
            if(index === -1){
                return document.createElement("div");
            }else{
                return document.createElement("tbody");
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
                    tempDiv.insertAdjacentHTML('beforeEnd', this.renderTemplate);
                    if (i === finalValue.length - 1) {
                        let childrenHTML = tempDiv.innerHTML;
                        blankDiv.insertAdjacentHTML('beforeBegin', childrenHTML);
                        commentNode.parentNode.removeChild(blankDiv);
                        tempDiv = null;
                        blankDiv = null;
                    }
                }

                let child:HTMLElement = commentNode.nextSibling as HTMLElement;
                for (let j = 0; j < finalValue.length; j++) {
                    child.removeAttribute("uku-repeat");
                    var Uku_Clazz = (<any>this.uku).constructor;
                    let ukulele:IUkulele = new Uku_Clazz(); //new Ukulele();
                    ukulele.parentUku = this.uku;
                    let compDef = ukulele.parentUku._internal_getDefinitionManager().getComponentsDefinition();
                    let compPool = ukulele.parentUku._internal_getDefinitionManager().getComponentsPool();
                    ukulele._internal_getDefinitionManager().setComponentsDefinition(compDef);
                    ukulele._internal_getDefinitionManager().setComponentsPool(compPool);
                    let sibling:HTMLElement = child.nextSibling as HTMLElement;
                    let itemType = typeof finalValue[j];
                    if(itemType === "object"){
                        ukulele.registerController(this.expression, finalValue[j]);
                    }else {
                        ukulele.registerController(this.expression, {'value':finalValue[j]});
                        let newOuterHtml = child.outerHTML.replace(new RegExp(this.expression,"gm"),this.expression+'.value');
                        child.insertAdjacentHTML('afterend',newOuterHtml);
                        let newItemDom:HTMLElement = child.nextSibling as HTMLElement;
                        child.parentNode.removeChild(child);
                        child = newItemDom;
                    }
                    ukulele._internal_dealWithElement(child);
                    child = sibling;
                }
            }
        }

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
    }
}
