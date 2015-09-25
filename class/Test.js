'use strict';

/**
 * TODO  对象细分，将schema拆分成一个个validate对象
 */


var _ = require('lodash');
var co = require('co');

const ALLOEWD_METHOD = {
	get: true,
	post: true,
	put: true,
	delete: true
};

const ERROR = {
	SCHEMA_TYPE_ERROR: 'wrong type of schema',
	NOT_ALLOWED_METHOD: 'got not allowed method',
	LACK_OF_RES_SCHEMA: 'need res schema of this url'
};

class Test {
	constructor(schema) {
		this.schema = schema;
		this.adapter = {};
		this.allowedMethod = ALLOEWD_METHOD;
		this.errors = Test.validate(schema) || [];
	}

	static validate(schema) {
		return validateSchema(schema);
	}

	static traverseHandlers(schema, callback) {
		return traverseHandlers(schema);
	}

	static traverseMethods(handler, methods, callback) {
		return traverseMethods(handler, methods, callback);
	}

	static traverseUrls(method, urls, callback) {
		return  traverseUrls(method, urls, callback);
	}
}



function validateSchema(schema) {
	let errors;

	/*check schema is an object or not*/
	if(!_.isPlainObject(schema)) {
		return ERROR.SCHEMA_TYPE_ERROR;
	}

	/*validate method*/
	errors = validateRequestMethods(schema);
	if(errors.length) return errors;

	/*validate req && res is consistent or not*/
	errors = validateUrlConsistency(schema);
	if(errors.length) return errors;

}

/**
 * validate method
 * @param  {[type]} schema test schema
 * @return {[type]}        errors
 */
function validateRequestMethods (schema) {
	let handlerError = traverseHandlers(schema, function(handler, methods) {
	let methodError = traverseMethods(handler, methods, function(method) {
			if(!ALLOEWD_METHOD[method]) return `${handler} schema got not allowed request method ${method}`;
	 	});
	 	if(methodError) return methodError;
	});
	if(handlerError) return handlerError;
}

/**
 * validate req && res is consistent or not
 * @param  {[type]} schema test schema
 * @return {[type]}        errors
 */
function validateUrlConsistency (schema) {
	let methodError = traverseMethods('req', schema.req, function(method, urls) {
		let urlError = traverseUrls(method, urls, function(url, validateSchema) {
			if(!_.isPlainObject(schema.res[method]) || !_.isPlainObject(schema.res[method][url])) return `${ERROR.LACK_OF_RES_SCHEMA}: ${url}`;
		});
		if(urlError) return urlError;
	});
	if(methodError) return methodError;
}

/**
 * traverseHandlers
 * @param  {[type]}   schema   test schema
 * @param  {Function} callback fuction run in the loop
 * @return {[type]}            errors
 */
function traverseHandlers(schema, callback) {
	schema = schema || {};

	let errors = [];

	if(!_.isPlainObject(schema)) {
		return 'schema should be a plainObject';
		return errors;
	}

	for (let handler in schema) {
		let error = callback(handler, schema[handler]);
		if(error) {
			 if(_.isArray(error)) {
			 		errors = errors.concat(error);
			 } else {
			 	errors.push(error);
			 }	
		}
	}

	return errors;
}

/**
 * traverseMethods
 * @param  {[type]}   handler  req or res
 * @param  {[type]}   methods  rquest methods
 * @param  {Function} callback function run in the loop
 * @return {[type]}            errors
 */
function traverseMethods(handler, methods, callback) {

	methods = methods || {};

	let errors = [];

	if(!_.isPlainObject(methods)) {
		errors.push(`${handler} should be a plainObject`);
		return errors;
	}

	for (let method in methods) {
		let error = callback(method, methods[method]);
		if(error) {
			 if(_.isArray(error)) {
			 		errors = errors.concat(error);
			 } else {
			 	errors.push(error);
			 }	
		}
	}

	return errors;
}

// function traverseMethodsPromise(handler, methods, callback) {
// 	let errors = traverseMethods(handler, methods, callback);
// 	return new Promise((resolve, reject) => {
// 		if(errors.length) return reject(errors);
// 		return resolve(true); 
// 	});
// }

/**
 * traverseUrls
 * @param  {[type]}   method   request method
 * @param  {[type]}   urls     urls to be validate under the method
 * @param  {Function} callback function run in the loop
 * @return {[type]}            errors
 */
function traverseUrls(method, urls, callback) {
	urls = urls || {};

	let errors = [];

	if(!_.isPlainObject(urls)) {
		errors.push(`${method} should be a plainObject`);
		return errors;
	}

	for (let url in urls) {
		let error = callback(url, urls[url]);
		if(error) {
			 if(_.isArray(error)) {
			 		errors = errors.concat(error);
			 } else {
			 	errors.push(error);
			 }	
		}
	}

	return errors;
}

module.exports = Test;

// const errorSchema3 = {
// 	req: {
// 		get: {
// 			'/validator': {}
// 		}
// 	},
// 	res: {

// 	}
// };
// let test = new Test(errorSchema3);
// console.log(test);