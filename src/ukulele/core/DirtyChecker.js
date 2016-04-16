function DirtyChecker(uku){
    var defMgr = uku._internal_getDefinitionManager();
	this.runDirtyChecking = function(ctrlAliasName, excludeElement) {
		if (ctrlAliasName) {
			if (typeof (ctrlAliasName) === "string") {
				watchController(ctrlAliasName);
			} else if (ObjectUtil.isArray(ctrlAliasName)) {
				for (var i = 0; i < ctrlAliasName.length; i++) {
					watchController(ctrlAliasName[i]);
				}
			}
		} else {
			for (var alias in defMgr.getControllersDefinition()) {
				watchController(alias);
			}
		}

		function watchController(alias) {
			var controllerModel = defMgr.getControllersDefinition()[alias];
			if (!controllerModel) {
				if (uku.parentUku) {
					uku.parentUku.refresh(alias);
				}
				return;
			}
			var controller = controllerModel.controllerInstance;
			var previousCtrlModel = defMgr.getCopyControllers()[alias];
			var changedElementCount = 0;
			for (var i = 0; i < controllerModel.boundItems.length; i++) {
				var boundItem = controllerModel.boundItems[i];
				var attrName = boundItem.attributeName;
				if(attrName.search('parent.') > -1){
					return;
				}
				if (previousCtrlModel) {
					if (boundItem.ukuTag === "selected") {
						attrName = attrName.split("|")[0];
					}
					var finalValue = UkuleleUtil.getFinalValue(uku, controller, attrName);
					var previousFinalValue = UkuleleUtil.getFinalValue(uku, previousCtrlModel, attrName);
					if (!ObjectUtil.compare(previousFinalValue, finalValue)) {
						attrName = boundItem.attributeName;
						var changedBoundItems = controllerModel.getBoundItemsByName(attrName);
						for (var j = 0; j < changedBoundItems.length; j++) {
							var changedBoundItem = changedBoundItems[j];
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
