export class ControllerModel{
    constructor(alias,ctrlInst){
        this.alias = alias;
        this.controllerInstance = ctrlInst;
        this.boundItems = [];
    }
    addBoundItem(boundItem) {
            this.boundItems.push(boundItem);
    }

    getBoundItemsByName(name) {
        let tempBoundItems = [];
        for (let i = 0; i < this.boundItems.length; i++) {
            let boundItem = this.boundItems[i];
            if (boundItem.attributeName === name) {
                tempBoundItems.push(boundItem);
            }
        }
        return tempBoundItems;
    }
}
