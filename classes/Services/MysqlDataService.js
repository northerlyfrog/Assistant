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
			var cohortData = new Metric('aggregatedAgencyData', 'watch our agencies by when they were created', agencyData, 'AgencyData');

			return [classificationFeature, subscriptionMeasurements, cohortData ];
		}

		async function classificationData(){
			var result = await mysqlApi.getClassificationData();
			return result;
		}

		async function subscriptionData(){
			var result = await mysqlApi.getSubscriptionData();
			return result;
		}

		async function agencyData(){
			var queryResult = await mysqlApi.getAgencyCohortData();

			var total = queryResult[(queryResult.length -1)].id;
			console.log(total);
			
			var paid = 0;
			var freeUnlimited = 0;
			var freeLimited = 0;
			var trial = 0;

			
			for(var i=0; i<queryResult.length; i++){
				
				var agency = queryResult[i];

				if(agency.status == 'paid'){
					paid++;
				} else if(agency.status == 'free_unlimited'){
					freeUnlimited++;
				} else if(agency.status == 'free_limited'){
					freeLimited++;
				}
				else {
					trial++;
				}
			}

			return {
				totalCreated: total,
				existing: queryResult.length,
				deleted: total - queryResult.length,
				paid: paid,
				freeUnlimited: freeUnlimited,
				freeLimited: freeLimited,
				trial: trial
			};
		}

		async function agencyLocationData(){
			var result = await mysqlApi.getAgencyLocationData();
			console.log(result);
			return result;
		}

	}

}
module.exports = MysqlDataService;
