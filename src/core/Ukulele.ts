import {EventEmitter} from "./EventEmitter";
import {AsyncCaller} from "../util/AsyncCaller"
import {DefinitionManager} from "./DefinitionManager";
import {DirtyChecker} from "./DirtyChecker";
import {Analyzer} from "./Analyzer";
import {Selector} from "../extend/Selector";
import {UkuEventType} from "./UkuEventType";
import {IUkulele} from "./IUkulele";
import {Event} from "./Event";
export class Ukulele extends EventEmitter implements IUkulele{
	private defMgr:DefinitionManager;
	private dirtyChecker:DirtyChecker;
	private asyncCaller = new AsyncCaller();

	public parentUku:IUkulele;
	static INITIALIZED:string = 'initialized';
	static REFRESH:string = 'refresh';
	static HANDLE_ELEMENT_COMPLETED:string = "handle_element_completed";

	init():void{
		this.asyncCaller.exec(()=>{
			this.manageApplication();
		});
	}

	handleElement(element:HTMLElement):void {
		this.analyizeElement(element,(e)=>{
			this.dispatchEvent(new Event(UkuEventType.HANDLE_ELEMENT_COMPLETED,e));
		});
	}

	registerController(instanceName:string, controllerInst:Object):void{
		this._internal_getDefinitionManager().addControllerDefinition(instanceName,controllerInst);
	}

	getController(instanceName:string){
		return this._internal_getDefinitionManager().getControllerDefinition(instanceName).controllerInstance;
	}

	registerComponent(tag:string,templateUrl:string,preload:boolean){
		this._internal_getDefinitionManager().addComponentDefinition(tag,templateUrl,preload,this.asyncCaller);
	}

	getComponent(tagName:string){
		return this._internal_getDefinitionManager().getComponent(tagName);
	}
	
	getComponentController(componentId:string):Object{
		return this._internal_getDefinitionManager().getControllerInstByDomId(componentId);
	}
	
	refresh(alias?:string|Array<string>,excludeElement?:HTMLElement) {
		if(!this.dirtyChecker){
			this.dirtyChecker = new DirtyChecker(this);
		}
		this.dirtyChecker.runDirtyChecking(alias,excludeElement);
	}
	//internal function
	_internal_getDefinitionManager():DefinitionManager{
		if(!this.defMgr){
			this.defMgr = new DefinitionManager(this);
		}
		return this.defMgr;
	}
	_internal_dealWithElement(element:HTMLElement):void {
		this.analyizeElement(element);
	}

	private manageApplication():void{
		let apps:NodeList = Selector.querySelectorAll(document,"[uku-application]");
		if (apps.length === 1) {
			this.analyizeElement(apps[0] as HTMLElement, (ele)=>{
				this.dispatchEvent(new Event(UkuEventType.INITIALIZED,ele));
			});
		} else {
			throw new Error("Only one 'uku-application' can be declared in a whole html.");
		}
	}
	private analyizeElement(element:HTMLElement, callback?:Function):void{
		let anylyzer = new Analyzer(this);
		if(callback){
			((retFunc:Function)=>{
				anylyzer.addListener(Analyzer.ANALYIZE_COMPLETED, (e)=>{
					retFunc(e.element);
				});
			})(callback);
		}
		anylyzer.analyizeElement(element);
	}
}

