/*
 * Basic Example
 *
 * This is a basic example for apiDoc.
 * Documentation blocks without @api (like this block) will be ignored.
 */

/**
 * @api {get} /user Get User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} 	id 						Users unique ID.
 * @apiParam {String} 	name 					Users name.
 * @apiParam {Boolean} 	sex 					Users sex.
 * @apiParam {Object} 	hobby 				Users hobby.
 * @apiParam {String} 	hobby.name 		Users name.
 * @apiParam {Object[]} hobbys 				Users hobby.
 * @apiParam {String} 	Object.name 		Users name.
 * @apiParam {String[]} hobbys1 				Users hobby.
 * @apiParam {String} 	name 		Users name.
 * @apiParam {String[][]} hobbys2 				Users hobby.
 * @apiParam {Object} 	userInfo 				Users hobby.
 * @apiParam {Object} 	userInfo.name 				Users hobby.
 * @apiParam {Object} 	userInfo.name.firstName 				Users hobby.
 * @apiParam {String} 	userInfo.name.firstName.one 				Users hobby.
 * @apiParam {String} 	userInfo.name.firstName.two 				Users hobby.
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */