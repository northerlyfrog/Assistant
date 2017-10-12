'use strict'
//var requestPromise = require('request-promise');

const limit = require('simple-rate-limiter');
const request = limit(require("request-promise")).to(1).per(200);


class HttpService{

	static async makeJsonRequest(parameters){

		var response = new Promise(function(resolve,reject){
			
			request(parameters,function(err,res, body){
				if(err != null) return reject(err);
				resolve(res);
			});
		})
			.catch(
				(response) => {
					throw new Error("Request Failed with " + response.message);
				}
			)
			.then(
				(response) => {
					return response.body;
				}
			)
		return response;
	}
}
module.exports = HttpService;
