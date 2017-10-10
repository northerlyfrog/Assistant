'use strict'
const Service = require('./Service.js');
const BugDataStore = require('../DataStores/AhaBugDataStore.js');
const Metric = require('../DataObjects/Metric.js');
const DateTimeService = require('../Services/DateTimeService.js');

class AhaBug extends Service{
	constructor(){
		super();
		var dataStore = new BugDataStore();
		var metrics = createMetrics();

		this.returnMetrics = function(){
			return metrics;
		};

		async function getData(){
			var result = await dataStore.getAllData();
			return result;
		}

		function createMetrics(){
			var metrics = [];

			// Create Metrics
			var initialBugMetrics = new Metric('OODA#BugFixes', 'Bug Statistics', getBugFixMetrics);

			// Add to List
			metrics.push(initialBugMetrics);


			return metrics;
		}

		async function getBugFixMetrics(){
			var data = await dataStore.getAllData();
			var timeMeasurement = 'days';

			var completedAges = [];
			var incompleteAges = [];
			var bugsInTheLastThirtyDays = 0;
			for(var i=0; i<data.length; i++){
				var individual = data[i];
				var age;

				if(DateTimeService.timeIsWithinLastXDays(individual.created_at, 30)){
					bugsInTheLastThirtyDays++;
				}

				if(individual.workflow_status.name == 'Fix completed'){
					age = DateTimeService.calculateTimeDiff(individual.created_at, individual.updated_at, timeMeasurement);
					completedAges.push(age);
				} else {
					age = DateTimeService.calculateTimeDiff(individual.created_at, DateTimeService.now(), timeMeasurement);
					incompleteAges.push(age);
				}
			}

			var totalNumberOfBugs = data.length;
			var bugPercentageCompleted = (completedAges.length / (completedAges.length + incompleteAges.length) * 100);
			var averageCompletionOfBugsInDays  = calculateAgeGivenAList(completedAges)
			var averageAgeOfPendingBugsInDays = calculateAgeGivenAList(incompleteAges);

			var metrics = {
				totalBugs: totalNumberOfBugs,
				totalInThelastThirtyDays: bugsInTheLastThirtyDays,
				completionPercentage: bugPercentageCompleted,
				averageCompletionOfBugsInDays: averageCompletionOfBugsInDays,
				averageAgeOfExistingBugsInDays: averageAgeOfPendingBugsInDays
			}

			return metrics;
		}

		function calculateAgeGivenAList(list){
			var list = list;

			var total = 0;
			for(var i=0; i<list.length; i++){
				total += list[i];
			}

			return total/list.length;
		}



	}
}
module.exports = AhaBug;
