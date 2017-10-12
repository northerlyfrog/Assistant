'use strict'

const MysqlApi = require('../Interfaces/MysqlApi.js');
const config = require('../../config.json');
const DateTimeService = require('../Services/DateTimeService.js');
const InfluxDatabase = require('../Interfaces/InfluxDatabase.js');

class SubscriptionDataStore{
	constructor(){
		var mysqlApi = new MysqlApi();
		const influx = new InfluxDatabase('businessMetricData'); 

		this.getAllData = async function(){
			var result = await mysqlApi.getSubscriptionInfo();

			return result;
			var currentSubscriptionCount = result.totalSubscriptionCount;
			var currentUniqueDevicesWithSubscriptions = result.totalSubscribedDeviceCount;

			var point = {
				measurement: 'subscriptions',
				fields: {
					totalCount: currentSubscriptionCount,
					uniqueDevices: currentUniqueDevicesWithSubscriptions
				}
			}

			var oldPoints = iterateToCreatePastNumbers();
			oldPoints.push(point);

			influx.writePoints(oldPoints);

		}

		function iterateToCreatePastNumbers(){
			var records = [];

			var startSubscriptions = 288740;
			var quarterlyDecrement = [9401, 13148, 11863, 15257, 13698, 15596, 15031, 1405, 15214];
			var startDate = new Date(2017, 8, 1, 0, 0, 0, 1);

			var pointTemplate = {
				measurement: 'subscriptions',
				fields: {
					uniqueDevices: startSubscriptions
				},
				timestamp: startDate
			}
			records.push(pointTemplate);

			var q4_start = pointTemplate;
			q4_start.fields.uniqueDevices = 289656;
			q4_start.timestamp = new Date(2017, 9, 2, 0,0,0,1);
			records.push(q4_start);



			for(var i=0; i<quarterlyDecrement.length; i++){
				startSubscriptions -= quarterlyDecrement[i];
				var subscriptions = startSubscriptions;
				startDate = DateTimeService.subtractTime(startDate, 91.25, 'days');
				var date = startDate;

				var newPoint = {
					measurement: 'subscriptions',
					fields:{
						uniqueDevices: subscriptions
					},
					timestamp: new Date(date)
				};

				records.push(newPoint);
			}
			return records;
		}
	}
}
module.exports = SubscriptionDataStore;

