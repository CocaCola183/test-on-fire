'use strict';

const getApiInfo 	= require('../apidoc/getApiInfo.js');
const _ 					= require('lodash');

const result = getApiInfo();

const SimpleType = {
	Number: true,
	String: true,
	Boolean: true
}


/**
 * 转换 apidoc output 到 test-on-fire input
 * @param  {[type]} result apidoc output
 * @return {[type]}        test-on-fire input
 */
function translator (result) {

	const originalData = JSON.parse(result.data.toString());

	// console.dir(originalData, {depth: 10});

	let originalRequestItem = originalData[0];
	let reqestSchema 				= {};

	reqestSchema.httpMethod = originalRequestItem.type;
	reqestSchema.url 				= originalRequestItem.url;
	reqestSchema.name				= originalRequestItem.name;

	let params = originalRequestItem.parameter.fields.Parameter;

	// // console.log(params);
	
	// // test-on-fire 输入信息
	// let schemas 		= {};

	// /**
	//  * [nodeStack 节点栈]
	//  * @nodeStackItem {Array}
	//  * @nodeStackItem.type 		 	param type 
	//  * @nodeStackItem.field 		param field
	//  */
	// let nodeStack		= [];


	// for (var i = 0; i < params.length; i++) {

	// 	// apidoc 参数对象
	// 	const param = params[i];

	// 	// test-on-fire 测试配置元
	// 	let schema = {};

	// 	// 当前节点栈基本信息
	// 	let nodeStackItemType, nodeStackItemField;

	// 	if (nodeStack.length > 0) {
	// 		nodeStackItemType = nodeStack[nodeStack.length - 1].type;
	// 		nodeStackItemField = nodeStack[nodeStack.length - 1].field;	
	// 	}

	// 	// 当前属性为简单属性
	// 	if(SimpleType[param.type]) {		

	// 		// 父节点是array，当前为简单类型的情况，会直接在父节点酒杯处理掉，这里不需要再进行判断了

	// 		// 父节点是object
	// 		if (nodeStack.length > 0 
	// 			&& nodeStack[nodeStack.length - 1].type 	== 'Object') {

	// 			const parentName				= param.field.substring(0, param.field.lastIndexOf('.'));
	// 			const propertyName 			= param.field.substring(param.field.lastIndexOf('.') + 1);
				
	// 			// 父节点为object，父节点的父节点为数组
	// 			if (nodeStackItemField == '' && nodeStack.length > 1) {
	// 				schema.type 			= param.type;
	// 				schema.required		= param.optional;
	// 				schemas = schemAssign(schemas, nodeStack, propertyName, schema);

	// 				// 需要连续pop两次，pop掉当前的父节点和父节点的父节点array
	// 				nodeStack.pop(); nodeStack.pop();
	// 				continue;
	// 			}

	// 			// 父节点为object，父节点的父节点不是object，而且，父节点没有切换
	// 			if (nodeStackItemField == parentName) {
	// 					schema.type 				= param.type.toLowerCase();
	// 					schema.required			= param.optional;
	// 					schemas = schemAssign(schemas, nodeStack, propertyName, schema);
	// 					continue;
	// 			}

	// 			// 父节点已经切换
	// 			nodeStack.pop();
	// 		}

	// 		// 父节点为顶级
	// 		if (nodeStack.length == 0) {
	// 			schema.type 					= param.type.toLowerCase();
	// 			schema.required 			= param.optional;
	// 			schemas = schemAssign(schemas, nodeStack, param.field, schema);
	// 			continue;
	// 		}
	// 	}

	// 	// 当前属性为复合属性object
	// 	if (param.type === 'Object') {

	// 		// 判断父节点是否已经切换，如果已经切换，立刻pop掉当前的父节点
	// 		if(nodeStack.length > 0) {
	// 			const parentName = param.field.substring(0, param.field.lastIndexOf('.'));
	// 			if (nodeStackItemField != parentName) {
	// 				nodeStack.pop();
	// 			}
	// 		}

	// 		// 继续压入节点栈
	// 		let nodeStackItem 		= {};
	// 		nodeStackItem.type 		= param.type;
	// 		// if (param.field.indexOf('.') > -1) {
	// 		// 	nodeStackItem.field = param.field.substring(0, param.field.lastIndexOf('.')); 
	// 		// } else {
	// 			nodeStackItem.field = param.field;
	// 		// }
	// 		nodeStack.push(nodeStackItem);
	// 		schemas = schemAssign(schemas, nodeStack, nodeStackItem.field, {});
	// 		continue;
	// 	}

	// 	// 当前属性为复合属性array
	// 	if (param.type.indexOf('[]') > 0) {

	// 		// 判断父节点是否已经切换，如果已经切换，立刻pop掉当前的父节点
	// 		if(nodeStack.length > 0) {
	// 			const nodeStackItemType		= nodeStack[nodeStack.length - 1].type;
	// 			const nodeStackItemField	= nodeStack[nodeStack.length - 1].field;
	// 			const parentName					= param.field.substring(0, param.field.indexOf('.'));
	// 			if (nodeStackItemField != parentName) {
	// 				nodeStack.pop();
	// 			}
	// 		}

	// 		// 剥离出所有的连续嵌套的array
	// 		const arrayDeepth = param.type.match(/\[/ig).length;
	// 		for (let j = 0; j < arrayDeepth; j++) {
	// 			let nodeStackItem 		= {};
	// 			nodeStackItem.type 		= param.type;
	// 			nodeStackItem.field 	= param.field;
	// 			nodeStack.push(nodeStackItem);
	// 			schemas = schemAssign(schemas, nodeStack, nodeStackItem.field, []);
	// 		}

	// 		// 获取array元素的属性
	// 		const elemType 				= param.type.substring(0, param.type.indexOf('['));

	// 		// 数组的elem是简单类型
	// 		if (SimpleType[elemType]) {
	// 			// 不需要将简单elem的array压入节点栈
	// 			let schema 			= {};
	// 			schema.type 		= elemType;
	// 			schema.required = param.optional;
	// 			schemas = schemAssign(schemas, nodeStack, '', schema);
	// 			nodeStack.pop();
	// 			continue;
	// 		}

	// 		// 数组的elem是复合类型object
	// 		if (_.isString(elemType) && elemType.length > 0) {
	// 			let nodeStackItem 	= {};
	// 			nodeStackItem.type 	= 'Object';
	// 			nodeStackItem.field = '';
	// 			nodeStack.push(nodeStackItem);
	// 			schemas = schemAssign(schemas, nodeStack, nodeStackItem.field, {});
	// 			continue;
	// 		}
			
	// 	}
	// }

	// console.dir(schemas, {depth: 10});
	
	


	// reqestSchema.schema = schemas;
	reqestSchema.schema = schemaCreator(params);

	console.dir(reqestSchema, {depth: 10});
	
}

/**
 * apidoc http请求或者返回参数列表，转化为test-on-fire测试元schema
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
function schemaCreator (params) {
	
	// let params = originalRequestItem.parameter.fields.Parameter;
	
	// test-on-fire 输入信息
	let schemas 		= {};

	/**
	 * [nodeStack 节点栈]
	 * @nodeStackItem {Array}
	 * @nodeStackItem.type 		 	param type 
	 * @nodeStackItem.field 		param field
	 */
	let nodeStack		= [];


	for (var i = 0; i < params.length; i++) {

		// apidoc 参数对象
		const param = params[i];

		// test-on-fire 测试配置元
		let schema = {};

		// 当前节点栈基本信息
		let nodeStackItemType, nodeStackItemField;

		if (nodeStack.length > 0) {
			nodeStackItemType = nodeStack[nodeStack.length - 1].type;
			nodeStackItemField = nodeStack[nodeStack.length - 1].field;	
		}

		// 当前属性为简单属性
		if(SimpleType[param.type]) {		

			// 父节点是array，当前为简单类型的情况，会直接在父节点酒杯处理掉，这里不需要再进行判断了

			// 父节点是object
			if (nodeStack.length > 0 
				&& nodeStack[nodeStack.length - 1].type 	== 'Object') {

				const parentName				= param.field.substring(0, param.field.lastIndexOf('.'));
				const propertyName 			= param.field.substring(param.field.lastIndexOf('.') + 1);
				
				// 父节点为object，父节点的父节点为数组
				if (nodeStackItemField == '' && nodeStack.length > 1) {
					schema.type 			= param.type;
					schema.required		= param.optional;
					schemas = schemAssign(schemas, nodeStack, propertyName, schema);

					// 需要连续pop两次，pop掉当前的父节点和父节点的父节点array
					nodeStack.pop(); nodeStack.pop();
					continue;
				}

				// 父节点为object，父节点的父节点不是object，而且，父节点没有切换
				if (nodeStackItemField == parentName) {
						schema.type 				= param.type.toLowerCase();
						schema.required			= param.optional;
						schemas = schemAssign(schemas, nodeStack, propertyName, schema);
						continue;
				}

				// 父节点已经切换
				nodeStack.pop();
			}

			// 父节点为顶级
			if (nodeStack.length == 0) {
				schema.type 					= param.type.toLowerCase();
				schema.required 			= param.optional;
				schemas = schemAssign(schemas, nodeStack, param.field, schema);
				continue;
			}
		}

		// 当前属性为复合属性object
		if (param.type === 'Object') {

			// 判断父节点是否已经切换，如果已经切换，立刻pop掉当前的父节点
			if(nodeStack.length > 0) {
				const parentName = param.field.substring(0, param.field.lastIndexOf('.'));
				if (nodeStackItemField != parentName) {
					nodeStack.pop();
				}
			}

			// 继续压入节点栈
			let nodeStackItem 		= {};
			nodeStackItem.type 		= param.type;
			// if (param.field.indexOf('.') > -1) {
			// 	nodeStackItem.field = param.field.substring(0, param.field.lastIndexOf('.')); 
			// } else {
				nodeStackItem.field = param.field;
			// }
			nodeStack.push(nodeStackItem);
			schemas = schemAssign(schemas, nodeStack, nodeStackItem.field, {});
			continue;
		}

		// 当前属性为复合属性array
		if (param.type.indexOf('[]') > 0) {

			// 判断父节点是否已经切换，如果已经切换，立刻pop掉当前的父节点
			if(nodeStack.length > 0) {
				const nodeStackItemType		= nodeStack[nodeStack.length - 1].type;
				const nodeStackItemField	= nodeStack[nodeStack.length - 1].field;
				const parentName					= param.field.substring(0, param.field.indexOf('.'));
				if (nodeStackItemField != parentName) {
					nodeStack.pop();
				}
			}

			// 剥离出所有的连续嵌套的array
			const arrayDeepth = param.type.match(/\[/ig).length;
			for (let j = 0; j < arrayDeepth; j++) {
				let nodeStackItem 		= {};
				nodeStackItem.type 		= param.type;
				nodeStackItem.field 	= param.field;
				nodeStack.push(nodeStackItem);
				schemas = schemAssign(schemas, nodeStack, nodeStackItem.field, []);
			}

			// 获取array元素的属性
			const elemType 				= param.type.substring(0, param.type.indexOf('['));

			// 数组的elem是简单类型
			if (SimpleType[elemType]) {
				// 不需要将简单elem的array压入节点栈
				let schema 			= {};
				schema.type 		= elemType;
				schema.required = param.optional;
				schemas = schemAssign(schemas, nodeStack, '', schema);
				nodeStack.pop();
				continue;
			}

			// 数组的elem是复合类型object
			if (_.isString(elemType) && elemType.length > 0) {
				let nodeStackItem 	= {};
				nodeStackItem.type 	= 'Object';
				nodeStackItem.field = '';
				nodeStack.push(nodeStackItem);
				schemas = schemAssign(schemas, nodeStack, nodeStackItem.field, {});
				continue;
			}
			
		}
	}

	return schemas;
}


/**
 * 循环为test-on-fire schema 赋值
 * @param  {[type]} schema    [description]
 * @param  {[type]} nodeStack [description]
 * @param  {[type]} key       [description]
 * @param  {[type]} value     [description]
 * @return {[type]}           [description]
 */
function schemAssign(schema, nodeStack, key, value) {

	let deepSchema = schema;

	// 节点栈为空，当前为顶级，直接赋值
	if (nodeStack.length == 0) {
		schema[key] = value;
		return schema;
	}

	// 循环节点栈，找到当前最深处测试元的位置
	nodeStack.forEach((nodeStackItem) => {

		let type = nodeStackItem.type;

		// 得到当前最深处节点name(field) 以及 新插入的测试元的name(key)
		let field;
		if (nodeStackItem.field.indexOf('.') > -1) {
			field = nodeStackItem.field.substring(nodeStackItem.field.lastIndexOf('.') + 1);
			key 	= key.substring(key.lastIndexOf('.') + 1);
		} else {
			field = nodeStackItem.field;
		}

		// console.log('>>>>>>', nodeStack, field, key, value);

		if (deepSchema[field] == undefined) {
			return;
		}

		if (_.isArray(deepSchema[field])) {
			if (_.isObject(deepSchema[field][0])) {
				deepSchema = deepSchema[field][0];
			} else {
				deepSchema = deepSchema[field];
			}
			return;
		}

		deepSchema = deepSchema[field];

	});

	// 填充测试元
	if (_.isArray(deepSchema)) {
		deepSchema[0] = value;
	} else {

		deepSchema[key] = value;
	}

	return schema;
}

translator(result);