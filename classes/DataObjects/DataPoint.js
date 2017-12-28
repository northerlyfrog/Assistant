'use strict';

class DataPoint{
	constructor(measurement, valuesObject, tagsObject, runDate){
		this.measurement = measurement;
		this.fields = valuesObject;
		if(runDate != null){
			this.timestamp = runDate;
		}
		if(tagsObject != null){
			this.tags = tagsObject;
		}
	}
}
module.exports = DataPoint;
