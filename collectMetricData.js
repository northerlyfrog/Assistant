'use strict'
const schedule = require('node-schedule');

const Active911MysqlInterface = require('./classes/Interfaces/Active911MysqlDBInterface.js');

collectMetricData();

schedule.scheduleJob('* * */1 * * *', collectMetricData);

function collectMetricData(){
	var mysqlInterface = new Active911MysqlInterface();
	mysqlInterface.collectData();

}
