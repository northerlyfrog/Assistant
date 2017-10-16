'use strict'

const config = require('../../config.json');
const mysql = require('mysql2/promise');

class MysqlApi{
	constructor(){

		async function connect(){
			var connection = mysql.createConnection({
				host : config.mysql.host,
				user : config.mysql.user,
				password : config.mysql.password,
				database : config.mysql.database
			});
			return connection;
		}

		this.getAgencyCohortData = async function(){
			var connection = await this._connect()

			var [rows, fields] = await connection.execute(
				`SELECT DISTINCT
				agencies.id,
				agencies.country as country, 
				agencies.status as status,
				DATE_FORMAT(agencies.created, '%m/%d/%y') AS created,
				COUNT(membership.agency_id) as devices
				FROM agencies 
				LEFT JOIN membership ON agencies.id = membership.agency_id
				GROUP BY agencies.id
				ORDER BY agencies.id DESC
				`);

			return rows;
		}

		this.getClassificationData = async function(){
			var connection = await connect();

			var data = {};

			var [rows, fields] = await connection.execute(
				`SELECT COUNT(type_jdoc) AS classifiedAlerts
				FROM alerts
				`);

			data.totalClassifiedAlerts = rows[0].classifiedAlerts;
			return data;
		}

		this.getSubscriptionData = async function(){
			var connection = await connect();
			
			var data = {};

			var [rows, fields] = await connection.execute(
				`SELECT SUM(device_count) AS totalSubscriptionCount
				FROM subscriptions
				WHERE expired = 'no'`);

//			data.totalSubscriptionCount = Number(rows[0].totalSubscriptionCount);
			data.totalCount = Number(rows[0].totalSubscriptionCount);

			var [rows, fields] = await connection.execute(
				`SELECT COUNT(DISTINCT devices.id) as uniqueDevicesWithSubscriptions
				FROM devices
				LEFT JOIN subscriptions ON devices.subscription_id = subscriptions.id
				WHERE subscriptions.expired = "no"`);

//			data.totalSubscribedDeviceCount = Number(rows[0].uniqueDevicesWithSubscriptions);

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
module.exports = MysqlApi;
