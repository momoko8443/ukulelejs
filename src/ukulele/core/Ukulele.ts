import {EventEmitter} from "./EventEmitter";
import {AsyncCaller} from "../util/AsyncCaller"
import {DefinitionManager} from "./DefinitionManager";
import {DirtyChecker} from "./DirtyChecker";
import {Analyzer} from "./Analyzer";
import {Selector} from "../extend/Selector";
import {UkuEventType} from "./UkuEventType";
import {IUkulele} from "./IUkulele";
export class Ukulele extends EventEmitter implements IUkulele{
	private defMgr;
	private dirtyChecker;
	//let anylyzer;
	private asyncCaller = new AsyncCaller();

	public parentUku:Ukulele = null;

	init() {
		this.asyncCaller.exec(function(){
			this.manageApplication();
		});
	}

	handleElement(element) {
		this.analyizeElement(element,function(e){
			this.dispatchEvent({'eventType':UkuEventType.HANDLE_ELEMENT_COMPLETED,'element':element});
		});
	}

	registerController(instanceName, controllerInst) {
		this._internal_getDefinitionManager().addControllerDefinition(instanceName,controllerInst);
	}

	getController(instanceName){
		return this._internal_getDefinitionManager().getControllerDefinition(instanceName).controllerInstance;
	}

	registerComponent(tag,templateUrl,preload){
		this._internal_getDefinitionManager().addComponentDefinition(tag,templateUrl,preload,this.asyncCaller);
	}

	getComponent(tagName){
		return this._internal_getDefinitionManager().getComponent(tagName);
	}

	refresh(alias,excludeElement?) {
		if(!this.dirtyChecker){
			this.dirtyChecker = new DirtyChecker(this);
		}
		this.dirtyChecker.runDirtyChecking(alias,excludeElement);
	}
	//internal function
	_internal_getDefinitionManager(){
		if(!this.defMgr){
			this.defMgr = new DefinitionManager(this);
		}
		return this.defMgr;
	}
	_internal_dealWithElement(element) {
		this.analyizeElement(element);
	}

	private manageApplication() {
		let apps = Selector.querySelectorAll(document,"[uku-application]");
		if (apps.length === 1) {
			this.analyizeElement(apps[0], function(ele){
				this.dispatchEvent({'eventType':UkuEventType.INITIALIZED,'element':ele});
			});
		} else {
			throw new Error("Only one 'uku-application' can be declared in a whole html.");
		}
	}
	private analyizeElement(element, callback?){
		let anylyzer = new Analyzer(this);
		if(callback){
			(function(retFunc){
				anylyzer.addListener(Analyzer.ANALYIZE_COMPLETED, function(e){
					retFunc(e.element);
				});
			})(callback);
		}
		anylyzer.analyizeElement(element);
	}
}

