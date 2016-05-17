import {BoundItemBase} from "./BoundItemBase";
export class ControllerModel{
    alias:string;
    controllerInstance:Object;
    boundItems:Array<BoundItemBase>;
    constructor(alias:string ,ctrlInst:Object){
        this.alias = alias;
        this.controllerInstance = ctrlInst;
        this.boundItems = [];
    }
    addBoundItem(boundItem:BoundItemBase) :void{
        this.boundItems.push(boundItem);
    }

    getBoundItemsByName(name):Array<BoundItemBase> {
        let tempBoundItems:Array<BoundItemBase> = [];
        for (let i = 0; i < this.boundItems.length; i++) {
            let boundItem:BoundItemBase = this.boundItems[i];
            if (boundItem.attributeName === name) {
                tempBoundItems.push(boundItem);
            }
        }
        return tempBoundItems;
    }
}
