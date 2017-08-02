import {UkuleleUtil} from '../../src/util/UkuleleUtil';
describe("UkuleleUtil Test Suite", ()=> {
	it("test getFinalAttribute", ()=> {
		let expression1 = "myCtrl.name";
		let attr = UkuleleUtil.getFinalAttribute(expression1);
		let expression2 = "myCtrl.child.name";
		let attr2 = UkuleleUtil.getFinalAttribute(expression2);
		let expression3 = "parent.myCtrl.child.name";
		let attr3 = UkuleleUtil.getFinalAttribute(expression3);
		expect(attr).toBe("name");
		expect(attr2).toBe("child.name");
		expect(attr3).toBe("child.name");
	});

	it("test isRepeat", ()=> {
        let div = document.createElement("div");
        div.innerHTML = '<button value="test">click</button'
		let element = div.children[0];
		expect(UkuleleUtil.isRepeat(element as HTMLElement)).toBe(false);
		div.innerHTML = '<button value="test" uku-repeat="item in myCtrl.items">click</button';
        let element1 = div.children[0];
		expect(UkuleleUtil.isRepeat(element1 as HTMLElement)).toBe(true);
	});



	it("test isInRepeat", ()=> {
            let div = document.createElement("div");
            div.innerHTML = '<li uku-repeat="item in myCtrl.items"><input type="text"><li>';
			let element = div.querySelector('input');
			expect(UkuleleUtil.isInRepeat(element as HTMLElement)).toBe(true);
		});

	it("test getBoundModelInstantName", ()=> {
		let expression1 = "myCtrl.name";
		let attr = UkuleleUtil.getBoundModelInstantName(expression1);
		let expression2 = "myCtrl.child.name";
		let attr2 = UkuleleUtil.getBoundModelInstantName(expression2);
		expect(attr).toBe("myCtrl");
		expect(attr2).toBe("myCtrl");
	});
	it("test getBoundModelInstantNames", ()=> {
		let alias_list = ['myCtrl','yourCtrl'];
		let expression1 = "myCtrl.name";
		let arr1 = UkuleleUtil.getBoundModelInstantNames(alias_list,expression1);
		expect(arr1[0]).toBe("myCtrl");

		let expression2 = "!myCtrl.name";
		let arr2 = UkuleleUtil.getBoundModelInstantNames(alias_list,expression2);
		expect(arr2[0]).toBe("myCtrl");

		let expression3 = "!myCtrl.name + yourCtrl.name";
		let arr3 = UkuleleUtil.getBoundModelInstantNames(alias_list,expression3);
		expect(arr3.length).toBe(2);
	});
	it("test searchUkuAttrTag", ()=> {
		let htmlStr = "uku-test";
		let index = UkuleleUtil.searchUkuAttrTag(htmlStr);
		expect(index).toBeGreaterThan(-1);

		let htmlStr2 = "auku-test";
		let index2 = UkuleleUtil.searchUkuAttrTag(htmlStr2);
		expect(index2).toBe(-1);

		let htmlStr3 = "uku_test";
		let index3 = UkuleleUtil.searchUkuAttrTag(htmlStr3);
		expect(index3).toBe(-1);
	});

    it("test searchHtmlTag", ()=> {
		let htmlStr = '<tr id="aaa">ddddd/tr>';
        let htmlStr2 = '<trid="aaa">ddddd/tr>';
        let htmlStr3 = '<tr id="aaa">ddddd</tr>';

		expect(UkuleleUtil.searchHtmlTag(htmlStr,"tr")).toBe(-1);
        expect(UkuleleUtil.searchHtmlTag(htmlStr2,"tr")).toBe(-1);
        expect(UkuleleUtil.searchHtmlTag(htmlStr3,"tr")).not.toBe(-1);
	});

    // it("test searchHtmlTag", ()=> {
	// 	let htmlStr1 = '"aaaaaaa"';
    //     let htmlStr2 = 'aaa"BBBBBBBBB"';
    //     let htmlStr3 = '"BBBBBBB"ccccc';
    //     let htmlStr4 = 'aaaaa"BBBBBBB"ccccc';
	//
    //     let htmlStr5 = "'aaaaaaa'";
    //     let htmlStr6 = "aaa'BBBBBBBBB'";
    //     let htmlStr7 = "'BBBBBBB'ccccc";
    //     let htmlStr8 = "aaaaa'BBBBBBB'ccccc";
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

	it("test searchUkuExpTag", ()=> {
		let exp = "{{uku-test}}";
		let index = UkuleleUtil.searchUkuExpTag(exp);
		expect(index).toBeGreaterThan(-1);

		let exp2 = "{{uku-test}";
		let index2 = UkuleleUtil.searchUkuExpTag(exp2);
		expect(index2).toBe(-1);

		let exp3 = "a{{uku-test}}";
		let index3 = UkuleleUtil.searchUkuExpTag(exp3);
		expect(index3).toBe(-1);

		let exp4 = "{{uku-test}}b";
		let index4 = UkuleleUtil.searchUkuExpTag(exp4);
		expect(index4).toBe(-1);
	});

	it("test getAttrFromUkuTag", ()=> {
		let exp = "auku-test";
		let index = UkuleleUtil.getAttrFromUkuTag(exp);
		expect(index).toBe(exp);

		let exp2 = "ku-test";
		let index2 = UkuleleUtil.getAttrFromUkuTag(exp2);
		expect(index2).toBe(exp2);

		let exp3 = "ukutest";
		let index3 = UkuleleUtil.getAttrFromUkuTag(exp3);
		expect(index3).toBe(exp3);

		let exp4 = "uku-test";
		let index4 = UkuleleUtil.getAttrFromUkuTag(exp4);
		expect(index4).toBe('test');

		let exp5 = "uku-test-user";
		let index5 = UkuleleUtil.getAttrFromUkuTag(exp5,true);
		expect(index5).toBe('testUser');

		let exp6 = "uku-test-user-address";
		let index6 = UkuleleUtil.getAttrFromUkuTag(exp6,true);
		expect(index6).toBe('testUserAddress');
	});


	it("test searchUkuFuncArg", ()=> {
		let htmlStr = "functionName(test)";
		let index = UkuleleUtil.searchUkuFuncArg(htmlStr);
		expect(index).toBeGreaterThan(-1);

		let htmlStr2 = "functionName(test";
		let index2 = UkuleleUtil.searchUkuFuncArg(htmlStr2);
		expect(index2).toBe(-1);

		let htmlStr3 = "functionNametest)";
		let index3 = UkuleleUtil.searchUkuFuncArg(htmlStr3);
		expect(index3).toBe(-1);

		let htmlStr4 = "functionNametest)(";
		let index4 = UkuleleUtil.searchUkuFuncArg(htmlStr4);
		expect(index4).toBe(-1);
	});
});
