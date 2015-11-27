function BoundItemComponentAttribute(attrName, ukuTag, cc, uku){
    BoundItemBase.call(this,attrName,null,uku);
    //special value after 'uku-'
    this.ukuTag = ukuTag;
    this.componentController = cc;
}

BoundItemComponentAttribute.prototype = new BoundItemBase();
BoundItemComponentAttribute.prototype.constructor = BoundItemComponentAttribute;

BoundItemComponentAttribute.prototype.render = function (controller) {
    var finalValue = UkuleleUtil.getFinalValue(this.uku,controller,this.attributeName);
    this.componentController[this.ukuTag] = finalValue;
    uku.refresh(this.componentController._alias);
};
