'use strict'
const Service = require('./Service.js');
const Metric = require('../DataObjects/Metric.js');
const DateTimeService = require('../Services/DateTimeService.js');

const ServiceDataStore = require('../DataStores/SubscriptionDataStore.js');

class SubscriptionService extends Service{
	constructor(){
		super();
		var dataStore = new ServiceDataStore();
		var metrics = createMetrics();
		

	}

}
module.exports = SubscriptionService;
