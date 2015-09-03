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

    while (treeWalker.nextNode()) {
        var commentNode = treeWalker.currentNode;
        if (commentNode && commentNode.nodeValue === this.beginCommentString) {
            //remove overtime dom.
            while (commentNode.nextSibling && commentNode.nextSibling.nodeValue !== this.endCommentString) {
                commentNode.parentNode.removeChild(commentNode.nextSibling);
            }
            //create new dom
            var tempDiv;
            for (var i = 0; i < finalValue.length; i++) {
                if (i === 0 && !tempDiv) {
                    tempDiv = document.createElement("div");
                    commentNode.parentNode.insertBefore(tempDiv, commentNode.nextSibling);
                }
                var item = finalValue[i];
                tempDiv.insertAdjacentHTML('beforeBegin', this.renderTemplate);
                var itemRender = tempDiv.previousSibling;
                itemRender.removeAttribute("uku-repeat");
                var ukulele = new Ukulele();
                ukulele.parentUku = this.uku;
                ukulele.registerController(this.expression, item);
                ukulele.dealWithElement(itemRender);
                if (i === finalValue.length - 1) {
                    tempDiv.parentNode.removeChild(tempDiv);
                }
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