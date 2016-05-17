import {EventEmitter} from "../../src/core/EventEmitter";
import {Event} from "../../src/core/Event";
describe("EventEmitter Test Suite", ()=> {
	it("test addListener", ()=> {
        let emitter:EventEmitter = new EventEmitter();
        let handler = ()=>{
            console.log('handler1');
        };
        emitter.addListener('test', handler);
        expect(emitter.getEventsPool()['test'].length).toBe(1);
        expect(emitter.getEventsPool()['test'][0]).toBe(handler);
    });

    it("test removeListener", ()=> {
        let emitter = new EventEmitter();
        let handler1 = ()=>{
            console.log('handler1');
        };
        emitter.addListener('test', handler1);
        emitter.addListener('test', ()=>{
            console.log('handler2');
        });
        emitter.addListener('test', ()=>{
            console.log('handler3');
        });
        expect(emitter.getEventsPool()['test'].length).toBe(3);
        emitter.removeListener('test',handler1);
        expect(emitter.getEventsPool()['test'].length).toBe(2);
    });

	it("test dispatchEvent", function(done) {
        let emitter = new EventEmitter();
        let handler1 = function(e){
            console.log('handler1');
			expect(e.eventType).toBe('test');
			done();
        };
		emitter.addListener('test',handler1);
        emitter.dispatchEvent(new Event('test'));
    });

	it("test addListener", ()=> {
        let emitter = new EventEmitter();
        let handler = ()=>{
            console.log('handler1');
        };
        emitter.addListener('test', handler);
        expect(emitter.hasListener('test')).toBe(true);
        expect(emitter.getEventsPool()['test'][0]).toBe(handler);
    });
});
