'use strict';

const getApiInfo 	= require('../apidoc/getApiInfo.js');
const _ 					= require('lodash');

const result = getApiInfo();

const SimpleType = {
	Number: true,
	String: true,
	Boolean: true
}

function translator (result) {

	const originalData = JSON.parse(result.data.toString());

	let originalRequestItem = originalData[0];
	let reqestSchema 				= {};

	reqestSchema.httpMethod = originalRequestItem.type;
	reqestSchema.url 				= originalRequestItem.url;
	reqestSchema.name				= originalRequestItem.name;

	let params = originalRequestItem.parameter.fields.Parameter;

	console.log(params);
	
	let schemas 		= {};

	/**
	 * [typeStack 节点栈]
	 * @type {Array}
	 * @type 		 	param type
	 * @field 		param field
	 */
	let typeStack		= [];

	for (var i = 0; i < params.length; i++) {

		// apidoc 参数对象
		const param = params[i];

		// test-on-fire 测试配置元
		let schema = {};

		// 当前节点栈基本信息
		let typeStackItemType, typeStackItemField;

		if (typeStack.length > 0) {
			typeStackItemType = typeStack[typeStack.length - 1].type;
			typeStackItemField = typeStack[typeStack.length - 1].field;	
		}

		// 当前属性为简单属性
		if(SimpleType[param.type]) {		

			// 父级是array，当前为简单类型的情况，会直接在父级酒杯处理掉，这里不需要再进行判断了

			// 父级是object
			if (typeStack.length > 0 
				&& typeStack[typeStack.length - 1].type 	== 'Object') {

				const parentName				= param.field.substring(0, param.field.lastIndexOf('.'));
				const propertyName 			= param.field.substring(param.field.lastIndexOf('.') + 1);
				
				// 父级为object，父级的父级为数组
				if (typeStackItemField == '' && typeStack.length > 1) {
					schema.type 			= param.type;
					schema.required		= param.optional;
					schemas = schemAssign(schemas, typeStack, propertyName, schema);

					// 需要连续pop两次，pop掉当前的父级和父级的父级array
					typeStack.pop(); typeStack.pop();
					continue;
				}

				// 父级为object，父级的父级不是object，而且，父级没有切换
				if (typeStackItemField == parentName) {
						schema.type 				= param.type.toLowerCase();
						schema.required			= param.optional;
						schemas = schemAssign(schemas, typeStack, propertyName, schema);
						continue;
				}

				// 父级已经切换
				typeStack.pop();
			}

			// 父级为顶级
			if (typeStack.length == 0) {
				schema.type 					= param.type.toLowerCase();
				schema.required 			= param.optional;
				schemas = schemAssign(schemas, typeStack, param.field, schema);
				continue;
			}
		}

		// 当前属性为复合属性object
		if (param.type === 'Object') {

			// 判断父级是否已经切换，如果已经切换，立刻pop掉当前的父级
			if(typeStack.length > 0) {
				const parentName = param.field.substring(0, param.field.lastIndexOf('.'));
				if (typeStackItemField != parentName) {
					typeStack.pop();
				}
			}

			// 继续压入节点栈
			let typeStackItem 		= {};
			typeStackItem.type 		= param.type;
			// if (param.field.indexOf('.') > -1) {
			// 	typeStackItem.field = param.field.substring(0, param.field.lastIndexOf('.')); 
			// } else {
				typeStackItem.field = param.field;
			// }
			typeStack.push(typeStackItem);
			schemas = schemAssign(schemas, typeStack, typeStackItem.field, {});
			continue;
		}

		// 当前属性为复合属性array
		if (param.type.indexOf('[]') > 0) {

			// 判断父级是否已经切换，如果已经切换，立刻pop掉当前的父级
			if(typeStack.length > 0) {
				const typeStackItemType		= typeStack[typeStack.length - 1].type;
				const typeStackItemField	= typeStack[typeStack.length - 1].field;
				const parentName					= param.field.substring(0, param.field.indexOf('.'));
				if (typeStackItemField != parentName) {
					typeStack.pop();
				}
			}

			// 剥离出所有的连续嵌套的array
			const arrayDeepth = param.type.match(/\[/ig).length;
			for (let j = 0; j < arrayDeepth; j++) {
				let typeStackItem 		= {};
				typeStackItem.type 		= param.type;
				typeStackItem.field 	= param.field;
				typeStack.push(typeStackItem);
				schemas = schemAssign(schemas, typeStack, typeStackItem.field, []);
			}

			// 获取array元素的属性
			const elemType 				= param.type.substring(0, param.type.indexOf('['));

			// 数组的elem是简单类型
			if (SimpleType[elemType]) {
				// 不需要将简单elem的array压入节点栈
				let schema 			= {};
				schema.type 		= elemType;
				schema.required = param.optional;
				schemas = schemAssign(schemas, typeStack, '', schema);
				typeStack.pop();
				continue;
			}

			// 数组的elem是复合类型object
			if (_.isString(elemType) && elemType.length > 0) {
				let typeStackItem 	= {};
				typeStackItem.type 	= 'Object';
				typeStackItem.field = '';
				typeStack.push(typeStackItem);
				schemas = schemAssign(schemas, typeStack, typeStackItem.field, {});
				continue;
			}
			
		}
	}

	console.dir(schemas, {depth: 10});
	
}

function schemAssign(schema, typeStack, key, value) {

	let deepSchema = schema;

	// 节点栈为空，当前为顶级，直接赋值
	if (typeStack.length == 0) {
		schema[key] = value;
		return schema;
	}

	

	// 循环节点栈，找到当前最深处测试元的位置
	typeStack.forEach((typeStackItem) => {

		let type = typeStackItem.type;

		let field;
		if (typeStackItem.field.indexOf('.') > -1) {
			field = typeStackItem.field.substring(typeStackItem.field.lastIndexOf('.') + 1);
			key 	= key.substring(key.lastIndexOf('.') + 1);
		} else {
			field = typeStackItem.field;
		}

		// console.log('>>>>>>', typeStack, field, key, value);

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