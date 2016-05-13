
export interface IUkulele{

	parentUku:IUkulele;

	init();

	handleElement(element);

	registerController(instanceName, controllerInst);

	getController(instanceName);

	registerComponent(tag,templateUrl,preload);

	getComponent(tagName);

	refresh(alias,excludeElement?);
	//internal function
	_internal_getDefinitionManager();
    //internal function
	_internal_dealWithElement(element);
}

