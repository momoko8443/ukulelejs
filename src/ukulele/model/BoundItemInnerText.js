function BoundItemInnerText(attrName, element, uku){
    BoundItemBase.call(this,attrName,element,uku);
    this.tagName = 'text';
}

BoundItemInnerText.prototype = new BoundItemBase();
BoundItemInnerText.prototype.constructor = BoundItemInnerText;

BoundItemInnerText.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
    this.element.innerHTML = finalValue;
};