'use strict'
const schedule = require('node-schedule');


const Assistant = require('./classes/Collaborators/Assistant.js');
const RegistryCreator = require('./classes/Collaborators/RegistryCreator.js');
const RegistryRunner =  require('./classes/Collaborators/RegistryRunner.js');
const RegistryReporter = require('./classes/Collaborators/RegistryReporter.js');

const IdeaService = require('./classes/Services/AhaIdeaService.js');
const TaskService = require('./classes/Services/AhaTaskService.js');
const FeatureService = require('./classes/Services/AhaFeatureService.js');
const BugService = require('./classes/Services/AhaBugService.js');

const SubscriptionDataStore = require('./classes/DataStores/SubscriptionDataStore.js');

var registryRunner = new RegistryRunner();
var registryCreator = new RegistryCreator();
var registryReporter = new RegistryReporter();

var assistant = new Assistant(registryCreator, registryRunner, registryReporter);

var ideaService = new IdeaService();
var taskService = new TaskService();
var featureService = new FeatureService();
var bugService = new BugService();
var startingServices = [ideaService, taskService, featureService, bugService];

var rule = new schedule.RecurrenceRule();
rule.minute = 0;
rule.hour = [ 4, 12, 20 ];
rule.dayOfWeek = new schedule.Range(1,5);
console.log('Starting');

//WorkflowHack To see instant work
assistant.reportOnMetrics(startingServices);


var runScheduledMetricReport = schedule.scheduleJob('0 * * * 1-5', function(){
	console.log('Running Metrics');
	assistant.reportOnMetrics(startingServices)
});

var subscriptionDataStore = new SubscriptionDataStore();
var runScheduledDataCollection = schedule.scheduleJob(rule, function(){
	console.log('Running Data Collection');
	subscriptionDataStore.getAllData()
});


