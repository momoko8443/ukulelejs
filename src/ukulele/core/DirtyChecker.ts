import {UkuleleUtil} from "../util/UkuleleUtil";
import {ObjectUtil} from "../util/ObjectUtil";
import {UkuEventType} from "./UkuEventType";
import {IUkulele} from "./IUkulele";
export class DirtyChecker{
	private uku:IUkulele;
	private defMgr = this.uku._internal_getDefinitionManager();
	constructor(_uku:IUkulele){
		this.uku = _uku;
	}
    
	runDirtyChecking(ctrlAliasName, excludeElement) {
		if (ctrlAliasName) {
			if (typeof (ctrlAliasName) === "string") {
				watchController(ctrlAliasName);
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

		function watchController(alias) {
			let controllerModel = this.defMgr.getControllersDefinition()[alias];
			if (!controllerModel) {
				if (this.uku.parentUku) {
					this.uku.parentUku.refresh(alias);
				}
				return;
			}
			let controller = controllerModel.controllerInstance;
			let previousCtrlModel = this.defMgr.getCopyControllers()[alias];
			let changedElementCount = 0;
			for (let i = 0; i < controllerModel.boundItems.length; i++) {
				let boundItem = controllerModel.boundItems[i];
				let attrName = boundItem.attributeName;
				if(attrName.search('parent.') > -1){
					return;
				}
				if (previousCtrlModel) {
					if (boundItem.ukuTag === "selected") {
						attrName = attrName.split("|")[0];
					}
					let finalValue = UkuleleUtil.getFinalValue(this.uku, controller, attrName);
					let previousFinalValue = UkuleleUtil.getFinalValue(this.uku, previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						attrName = boundItem.attributeName;
						let changedBoundItems = controllerModel.getBoundItemsByName(attrName);
						for (let j = 0; j < changedBoundItems.length; j++) {
							let changedBoundItem = changedBoundItems[j];
							if(changedBoundItem.element !== excludeElement || changedBoundItem.ukuTag !== "value"){
								changedElementCount++;
								changedBoundItem.render(controller);
							}
						}

					}
				}
			}
			if(changedElementCount > 0 && this.uku.hasListener(UkuEventType.REFRESH)){
				this.uku.dispatchEvent({'eventType':UkuEventType.REFRESH});
			}
			this.defMgr.copyControllerInstance(controller, alias);
		}
	};
}
