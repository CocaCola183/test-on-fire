# test-on-fire
Test for self use

## Before you start
* node 4.1

## Installation
```js
npm install test-on-fire
```

## Simple usage
```js
let test = require('test-on-fire');
let AvailabilityTest = test.AvailabilityTest;
let at = new AvailabilityTest(schema, {urlPrefix: 'http://localhost:3000'});
at.run();
```
explain:  

* schema is an object like this:  

```js
{
	"req": {
		"get": {
			"/validator": {
				"name": {"type": "string", "required": true}
			}
		},
		"post": {
			"/validator": {
				"name": {"type": "string", "required": true}
			}
		},
		"put": {
			"/validator": {
				"name": {"type": "string", "required": true}
			}
		},
		"delete": {
			"/validator": {
				"name": {"type": "string", "required": true}
			}
		}
	},
	"res": {
		"get": {
			"/validator": {
				"status": {"type": "string", "required": true}
			}
		},
		"post": {
			"/validator": {
				"status": {"type": "string", "required": true}
			}
		},
		"put": {
			"/validator": {
				"status": {"type": "string", "required": true}
			}
		},
		"delete": {
			"/validator": {
				"status": {"type": "string", "required": true}
			}
		}
	}
}
```

If you want to know more about this, click [here](https://www.npmjs.com/package/validator-json)  

* urlPrefix is needed, if you set prefix `http://localhost:3000`, test will get/post/put/delete `http://localhost:3000/validator`  

## License
MIT




