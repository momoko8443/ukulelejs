describe("UkuleleUtil Test Suite", function() {
	it("test getFinalAttribute", function() {
		var expression1 = "myCtrl.name";
		var attr = UkuleleUtil.getFinalAttribute(expression1);
		var expression2 = "myCtrl.child.name";
		var attr2 = UkuleleUtil.getFinalAttribute(expression2);
		var expression3 = "parent.myCtrl.child.name";
		var attr3 = UkuleleUtil.getFinalAttribute(expression3);
		expect(attr).toBe("name");
		expect(attr2).toBe("child.name");
		expect(attr3).toBe("child.name");
	});

	it("test isRepeat", function() {
        var div = document.createElement("div");
        div.innerHTML = '<button value="test">click</button'
		var element = div.children[0];
		expect(UkuleleUtil.isRepeat(element)).toBe(false);
		div.innerHTML = '<button value="test" uku-repeat="item in myCtrl.items">click</button';
        var element1 = div.children[0];
		expect(UkuleleUtil.isRepeat(element1)).toBe(true);
	});

	
	it("test isInRepeat", function() {
            var div = document.createElement("div");
            div.innerHTML = '<li uku-repeat="item in myCtrl.items"><input type="text"><li>';
			var element = div.querySelector('input');
			expect(UkuleleUtil.isInRepeat(element)).toBe(true);
		});
	
	it("test getBoundModelInstantName", function() {
		var expression1 = "myCtrl.name";
		var attr = UkuleleUtil.getBoundModelInstantName(expression1);
		var expression2 = "myCtrl.child.name";
		var attr2 = UkuleleUtil.getBoundModelInstantName(expression2);
		expect(attr).toBe("myCtrl");
		expect(attr2).toBe("myCtrl");
	});
	
	it("test searchUkuAttrTag", function() {
		var htmlStr = "uku-test";
		var index = UkuleleUtil.searchUkuAttrTag(htmlStr);	
		expect(index).toBeGreaterThan(-1);
		
		var htmlStr2 = "auku-test";
		var index2 = UkuleleUtil.searchUkuAttrTag(htmlStr2);	
		expect(index2).toBe(-1);
		
		var htmlStr3 = "uku_test";
		var index3 = UkuleleUtil.searchUkuAttrTag(htmlStr3);	
		expect(index3).toBe(-1);
	});
	
	it("test searchUkuExpTag", function() {
		var exp = "{{uku-test}}";
		var index = UkuleleUtil.searchUkuExpTag(exp);	
		expect(index).toBeGreaterThan(-1);
		
		var exp2 = "{{uku-test}";
		var index2 = UkuleleUtil.searchUkuExpTag(exp2);	
		expect(index2).toBe(-1);
		
		var exp3 = "a{{uku-test}}";
		var index3 = UkuleleUtil.searchUkuExpTag(exp3);	
		expect(index3).toBe(-1);
		
		var exp4 = "{{uku-test}}b";
		var index4 = UkuleleUtil.searchUkuExpTag(exp4);	
		expect(index4).toBe(-1);
	});
	
	it("test searchUkuFuncArg", function() {
		var htmlStr = "functionName(test)";
		var index = UkuleleUtil.searchUkuFuncArg(htmlStr);	
		expect(index).toBeGreaterThan(-1);
		
		var htmlStr2 = "functionName(test";
		var index2 = UkuleleUtil.searchUkuFuncArg(htmlStr2);	
		expect(index2).toBe(-1);
		
		var htmlStr3 = "functionNametest)";
		var index3 = UkuleleUtil.searchUkuFuncArg(htmlStr3);	
		expect(index3).toBe(-1);
		
		var htmlStr4 = "functionNametest)(";
		var index3 = UkuleleUtil.searchUkuFuncArg(htmlStr4);	
		expect(index3).toBe(-1);
	});
}); 