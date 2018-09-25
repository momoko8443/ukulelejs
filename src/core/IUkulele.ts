
import {IEventEmitter} from "./IEventEmitter";
import {DefinitionManager} from "./DefinitionManager";
export interface IUkulele extends IEventEmitter{
	
	init();

	handleElement(element, handleElementCompletedFunc);

	registerController(instanceName, controllerInst);

	getController(instanceName);

	registerComponent(tag,templateUrl,preload);

	getComponent(tagName);

	getComponentController(componentId): Object;

	refresh(alias,excludeElement?);
	//internal function
	_internal_getDefinitionManager():DefinitionManager;
    //internal function
	_internal_dealWithElement(element,callback):void;
}

