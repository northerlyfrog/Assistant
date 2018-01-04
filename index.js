'use strict'
const schedule = require('node-schedule');
const InfluxDatabase = require('./classes/Interfaces/InfluxDatabase.js');

const Assistant = require('./classes/Collaborators/Assistant.js');
const RegistryCreator = require('./classes/Collaborators/RegistryCreator.js');
const RegistryRunner =  require('./classes/Collaborators/RegistryRunner.js');
const RegistryReporter = require('./classes/Collaborators/RegistryReporter.js');

const IdeaService = require('./classes/Services/AhaIdeaService.js');
const TaskService = require('./classes/Services/AhaTaskService.js');
const FeatureService = require('./classes/Services/AhaFeatureService.js');
const BugService = require('./classes/Services/AhaBugService.js');

const MysqlDataService = require('./classes/Services/MysqlDataService.js');
const MysqlApi = require('./classes/Interfaces/MysqlApi.js');

console.log('Starting Metrics');
runBPRMetrics();
runDataGatheringOld();

function runBPRMetrics(){

	var registryRunner = new RegistryRunner();
	var registryCreator = new RegistryCreator();
	var registryReporter = new RegistryReporter();

	var assistant = new Assistant(registryCreator, registryRunner, registryReporter);

	var ideaService = new IdeaService();
	var taskService = new TaskService();
	//var featureService = new FeatureService();
	var bugService = new BugService();
	var mysqlService = new MysqlDataService();
	var startingServices = [ideaService, taskService, bugService];


	//WorkflowHack To see instant work
	assistant.reportOnMetrics(startingServices);


	var runScheduledMetricReport = schedule.scheduleJob('0 * * * 1-5', function(){
		console.log('Running BPR Metrics');
		assistant.reportOnMetrics(startingServices)
	});
}

function runDataGatheringOld(){
	var runner = new RegistryRunner();
	var creator = new RegistryCreator();
	var reporter = new RegistryReporter();
	var assistant = new Assistant(creator, runner, reporter);

	var mysqlData = new MysqlDataService();

	var dataCollectors = [mysqlData];
	//WorkflowHack to run instantly
	assistant.reportOnMetrics(dataCollectors);
	console.log('finished');

	var runDataCollection = schedule.scheduleJob('0 18 * * 1-5', function(){
		console.log('Running Data Metrics');
		assistant.reportOnMetrics(dataCollectors);
	})

}

/*
var subscriptionDataStore = new SubscriptionDataStore();
var runScheduledDataCollection = schedule.scheduleJob(rule, function(){
	console.log('Running Data Collection');
	subscriptionDataStore.getAllData()
});
*/

