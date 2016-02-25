'use strict';
let Test = require('./test');
let co = require('co');
let should = require('should');
let request = require('co-request');
let vi = require('vi-mock');
let validator = require('validator-json');

require('co-mocha');

class AvailabilityTest extends Test {
	constructor(schema, opts) {
		super(schema);
		this.adapter = {
			url: urlAdapter,
			param: paramAdapter,
			req: reqAdapter
		};

		opts = opts || {}
		this.urlPrefix = opts.urlPrefix
	}

	run() {
		return run(this);
	}
}

/**
 * url adapter
 * @param  {[type]} method request method
 * @param  {[type]} url    request url
 * @param  {[type]} params request params
 * @return {[type]}        fixed url
 */
function urlAdapter (method, url, params) {
	if(method === 'get') {
		return url+params;
	}
	return url;
}

/**
 * params adapter
 * @param  {[type]} method request method
 * @param  {[type]} params request parmas
 * @return {[type]}        fixed params
 */
function paramAdapter (method, params) {
	if(method.toLowerCase() === 'get') {
		var param_array = [];
		Object.keys(params).forEach(function(key) {
			return param_array.push(key + '=' + params[key]);
		});
		return '?' + param_array.join('&');
	}
	return params;
}

/**
 * method adapter
 * @param  {[type]} method request method
 * @param  {[type]} req    request handler
 * @param  {[type]} params request params
 * @return {[type]}        fixed request handler
 */
function reqAdapter (method, url, params) {
	if(method === 'get')  return request({
		method: method.toUpperCase(),
		uri: url,
		json: true
	}); 
	return request({
		method: method.toUpperCase(),
		uri: url,
		json: true,
		body: params
	});
}

/**
 * run main availability test
 * @param  {[type]} ati availability test instances
 */
function run (ati) {
	/*test schema error*/
	it(`check schema`, function* () {
		ati.errors.should.be.eql([]);
	});

	/*run main avaiablity test*/
	Test.traverseMethods('req', ati.schema.req, (method, urls) => {
		Test.traverseUrls(method, urls, (url, schema) => {
			let params = ati.adapter.param(method, vi.object(schema));
			const originalUrl = url;
			url = ati.adapter.url(method, url, params);
			it(`${method.toUpperCase()}: ${url} `, function* () {
				let result = yield ati.adapter.req(method, ati.urlPrefix + url, params);
				let body = result.body;
				body.should.have.property('status', 'success');
				let errors = validator(body, ati.schema.res[method][originalUrl]);
				errors.should.be.eql([]);
			});
		});
	});
}

module.exports = AvailabilityTest;

/*====================================================================test=============================================================================*/
let urlPrefix = 'http://localhost:3000';
let schema = require('fs').readFileSync('../config.json');
let test = new AvailabilityTest(JSON.parse(schema.toString()), {urlPrefix: urlPrefix});
test.run();





