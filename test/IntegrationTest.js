'use strict'

const Assistant = require('../classes/Collaborators/Assistant.js');
const RegistryCreator = require('../classes/Collaborators/RegistryCreator.js');
const RegistryRunner =  require('../classes/Collaborators/RegistryRunner.js');
const RegistryReporter = require('../classes/Collaborators/RegistryReporter.js');
var td = require('testdouble');
var mocha = require('mocha');
var chai = require('chai');
var assert = chai.assert;

describe('Assistant#reportOnMetrics', function(){

	var subject;

	var registryCreator;
	var registryRunner;
	var registryReporter;
	var serviceOne;
	var serviceTwo;

	before(function(){
	
		registryCreator = td.object('RegistryCreator');
		registryRunner = td.object('RegistryRunner');
		registryReporter = td.object('RegistryReporter');

		serviceOne = td.object('Service');
		serviceTwo = td.object('Service');
	
		subject = new Assistant(registryCreator,registryRunner,registryReporter);
	});

	it('Gets me my metrics', function(){
		var services = [serviceOne, serviceTwo];

		td.when(registryCreator.create(services)).thenReturn(services);
		td.when(registryRunner.run(services)).thenReturn('Updated Registry');


		subject.reportOnMetrics(services);

		td.verify(registryReporter.report('Updated Registry'));
	});

	after(function(){
		td.reset()
	});
})

describe('RegistryCreator#create', function(){

	var listServices;
	var validateService;
	var serviceOne;
	var serviceTwo;
	
	var subject;

	before(function(){
		listServices = td.function('.listServices');
		validateService = td.function('.validateService');
		serviceOne = td.object('Service');
		serviceTwo = td.object('Service');

		subject = new RegistryCreator();
	});

	it('creates a registry of Services', function(){


		subject.create([serviceOne, serviceTwo]);
		var result = subject.listServices();

		assert.equal(result.length, 2);
		
	});
	
	after(function(){
		td.reset();
	});
});

describe('RegistryRunner#run', function(){
	var listOfServices;
	var metricOne;
	var metricTwo;
	var metricThree;
	var metricFour;
	var serviceOne;
	var serviceTwo;

	var subject;
	before(function(){
		
		var service = {
			returnMetrics : function(){},
		}

		var metric = {
			value : null,
			run : function(){}
		}

		serviceOne = td.object(service);
		serviceTwo = td.object(service);

		metricOne = td.object(metric);
		metricTwo = td.object(metric);
		metricThree = td.object(metric);
		metricFour = td.object(metric);

		listOfServices = [serviceOne,serviceTwo];

		subject = new RegistryRunner();
		subject.saveEachMetric = td.function('.saveEachMetric');

	});

	it('runs each services metrics and returns the results', function(){

		td.when(serviceOne.returnMetrics()).thenReturn([metricOne, metricTwo, metricThree]);
		td.when(serviceTwo.returnMetrics()).thenReturn([metricFour]);

		td.when(metricOne.run()).thenDo(function(){metricOne.value = 1});


		var result = subject.run(listOfServices);

		assert.equal(result.length, 4);
		assert.notEqual(result[0].value, null);
		td.verify(subject.saveEachMetric(result));

	});
	
	after(function(){
	
	});
});

describe('RegistryReporter#report', function(){

	var serviceList;
	var output;

	var subject;


	before(function(){
		serviceList = [td.object('Service'),td.object('Service')];
		output = td.function('output');

		subject = new RegistryReporter();
		subject.output = output;
	});

	it('Reports on the results of the metrics', function(){

		subject.report(serviceList);

		td.verify(output(td.matchers.anything()), {times: 2});
	});
	
	after(function(){
	
	});
});


