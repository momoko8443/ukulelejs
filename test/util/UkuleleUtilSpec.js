describe("UkuleleUtil Test Suite", function() {
	it("test getFinalAttribute", function() {
		var expression1 = "myCtrl.name";
		var attr = UkuleleUtil.getFinalAttribute(expression1);
		var expression2 = "myCtrl.child.name";
		var attr2 = UkuleleUtil.getFinalAttribute(expression2);
		expect(attr).toBe("name");
		expect(attr2).toBe("child.name");
	});

	it("test isRepeat", function() {
		var element = '<button value="test">click</button';
		expect(UkuleleUtil.isRepeat($(element))).toBe(false);
		var element1 = '<button value="test" uku-repeat="item in myCtrl.items">click</button';
		expect(UkuleleUtil.isRepeat($(element1))).toBe(true);
	});

	
	it("test isInRepeat", function() {
			var $html = $('<li uku-repeat="item in myCtrl.items"><input type="text"><li>');
			var $element = $html.find("input:first");
			expect(UkuleleUtil.isInRepeat($element)).toBe(true);
		});
	
	it("test getBoundModelInstantName", function() {
		var expression1 = "myCtrl.name";
		var attr = UkuleleUtil.getBoundModelInstantName(expression1);
		var expression2 = "myCtrl.child.name";
		var attr2 = UkuleleUtil.getBoundModelInstantName(expression2);
		expect(attr).toBe("myCtrl");
		expect(attr2).toBe("myCtrl");
	});
}); 