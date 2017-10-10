'use strict'
const InfluxDatabase = require('../Interfaces/InfluxDatabase.js');
const DataPoint = require('../DataObjects/DataPoint.js');

class RegistryRunner{
	constructor(){
		const influx = new InfluxDatabase('BPRMetricData');

		this.run = async function(listOfServices){
			var services = listOfServices;

			var result = collectMetrics(services);
			var completedMetrics = await runAllMetrics(result);
			await saveEachMetric(completedMetrics);


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
		async function saveEachMetric(listOfMetrics){
			
			var points = convertMetricsToDataPoints(listOfMetrics);
			influx.writePoints(points);
		}

		function convertMetricsToDataPoints(listOfMetrics){

			var listOfPoints = [];

			for(var i=0; i<listOfMetrics.length; i++){
				var metric = listOfMetrics[i];

				var point = new DataPoint(metric.name, metric.value);
				listOfPoints.push(point);
			}

			return listOfPoints;
		}


	}
}
module.exports = RegistryRunner;
