import {EventEmitter} from "./EventEmitter";
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
	private promiseArray = [];
	public parentUku:IUkulele;
	static INITIALIZED:string = 'initialized';
	static REFRESH:string = 'refresh';
	static HANDLE_ELEMENT_COMPLETED:string = "handle_element_completed";

	public init():void{
		Promise.all(this.promiseArray).then(()=>{
			this.manageApplication();
		});
	}

	public handleElement(element:HTMLElement):void {
		this.analyizeElement(element,(e)=>{
			this.dispatchEvent(new Event(UkuEventType.HANDLE_ELEMENT_COMPLETED,e));
		});
	}

	public registerController(instanceName:string, controllerInst:Object):void{
		this._internal_getDefinitionManager().addControllerDefinition(instanceName,controllerInst);
	}

	public getController(instanceName:string){
		return this._internal_getDefinitionManager().getControllerDefinition(instanceName).controllerInstance;
	}

	public registerComponent(tag:string,templateUrl:string,preload:boolean):void{
		var p:Promise<void> =  this._internal_getDefinitionManager().addComponentDefinition(tag,templateUrl,preload);
		this.promiseArray.push(p);
	}

	public getComponent(tagName:string){
		return this._internal_getDefinitionManager().getComponent(tagName);
	}
	
	public getComponentController(componentId:string):Object{
		return this._internal_getDefinitionManager().getControllerInstByDomId(componentId);
	}
	
	public refresh(alias?:string|Array<string>,excludeElement?:HTMLElement) {
		if(!this.dirtyChecker){
			this.dirtyChecker = new DirtyChecker(this);
		}
		this.dirtyChecker.runDirtyChecking(alias,excludeElement);
	}
	//internal function
	public _internal_getDefinitionManager():DefinitionManager{
		if(!this.defMgr){
			this.defMgr = new DefinitionManager(this);
		}
		return this.defMgr;
	}
	public _internal_dealWithElement(element:HTMLElement,callback:Function):void {
		this.analyizeElement(element,callback);
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