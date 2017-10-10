'use strict';

class DataPoint{
	constructor(measurement, valuesObject, runDate){
		this.measurement = measurement;
		this.fields = valuesObject;
		if(runDate != null){
			this.timestamp = runDate;
		}
	}
}
module.exports = DataPoint;
