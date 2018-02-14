'use strict'

const Influx = require('influx');
const config = require('../../config.json');

class InfluxDatabase{
	constructor(){
		const influx = new Influx.InfluxDB({
			host: config.influx.host,
			port: config.influx.port,
			username: config.influx.user,
			password: config.influx.password,
		});

		async function createDatabase(dbName){
			var dbNames = await influx.getDatabaseNames();
			if(!dbNames.includes(dbName)){
				var subscriptionDb = await influx.createDatabase(dbName);
			}
			return 1;
		}

		this.writePoints = function(arrayOfPoints){

			createDatabase('Metrics')
				.then(
					() => {

						var writeOptions = {
							database : 'Metrics'
						};
						influx.writePoints(arrayOfPoints, writeOptions);
					}
				)
		}

		this.writeMeasurement = function(measurement, listOfdataObjects){

			if(listOfDataObjects[0].fields == null){
				new Error('measurement data objects must contain a fields object')
			}
		}


	}
}
module.exports = InfluxDatabase;
