
import {IEventEmitter} from "./IEventEmitter";
import {DefinitionManager} from "./DefinitionManager";
export interface IUkulele extends IEventEmitter{

	parentUku:IUkulele;

	init();

	handleElement(element);

	registerController(instanceName, controllerInst);

	getController(instanceName);

	registerComponent(tag,templateUrl,preload);

	getComponent(tagName);

	refresh(alias,excludeElement?);
	//internal function
	_internal_getDefinitionManager():DefinitionManager;
    //internal function
	_internal_dealWithElement(element,callback):void;
}

