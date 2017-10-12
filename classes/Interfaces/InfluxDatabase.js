'use strict'

const Influx = require('influx');
const config = require('../../config.json');

class InfluxDatabase{
	constructor(dbName){
		var databaseName = dbName;
		const influx = new Influx.InfluxDB({
			host: config.influx.host,
			port: config.influx.port,
			username: config.influx.user,
			password: config.influx.password,
			database: databaseName
		});

		createDatabase(databaseName);

		async function createDatabase(dbName){
			var dbNames = await influx.getDatabaseNames();
			if(!dbNames.includes(dbName)){
				var subscriptionDb = await influx.createDatabase(dbName);
			}
			return 1;
		}

		this.writePoints = function(arrayOfPoints){
			influx.writePoints(arrayOfPoints);
		}

		this.writeMeasurement = function(measurement, listOfdataObjects){

			if(listOfDataObjects[0].fields == null){
				new Error('measurement data objects must contain a fields object')
			}
		}


	}
}
module.exports = InfluxDatabase;
