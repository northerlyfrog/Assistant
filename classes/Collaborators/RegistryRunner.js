'use strict'
const InfluxDatabase = require('../Interfaces/InfluxDatabase.js');
const DataPoint = require('../DataObjects/DataPoint.js');

class RegistryRunner{
	constructor(){
		//const influx = new InfluxDatabase('BPRMetricData');
		const influx = new InfluxDatabase();

		this.run = async function(listOfServices){
			var services = listOfServices;

			var result = collectMetrics(services);
			var completedMetrics = await runAllMetrics(result);
			await saveMetrics(completedMetrics);


			return result;
		}

		function collectMetrics(listOfServices){
			var metricList = [];
			var services = listOfServices;

			for(var i=0; i<services.length; i++){
				var service = services[i];

				var serviceMetrics = service.returnMetrics();
				metricList = metricList.concat(serviceMetrics);
			}

			return metricList;
		}

		async function runAllMetrics(listOfMetrics){

			for(var i=0; i<listOfMetrics.length; i++){

				var metric = listOfMetrics[i];
				await metric.run();
			}

			return listOfMetrics;
		}
		/*
		 * TODO: define a grafana timeseries database to store the result
		 * call this, update the tests
		 */
		async function saveMetrics(listOfMetrics){
			
			var bins = {
				
			};

			for(var i=0; i<listOfMetrics.length; i++){
				var metric = listOfMetrics[i];

				if(metric.database == null){
					throw new Error('A metric has an undefined database'+ metric.name +", " + metric.database);
				}
				if(bins[metric.database] == null){
					bins[metric.database] = [];
				}

				bins[metric.database].push(convertMetricToDataPoint(metric))
			}

			for(var key in bins){
				influx.writePoints(key, bins[key]);
			}

			//var points = convertMetricsToDataPoints(listOfMetrics);
			//influx.writePoints(points);
		}

		function convertMetricToDataPoint(metric){
			var metric = metric;

			return new DataPoint(metric.name, metric.value);
		}

		function convertMetricsToDataPoints(listOfMetrics){

			var listOfPoints = [];

			for(var i=0; i<listOfMetrics.length; i++){
				var metric = listOfMetrics[i];

				var point = convertMetricsToDataPoints(metric);
				listOfPoints.push(point);
			}

			return listOfPoints;
		}


	}
}
module.exports = RegistryRunner;
