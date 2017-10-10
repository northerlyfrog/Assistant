'use strict'
var DateTimeService = require('../Services/DateTimeService.js');

class Metric{
	constructor(name, description, measurementFunction){
		this.name = name;
		this.description = description;
		this.runTimestamp = null;
		this.value = null;
		this.measurementFunction = measurementFunction;

		this.run = async function(){
			this.value = await this.measurementFunction();
			this.runTimestamp = DateTimeService.now();
			return 1;
		}
	}
}
module.exports = Metric;
