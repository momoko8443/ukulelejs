import {UkuleleUtil} from "../util/UkuleleUtil";
import {ObjectUtil} from "../util/ObjectUtil";
export function DirtyChecker(uku){
    let defMgr = uku._internal_getDefinitionManager();
	this.runDirtyChecking = function(ctrlAliasName, excludeElement) {
		if (ctrlAliasName) {
			if (typeof (ctrlAliasName) === "string") {
				watchController(ctrlAliasName);
			} else if (ObjectUtil.isArray(ctrlAliasName)) {
				for (let i = 0; i < ctrlAliasName.length; i++) {
					watchController(ctrlAliasName[i]);
				}
			}
		} else {
			for (let alias in defMgr.getControllersDefinition()) {
				watchController(alias);
			}
		}

		function watchController(alias) {
			let controllerModel = defMgr.getControllersDefinition()[alias];
			if (!controllerModel) {
				if (uku.parentUku) {
					uku.parentUku.refresh(alias);
				}
				return;
			}
			let controller = controllerModel.controllerInstance;
			let previousCtrlModel = defMgr.getCopyControllers()[alias];
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
					let finalValue = UkuleleUtil.getFinalValue(uku, controller, attrName);
					let previousFinalValue = UkuleleUtil.getFinalValue(uku, previousCtrlModel, attrName);
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
			if(changedElementCount > 0 && uku.hasListener(Ukulele.REFRESH)){
				uku.dispatchEvent({'eventType':Ukulele.REFRESH});
			}
			defMgr.copyControllerInstance(controller, alias);
		}
	};
}
