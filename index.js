'use strict'

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

var startingServices = [];

var ideaService = new IdeaService();
startingServices.push(ideaService);

var taskService = new TaskService();
startingServices.push(taskService);

var featureService = new FeatureService();
startingServices.push(featureService);

var bugService = new BugService();
startingServices.push(bugService);

assistant.reportOnMetrics(startingServices);

var subscriptionDataStore = new SubscriptionDataStore();
subscriptionDataStore.getAllData();
//subscription.periodicallyRunData();
return 1;


