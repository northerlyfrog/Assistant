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
const MysqlApi = require('./classes/Interfaces/Active911MysqlDBInterface.js');
const AhaApi = require('./classes/Interfaces/AhaApi.js');
const JiraApi = require('./classes/Interfaces/Active911Jira.js');

console.log('Starting Metrics');

//schedule.scheduleJob('0 0 * * * *', runBPRMetrics);
//runBPRMetrics();

schedule.scheduleJob('0 30 * * * *', gatherRawData);
gatherRawData();

function runBPRMetrics(){

	var registryRunner = new RegistryRunner();
	var registryCreator = new RegistryCreator();
	var registryReporter = new RegistryReporter();

	var assistant = new Assistant(registryCreator, registryRunner, registryReporter);

	var ideaService = new IdeaService();
	var taskService = new TaskService();
	var featureService = new FeatureService();
	var bugService = new BugService();
	var mysqlService = new MysqlDataService();
	var startingServices = [ideaService, taskService, bugService, mysqlService];


	//WorkflowHack To see instant work
	assistant.reportOnMetrics(startingServices);
}

function gatherRawData(){

	var jiraInterface = new JiraApi();
	jiraInterface.collectData();

	//var active911MysqlInterface = new MysqlApi();
	//active911MysqlInterface.collectData();
	
}



