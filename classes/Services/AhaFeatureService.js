'use strict'
const Service = require('./Service.js');
const Metric = require('../DataObjects/Metric.js');
const DateTimeService = require('../Services/DateTimeService.js');

const FeatureDataStore = require('../DataStores/AhaFeatureDataStore.js');

class AhaFeature extends Service{
	constructor(){
		super();
		var dataStore = new FeatureDataStore();
		var metrics = createMetrics();
		var maxAge = 30;

		this.returnMetrics = function(){
			return metrics;
		}
	
		async function getData(){
			var result =[];
			var initialResult = await dataStore.getAllData();

			for(var i=0; i<initialResult.length; i++){
				var individual = initialResult[i];

				if(DateTimeService.timeIsWithinLastXDays(individual.created_at, maxAge)){
					result.push(individual);
				}
			}
			return result;
		}

		function createMetrics(){
			var metrics = [];
			var database = 'BPRMetricData';

			// Define the metrics we care about
			var involvementOfUIInFeatures = new Metric('OODA#DesignInvolvementInFeatures', 'Define the percentage of UI involvement in features', percentageOfFeaturesGoThroughAUILoop, database);

			var featPassedQA = new Metric('OODA#DevLoopMetrics#PassedQA', 'Measure our effectiveness building and getting through QA', readyToDeployMeasurements, database);
			var featInProduction = new Metric('OODA#DevLoopMetrics#InProduction', 'Measure of our effectiveness at getting features to production', inProductionMetrics, database);
			var devVelocity = new Metric('Maintenance#DevTeamVelocity', 'Track Weekly developer velocity by measuring past output and averaging', averageWeeklyDevTeamVelocity, database);

			var thisMonth

			
			// Add metrics to the list of metrics
			metrics.push(involvementOfUIInFeatures);
			metrics.push(featPassedQA);
			metrics.push(featInProduction);
			metrics.push(devVelocity);

			return metrics;
		}
		
		async function percentageOfFeaturesGoThroughAUILoop(){
			var data = await getData();

			var totalCount = 0;
			var initiallyDesignedCount = 0;

			for (var i=0; i<data.length; i++){
				var individual = data[i];
				var tasks = individual.tasks;

				totalCount++;

				for(var k=0; k<tasks.length; k++){
					var task = tasks[k];

					var regex = /design|mock|UI|UX/.exec(task.name);
					if(regex != null){
						initiallyDesignedCount++;
						break;
					}
				}
			}
			
			var percent = (initiallyDesignedCount/totalCount) * 100;
			return {
				percentDesignedBeforeBeingBuilt: percent
			}
		}

		async function readyToDeployMeasurements(){
			var data = await getData();

			var featuresWithStatus = filterListOfFeaturesByStatus(data, 'Ready To Deploy');
			var result =  performMeasurementsOnAList(featuresWithStatus);
			return result;
		}

		async function inProductionMetrics(){
			var data = await getData();

			var featuresWithStatus = filterListOfFeaturesByStatus(data, 'In Production');
			var result =  performMeasurementsOnAList(featuresWithStatus);
			return result;
		}

		function filterListOfFeaturesByStatus(listOfFeatures,featureStatus){
			var list = listOfFeatures;
			var featureStatus = featureStatus;

			var individuals = [];
			for(var i=0; i<list.length; i++){
				var individual = list[i];
				if(individual.workflow_status.name == featureStatus){
					individuals.push(individual);
				}
			}
			return individuals;
		}

		function performMeasurementsOnAList(listOfFeatures){
			var list = listOfFeatures;

			var countOfStatusAchievedInAWeek = 0;
			var countOfStatusAchievedInAMonth = 0;
			var totalAge = 0;

			for(var i=0; i<list.length; i++){
				var individual = list[i];

				var age = DateTimeService.calculateTimeDiff(individual.created_at,individual.updated_at, 'days');
				totalAge += age;

				if(age <= 30){
					countOfStatusAchievedInAMonth++;
				}
				if(age <= 7){
					countOfStatusAchievedInAWeek++;
				}
			}

			return {
				totalCountOfStatus: list.length,
				statusAchievedInAWeekCount: countOfStatusAchievedInAWeek,
				percentStatusAchievedInAWeek: (countOfStatusAchievedInAMonth/list.length) * 100,
				statusAchievedInAMonthCount: countOfStatusAchievedInAMonth,
				percentStatusAchievedInAWeek: (countOfStatusAchievedInAWeek/list.length) * 100,
				averageAgeToHitStatusInDays: (totalAge/list.length)
			}
		}

		async function averageWeeklyDevTeamVelocity(){
			var data = await getData();

			var weeklyVelocity = {};
			var totalVelocity = 0;
			for(var i=0; i<data.length; i++){
				var individual = data[i];

				var estimate = individual.original_estimate;
				// Some tasks have no estimate.  Assume 1
				if(estimate == null){
					estimate = 1;
				}

				if(individual.workflow_status.name == 'In Production'){

					totalVelocity += estimate;
				}
			}
			var averageVelocity = (totalVelocity / (maxAge/7));

			var individualResults = await individualDevOutput();
			individualResults.teamAverage = averageVelocity;

			return individualResults;

		}

		async function individualDevOutput(){
			var data = await getData();

			var developers = {};
			for(var i=0; i<data.length; i++){
				var individual = data[i];

				var estimate = individual.original_estimate;
				// Some tasks have no estimate.  Assume 1
				if(estimate == null){
					estimate = 1;
				}

				if(individual.workflow_status.name == 'In Production'){

					var assignedDeveloper = null;
					if(individual.assigned_to_user == null){
						assignedDeveloper = 'unassigned';
						// Assign credit in Aha!
						//console.log(individual)
					} else{
						assignedDeveloper = individual.assigned_to_user.name;
					}

					if(developers[assignedDeveloper] == null){
						developers[assignedDeveloper] = estimate;
					} else {
						developers[assignedDeveloper] += estimate;
					}
				}
			}

			return developers;
		}


		function calculateCompletionRateGivenAList(list){
			var list = list;

			var completedSuccessfully = 0;
			for(var i=0; i<list.length; i++){
				var individual = list[i];

				if(individual.status == 'completed'){
					var completedAt = individual.updated_at;
					var dueAt = DateTimeService.addTime(individual.due_date, 1, 'day');
					if(DateTimeService.firstTimeIsBeforeSecondTime(completedAt, dueAt)){
						completedSuccessfully++;
					}
				}
			}

			return (completedSuccessfully/list.length) * 100;
		}

	}
}
module.exports = AhaFeature;
