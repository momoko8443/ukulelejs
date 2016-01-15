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

    it("test searchHtmlTag", function() {
		var htmlStr = '<tr id="aaa">ddddd/tr>';
        var htmlStr2 = '<trid="aaa">ddddd/tr>';
        var htmlStr3 = '<tr id="aaa">ddddd</tr>';

		expect(UkuleleUtil.searchHtmlTag(htmlStr,"tr")).toBe(-1);
        expect(UkuleleUtil.searchHtmlTag(htmlStr2,"tr")).toBe(-1);
        expect(UkuleleUtil.searchHtmlTag(htmlStr3,"tr")).not.toBe(-1);
	});

    // it("test searchHtmlTag", function() {
	// 	var htmlStr1 = '"aaaaaaa"';
    //     var htmlStr2 = 'aaa"BBBBBBBBB"';
    //     var htmlStr3 = '"BBBBBBB"ccccc';
    //     var htmlStr4 = 'aaaaa"BBBBBBB"ccccc';
	//
    //     var htmlStr5 = "'aaaaaaa'";
    //     var htmlStr6 = "aaa'BBBBBBBBB'";
    //     var htmlStr7 = "'BBBBBBB'ccccc";
    //     var htmlStr8 = "aaaaa'BBBBBBB'ccccc";
	//
	// 	expect(UkuleleUtil.isStringArgument(htmlStr1,"tr")).toBe(true);
    //     expect(UkuleleUtil.isStringArgument(htmlStr2,"tr")).toBe(false);
    //     expect(UkuleleUtil.isStringArgument(htmlStr3,"tr")).toBe(false);
    //     expect(UkuleleUtil.isStringArgument(htmlStr4,"tr")).toBe(false);
	//
    //     expect(UkuleleUtil.isStringArgument(htmlStr5,"tr")).toBe(true);
    //     expect(UkuleleUtil.isStringArgument(htmlStr6,"tr")).toBe(false);
    //     expect(UkuleleUtil.isStringArgument(htmlStr7,"tr")).toBe(false);
    //     expect(UkuleleUtil.isStringArgument(htmlStr8,"tr")).toBe(false);
	// });

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

	it("test getAttrFromUkuTag", function() {
		var exp = "auku-test";
		var index = UkuleleUtil.getAttrFromUkuTag(exp);
		expect(index).toBe(exp);

		var exp2 = "ku-test";
		var index2 = UkuleleUtil.getAttrFromUkuTag(exp2);
		expect(index2).toBe(exp2);

		var exp3 = "ukutest";
		var index3 = UkuleleUtil.getAttrFromUkuTag(exp3);
		expect(index3).toBe(exp3);

		var exp4 = "uku-test";
		var index4 = UkuleleUtil.getAttrFromUkuTag(exp4);
		expect(index4).toBe('test');

		var exp5 = "uku-test-user";
		var index5 = UkuleleUtil.getAttrFromUkuTag(exp5,true);
		expect(index5).toBe('testUser');

		var exp6 = "uku-test-user-address";
		var index6 = UkuleleUtil.getAttrFromUkuTag(exp6,true);
		expect(index6).toBe('testUserAddress');
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
