function BoundItemExpression(attrName, expression, element, uku){
    BoundItemBase.call(this,attrName,element,uku);
    this.expression = expression;
}

BoundItemExpression.prototype = new BoundItemBase();
BoundItemExpression.prototype.constructor = BoundItemExpression;

BoundItemExpression.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
    Selector.directText(this.element,finalValue);
};