function BoundItemRepeat(attrName, itemName, element, uku) {
    BoundItemBase.call(this, attrName, element, uku);
    //this.ukuTag = "repeat";
    this.expression = itemName;

    this.renderTemplate = element.outerHTML;
    this.parentElement = element.parentNode;

    this.beginCommentString = undefined;
    this.endCommentString = undefined;
}

BoundItemRepeat.prototype = new BoundItemBase();
BoundItemRepeat.prototype.constructor = BoundItemRepeat;

BoundItemRepeat.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku, controller, this.attributeName);

    if (!finalValue) {
        return;
    }

    var self = this;
    if (this.element && this.element.parentNode) {
        //create repeate begin comment
        this.beginCommentString = "begin uku-repeat: " + this.expression + " in " + this.attributeName;
        var beginComment = document.createComment(this.beginCommentString);
        this.element.parentNode.insertBefore(beginComment, this.element);
        //create repeate end comment
        this.endCommentString = "end uku-repeat: " + this.expression + " in " + this.attributeName;
        var endComment = document.createComment(this.endCommentString);
        this.element.parentNode.insertBefore(endComment, this.element.nextSibling);
        //remove definition dom
        this.element.parentNode.removeChild(this.element);

    }
    var treeWalker = document.createTreeWalker(this.parentElement,
        NodeFilter.SHOW_COMMENT,
        filter,
        false);

    function filter(node) {
        if (node.nodeValue === self.beginCommentString) {
            return (NodeFilter.FILTER_ACCEPT);
        }
        return (NodeFilter.FILTER_SKIP);
    }

    function generateTempContainer(){
        var index = UkuleleUtil.searchHtmlTag(self.renderTemplate,"tr");
        if(index === -1){
            return document.createElement("div");
        }else{
            return document.createElement("tbody");
        }
    }

    while (treeWalker.nextNode()) {
        var commentNode = treeWalker.currentNode;
        if (commentNode && commentNode.nodeValue === this.beginCommentString) {
            //remove overtime dom.
            while (commentNode.nextSibling && commentNode.nextSibling.nodeValue !== this.endCommentString) {
                commentNode.parentNode.removeChild(commentNode.nextSibling);
            }
            //create new dom
            var tempDiv = generateTempContainer();
            var blankDiv = generateTempContainer();
            commentNode.parentNode.insertBefore(blankDiv, commentNode.nextSibling);
            for (var i = 0; i < finalValue.length; i++) {

                tempDiv.insertAdjacentHTML('beforeEnd', this.renderTemplate);
                if (i === finalValue.length - 1) {
                    var childrenHTML = tempDiv.innerHTML;
                    blankDiv.insertAdjacentHTML('beforeBegin', childrenHTML);
                    commentNode.parentNode.removeChild(blankDiv);
                    tempDiv = null;
                    blankDiv = null;
                }
            }

            var child = commentNode.nextSibling;
            for (var j = 0; j < finalValue.length; j++) {
                child.removeAttribute("uku-repeat");
                var ukulele = new Ukulele();
                ukulele.parentUku = this.uku;
                var compDef = ukulele.parentUku.getComponentsDefinition();
                ukulele.setComponentsDefinition(compDef);
                ukulele.registerController(this.expression, finalValue[j]);
                ukulele.dealWithElement(child);
                child = child.nextSibling;
            }
        }
    }

    if (this.element.tagName === "OPTION") {
        var expression = this.parentElement.getAttribute("uku-selected");
        var tempArr = expression.split("|");
        expression = tempArr[0];
        key = tempArr[1];
        var value = this.uku.getFinalValueByExpression(expression);
        if (key) {
            this.parentElement.value = value[key];
        } else {
            this.parentElement.value = value;
        }
    }
};
