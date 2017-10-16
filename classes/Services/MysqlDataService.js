'use strict'
const Service = require('./Service.js');
const Metric = require('../DataObjects/Metric.js');
const DateTimeService = require('../Services/DateTimeService.js');
const MysqlApi = require('../Interfaces/MysqlApi.js');

class MysqlDataService extends Service{
	constructor(){
		super();
		var mysqlApi = new MysqlApi();
		var metrics = createMetrics();
		
		this.returnMetrics = function(){
			return metrics;
		}

		function createMetrics(){

			var classificationFeature = new Metric('alertClassification', 'measure alert classification usage', classificationData, 'featureMetricData');

			var subscriptionMeasurements = new Metric('subscriptions', 'track our subscriptions over time', subscriptionData, 'businessMetricData');

			return [classificationFeature, subscriptionMeasurements];
		}

		async function classificationData(){
			var result = await mysqlApi.getClassificationData();
			return result;
		}

		async function subscriptionData(){
			var result = await mysqlApi.getSubscriptionData();
			console.log(JSON.stringify(result, null, 2));
			return result;
		}

	}

}
module.exports = MysqlDataService;
