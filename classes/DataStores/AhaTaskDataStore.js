'use strict'
const schedule = require('node-schedule');

const AhaApi = require('../Interfaces/AhaApi.js');
const NodeStorage = require('node-storage');
const DateTimeService = require('../Services/DateTimeService.js');

class AhaTaskDataStore{
	constructor(){
		var ahaApi = new AhaApi();
		var storage = new NodeStorage('./data/assistant/TaskStorage.json');

		var scheduledFetch = schedule.scheduleJob('*/15 * * * *', function(){

console.log('running scheduled fetch');

			fetchAllData();
		});

		this.getAllData = async function(){
			var data;

			if(useCache() == false){
				console.log('cache has expired. Fetching new Tasks...');
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
			var result = await ahaApi.getAllTasks();

			//Update the storage
			storage.put('data', result);
			storage.put('lastUpdate', DateTimeService.now());
			return result;
		}

	}
}
module.exports = AhaTaskDataStore;
