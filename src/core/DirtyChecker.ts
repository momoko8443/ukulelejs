import {UkuleleUtil} from "../util/UkuleleUtil";
import {ObjectUtil} from "../util/ObjectUtil";
import {UkuEventType} from "./UkuEventType";
import {IUkulele} from "./IUkulele";
import {EventEmitter} from "./EventEmitter";
import {ControllerModel} from "../model/ControllerModel";
import {BoundItemBase} from "../model/BoundItemBase";
import {Event} from "./Event";
export class DirtyChecker{
	private uku:IUkulele;
	private defMgr;
	constructor(_uku:IUkulele){
		this.uku = _uku;
		this.defMgr = this.uku._internal_getDefinitionManager();
	}
    
	runDirtyChecking(ctrlAliasName?:string|Array<string>, excludeElement?:HTMLElement):void {
		let _this:DirtyChecker = this;
		if (ctrlAliasName) {
			if (typeof (ctrlAliasName) === "string") {
				watchController(ctrlAliasName as string);
			} else if (ObjectUtil.isArray(ctrlAliasName)) {
				for (let i = 0; i < ctrlAliasName.length; i++) {
					watchController(ctrlAliasName[i]);
				}
			}
		} else {
			for (let alias in this.defMgr.getControllersDefinition()) {
				watchController(alias);
			}
		}

		function watchController(alias:string) {
			let controllerModel:ControllerModel = _this.defMgr.getControllersDefinition()[alias];
			if (!controllerModel) {
				if (_this.uku.parentUku) {
					_this.uku.parentUku.refresh(alias);
				}
				return;
			}
			let controller:Object = controllerModel.controllerInstance;
			let previousCtrlModel:ControllerModel = _this.defMgr.getCopyControllers()[alias];
			let changedElementCount = 0;
			for (let i = 0; i < controllerModel.boundItems.length; i++) {
				let boundItem:BoundItemBase = controllerModel.boundItems[i] as BoundItemBase;
				let attrName:string = boundItem.attributeName;
				if(attrName.search('parent.') > -1){
					return;
				}
				if (previousCtrlModel) {
					if (boundItem.hasOwnProperty('ukuTag') && boundItem['ukuTag'] === "selected") {
						attrName = attrName.split("|")[0];
					}
					let finalValue = UkuleleUtil.getFinalValue(_this.uku, [controller], attrName);
					let previousFinalValue = UkuleleUtil.getFinalValue(_this.uku, [previousCtrlModel], attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						attrName = boundItem.attributeName;
						let changedBoundItems:Array<BoundItemBase> = controllerModel.getBoundItemsByName(attrName);
						for (let j = 0; j < changedBoundItems.length; j++) {
							let changedBoundItem:BoundItemBase = changedBoundItems[j] as BoundItemBase;
							if(changedBoundItem.element !== excludeElement || (boundItem.hasOwnProperty('ukuTag') && changedBoundItem['ukuTag'] !== "value")){
								changedElementCount++;
								changedBoundItem.render([controller]);
							}
						}
					}
				}
			}
			if(changedElementCount > 0 && _this.uku.hasListener(UkuEventType.REFRESH)){
				_this.uku.dispatchEvent(new Event(UkuEventType.REFRESH));
			}
			_this.defMgr.copyControllerInstance(controller, alias);
		}
	};
}
