'use strict'

class RegistryReporter{
	constructor(){

		this.output = function(metric){
			console.log(JSON.stringify(metric,null,2));
		}

		this.report = function(metricsWithValues){
			var metrics = metricsWithValues;

			console.log('Reporting On metrics');

			for(var i=0; i<metrics.length; i++){

				this.output(metrics[i]);
			}

		}
	}
}
module.exports = RegistryReporter;
