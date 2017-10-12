'use strict'
const schedule = require('node-schedule');

const AhaApi = require('../Interfaces/AhaApi.js');
const NodeStorage = require('node-storage');
const DateTimeService = require('../Services/DateTimeService.js');

class AhaBugDataStore{
	constructor(){
		var ahaApi = new AhaApi();
		var storage = new NodeStorage('./data/BugStorage.json');
		var scheduledFetch = schedule.scheduleJob('0 */12 * * *', function(){
			console.log('running scheduled fetch');
			fetchAllData();
		});

		this.getAllData = async function(){
			var data;

			if(useCache() == false){
				console.log('cache has expired. Fetching new data...');
				var result = await fetchAllData();
			}

			return storage.get('data');
		}

		function useCache(){
			var lastUpdate = storage.get('lastUpdate');
			var bool = false;

			if(lastUpdate == undefined){
				return bool;
			}

			if(DateTimeService.now() < DateTimeService.addTime(lastUpdate, 24, 'hours')){
				bool = true;
			}
			return bool;
		}

		async function fetchAllData(){
			console.log("fetching data");
			var result = await ahaApi.getAllBugs();

			//Update the storage
			storage.put('data', result);
			storage.put('lastUpdate', DateTimeService.now());
			return result;
		}

	}
}
module.exports = AhaBugDataStore;
