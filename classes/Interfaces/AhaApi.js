'use strict'
const config = require('../../config.json');
const limit = require('simple-rate-limiter');
const request = limit(require("request")).to(1).per(200);

const ProgressBar = require('progress');

const HttpService = require('./httpService.js');
const DateTimeService = require('../Services/DateTimeService.js');

class AhaApi{
	constructor(){

		var apiKey = config.aha.key;
		var headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + apiKey
		}
		var intervalBetweenRequestsInMs = 205;
		var baseUrl = "https://active911.aha.io/api/v1";
		var productId = config.aha.featureProductId;

		this.getAllIdeas = async function(){

var url = baseUrl +"/products/"+productId+"/ideas";
			var allRecords = await getAllRecords(url);
			var individualData = await getInDepthData(baseUrl+"/ideas", allRecords);
			return individualData;
		}

		this.getAllTasks = async function(){

			var url = baseUrl + "/tasks";
			var allRecords = await getAllRecords(url);
			var individualData = await getInDepthData(url+"/", allRecords);
			return individualData;
		}

		this.getAllFeatures = async function(){

			var releases = await this.getAllReleases();

			var url = baseUrl+"/products/"+productId+"/features";
			var allRecords = await getAllRecords(url);
			var individualData = await getInDepthData(baseUrl+"/features", allRecords);


			for (var i=0; i<individualData.length; i++){
				var individual = individualData[i];
				var taskUrl = baseUrl+"/features/"+individual.id+"/tasks";
				var allTasks = await getAllRecords(taskUrl);
				
				individualData[i].tasks = allTasks.data;
			}
			return individualData;
		}

		this.getAllBugs = async function(){
			var productId = await getProductIdByKey('A911BUG');
			var url = baseUrl+"/products/"+productId+"/ideas";
			var allRecords = await getAllRecords(url);
			var individualData = await getInDepthData(baseUrl+"/ideas", allRecords);
			return individualData;
		}

		this.getAllReleases = async function(){
			var url = baseUrl +"/products/"+productId+"/releases";
			var allRecords = await getAllRecords(url);
			var individualData = await getInDepthData(baseUrl+"/releases", allRecords);
			return individualData;
		}

		async function getAllProducts(){
			var url = baseUrl+"/products";
			var allRecords = await getAllRecords(url);
			return allRecords;
		}

		async function getProductIdByKey(key){
			var key = key;
			var products = await getAllProducts();
			var productId = null;
			for(var i=0; i<products.data.length; i++){
				var product = products.data[i];
				if(product.reference_prefix == key){
					productId = product.id;
				}
			}

			if(productId == null){
				throw new Error('Failed to Find that product prefix key: '+key);
			}
			return productId;
		}

		async function getInDepthData(preIdUrl, listOfShallowItems){
			var allRecords = listOfShallowItems;
			var individualData = [];

			var bar = new ProgressBar('Fetching data [:bar] :rate/rps :percent :etas', { 
				total: allRecords.data.length - 1,
				width: 40,
				clear: true
			});

			for(var i=0; i<allRecords.data.length; i++){
				var individual = allRecords.data[i];
				var url = preIdUrl+"/"+individual.id;
				var response = await HttpService.makeJsonRequest(setCallParameters(url));
				var result = interpretResponse(response);
				individualData.push(result.data);
				bar.tick();
			}

			return individualData;
		}


		async function getAllRecords(url, options){
			var parameters = setCallParameters(url, options);
			var initialResponse = await HttpService.makeJsonRequest(parameters);
			var initialResult = interpretResponse(initialResponse);

			var pages = initialResult.pagination.pages;
			for(var i=2; i<=pages; i++){
				parameters.qs.page = i;

				var additionalResponse = await HttpService.makeJsonRequest(parameters);
				var additionalResults = interpretResponse(additionalResponse);
				initialResult.data = initialResult.data.concat(additionalResults.data);
			}
			return initialResult;
		}

		function interpretResponse(response){
			var result = {};
			var response = response;


			// Process the initial page of the request
			for(var key in response){
				if(key == 'pagination'){
					result.pagination = {};
					result.pagination.records = response[key]['total_records']
					result.pagination.pages = response[key]['total_pages'];
					result.pagination.currentPage = response[key]['current_page'];
				} else {
					result.data = response[key];
				}
			}
			return result;
		}

		function setCallParameters(url,options){
			var parameters = {
				uri : url,
				qs : {
					"per_page": 200
				},
				headers : headers,
				json: true
			}

			if(options != null){
				for (var property in options){
					parameters.qs[property] = options[property];
				}
			}
			return parameters;
		}

	}
}
module.exports = AhaApi;
