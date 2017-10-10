'use strict'
var requestPromise = require('request-promise');


class HttpService{

	static async makeJsonRequest(parameters){
	
		var response = await requestPromise(parameters)
			.catch(
				(response) => {
					throw new Error("Request Failed with " + response.message);
				}
			);

		return response;
	}
}
module.exports = HttpService;
