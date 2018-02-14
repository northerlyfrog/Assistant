'use strict'

const config = require('../../config.json');
const mysql = require('mysql2/promise');
const InfluxDatabase = require('../Interfaces/InfluxDatabase.js');
const DataPoint = require('../DataObjects/DataPoint.js');
const DateTimeService = require('../Services/DateTimeService.js');
class Active911MysqlInterface{
	constructor(){
	
		const influx = new InfluxDatabase();

		async function connect(){
			var connection = mysql.createConnection({
				host : config.mysql.host,
				user : config.mysql.user,
				password : config.mysql.password,
				database : config.mysql.database
			});
			return connection;
		}

		this.collectData = function(){
			this.getAgencyCohortData();
		}

		this.getAgencyCohortData = async function(){
			var connection = await connect();

			var [rows, fields] = await connection.execute(
				`SELECT agencies.id,
				agencies.status as status,
				agencies.created as created,
				DATE_FORMAT(agencies.created, '%X/%V') as weekCohort,
				COUNT(membership.agency_id) as devices
				FROM agencies
				LEFT JOIN membership ON agencies.id = membership.agency_id
				GROUP BY weekCohort,agencies.status,agencies.id`
			);

			normalizeAndSaveAgencyCohortData(rows);

			return rows;
		}

		function normalizeAndSaveAgencyCohortData(data){
			var rows = data;
			var dataPoints = [];
			for(var i=0; i<rows.length; i++){
				//	console.log(rows[i]);
				var data = rows[i];

				var fields = {
					id : data.id,
					deviceCount: data.devices
				};
				var tags = {
					weekCohort: data.weekCohort,
					status: data.status,
					agencyId : data.id
				};
				var point = new DataPoint('rawAgencyData', fields, tags, new Date(data.created));
				dataPoints.push(point);
			}

			influx.writePoints(dataPoints);
		}

		function sleep(ms){
			return new Promise(resolve => setTimeout(resolve, ms));
		}


		this.getClassificationData = async function(){
			var connection = await connect();

			var data = {};

			var [rows, fields] = await connection.execute(
				`SELECT COUNT(type_jdoc) AS classifiedAlerts
				FROM alerts
				`);

			data.totalClassifiedAlerts = rows[0].classifiedAlerts;
			console.log(data);
			return data;
		}

		this.getSubscriptionData = async function(){
			var connection = await connect();

			var data = {};

			var [rows, fields] = await connection.execute(
				`SELECT SUM(device_count) AS totalSubscriptionCount
				FROM subscriptions
				WHERE expired = 'no'`);

			data.totalCount = Number(rows[0].totalSubscriptionCount);

			var [rows, fields] = await connection.execute(
				`SELECT COUNT(DISTINCT devices.id) as uniqueDevicesWithSubscriptions
				FROM devices
				LEFT JOIN subscriptions ON devices.subscription_id = subscriptions.id
				WHERE subscriptions.expired = "no"`);

			data.uniqueDevices = Number(rows[0].uniqueDevicesWithSubscriptions);

			return data;
		}

		/*
			var totalDevices = await queryData('SELECT COUNT(DISTINCT devices.id) as deviceCount FROM devices LEFT JOIN subscriptions ON devices.subscription_id = subscriptions.id WHERE subscriptions.expired = "no"')

			results.totalCount = totalCount;
			results.totalDevices = totalDevices;
			console.log(results);
		}

		function queryData(query){

			return new Promise(function(resolve, reject){


			}

				var result = await connection.query(query, function(error, results, fields){
					if(error) throw error
				});

				console.log(result);
				return result;
			}
			*/
	}
}
module.exports = Active911MysqlInterface;
