/**
 * @author Huibin
 */
function ControllerModel(alias,ctrlInst) {
    "use strict";
    this.alias = alias;
    this.controllerInstance = ctrlInst;
    this.boundItems = [];
}

ControllerModel.prototype.addBoundItem = function (boundItem) {
        this.boundItems.push(boundItem);
};

ControllerModel.prototype.getBoundItemsByName = function (name) {
    var tempBoundItems = [];
    for (var i = 0; i < this.boundItems.length; i++) {
        var boundItem = this.boundItems[i];
        if (boundItem.attributeName === name) {
            tempBoundItems.push(boundItem);
        }
    }
    return tempBoundItems;
};