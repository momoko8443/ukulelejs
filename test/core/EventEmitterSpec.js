describe("EventEmitter Test Suite", function() {
	it("test addListener", function() {
        var emitter = new EventEmitter();
        var handler = function(){
            console.log('handler1');
        };
        emitter.addListener('test', handler);
        expect(emitter.eventsPool.test.length).toBe(1);
        expect(emitter.eventsPool.test[0]).toBe(handler);
    });

    it("test removeListener", function() {
        var emitter = new EventEmitter();
        var handler1 = function(){
            console.log('handler1');
        };
        emitter.addListener('test', handler1);
        emitter.addListener('test', function(){
            console.log('handler2');
        });
        emitter.addListener('test', function(){
            console.log('handler3');
        });
        expect(emitter.eventsPool.test.length).toBe(3);
        emitter.removeListener('test',handler1);
        expect(emitter.eventsPool.test.length).toBe(2);
    });

	it("test dispatchEvent", function(done) {
        var emitter = new EventEmitter();
        var handler1 = function(e){
            console.log('handler1');
			expect(e.eventType).toBe('test');
			done();
        };
		emitter.addListener('test',handler1);
        emitter.dispatchEvent({'eventType':'test'});
    });

	it("test addListener", function() {
        var emitter = new EventEmitter();
        var handler = function(){
            console.log('handler1');
        };
        emitter.addListener('test', handler);
        expect(emitter.hasListener('test')).toBe(true);
        expect(emitter.eventsPool.test[0]).toBe(handler);
    });
});
