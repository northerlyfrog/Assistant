'use strict'
const Service = require('./Service.js');
const Metric = require('../DataObjects/Metric.js');
const DateTimeService = require('../Services/DateTimeService.js');

const TaskDataStore = require('../DataStores/AhaTaskDataStore.js');

class AhaTask extends Service{
	constructor(){
		super();
		var dataStore = new TaskDataStore();
		var metrics = createMetrics();
		var maxAgeToBeConsideredRecent = 60;

		this.returnMetrics = function(){
			return metrics;
		}

		async function getData(){
			var result = [];
			var initialResult = await dataStore.getAllData();

			for(var i=0; i<initialResult.length; i++){
				var individual = initialResult[i];

				if(DateTimeService.timeIsWithinLastXDays(individual.created_at, maxAgeToBeConsideredRecent)){
					result.push(individual);
				}
			}
			return result;
		}

		function createMetrics(){
			var metrics = [];
			var database = 'BPRMetricData';

			// Define the metrics we care about
			var fullQAMetrics = new Metric('OODA#FullQA', 'Measurements on how well full QA is performing', fullQAData, database);

			var nightlyQAMetrics = new Metric('OODA#NightlyQA', 'Measurements on how well nightly QA is performing', nightlyQAData, database);

			var uiUXQAMetrics = new Metric('OODA#DesignMetrics', 'Measurements on how well design is performing', uiUxData, database);

			var releaseMetrics = new Metric('OODA#ReleaseCycle', 'Measurements on how well releases are being handled', releaseData, database);

			// Add Metric to the Array
			metrics.push(fullQAMetrics);
			metrics.push(nightlyQAMetrics);
			metrics.push(uiUXQAMetrics);
			metrics.push(releaseMetrics);

			return metrics;
		}

		async function fullQAData(){
			var data = await getData();

			var list = sortListByNameFilter(data, /(F|f)ull/i);

			var averageAgeOfCompleted = calculateAgeOfCompletedItems(list, 'hours');
			var percentCompleteOnTime = calculateCompletionRateGivenAList(list);
			var percentDoneWithin4Hours = calculatePercentageOfItemsCompleteWithinATimeframe(list, 4, 'hours');

			var q4Tasks = [];
			for (var i=0; i<list.length; i++){
				var individual = list[i];

				if(DateTimeService.firstTimeIsBeforeSecondTime(new Date(2017, 8, 30, 0, 0), individual.created_at)){
					q4Tasks.push(individual);
				}
			}

			var q4averageCompletionAge = calculateAgeOfCompletedItemsUsingBusinessHours(q4Tasks, 'hours');

			return {
				averageCompletionAgeInHours: averageAgeOfCompleted,
				percentCompleteByDueDate: percentCompleteOnTime,
				percentageDoneWithin4Hours: percentDoneWithin4Hours,
				q4TotalNumberOfTasks: q4Tasks.length,
				averageBusinessHourCompletionAgeinQ42017: q4averageCompletionAge,
				q4TotalNumberCompletedIn4Hours: calculatePercentageOfItemsCompleteWithinATimeframe(q4Tasks, 4, 'hours'),
				
			}
		}

		async function nightlyQAData(){
			var data = await getData();
			var list = sortListByNameFilter(data, /(N|n)ightly/i);

			var averageAge = calculateAgeOfCompletedItems(list, 'hours');
			var percentCompleteOnTime = calculateCompletionRateGivenAList(list);
			var percentDoneWithin20Minutes = calculatePercentageOfItemsCompleteWithinATimeframe(list, 20, 'minutes');

			return {
				averageCompletionAgeInHours: averageAge,
				percentCompleteByDueDate: percentCompleteOnTime,
				percentageDoneWithin20Minutes: percentDoneWithin20Minutes
			}
		}

		async function uiUxData(){
			var data = await getData();
			var list = sortListByNameFilter(data, /design|mock|UI|UX/);

			var averageAge = calculateAgeOfCompletedItems(list, 'days');
			var percentCompleteOnTime = calculateCompletionRateGivenAList(list);

			return {
				averageCompletionAgeInHours: averageAge,
				percentCompleteOnTime: percentCompleteOnTime
			}
		}

		async function releaseData(){
			var data = await getData();
			var list = sortListByNameFilter(data, /(P|p)repare|(G|g)ood|(R|r)oll/);

			var averageAge = calculateAgeOfCompletedItems(list, 'days');

			return {
				averageCompletionAgeInDays: averageAge
			}
		}

		async function accountabilityByPerson(){
			var averageOfEveryone;
		}

		function calculateAgeOfCompletedItemsUsingBusinessHours(listOfItems, timeMeasurement){
			var list = listOfItems;
			var timeMeasurement = timeMeasurement;
			if(timeMeasurement == null){
				timeMeasurement = 'hours';
			}

			var ages = [];
			for(var i=0; i<list.length; i++){
				var individual = list[i];

				if(individual.status == 'completed'){
					var age = DateTimeService.calculateTimeDiff(individual.created_at,individual.updated_at, timeMeasurement);

					var businessDays = DateTimeService.calculateBusinessDayDiff(individual.created_at, individual.updated_at)
					if(businessDays > 1){
					 age =  (businessDays * 8);
					}

					// No item should be completed in under 6 mintues
					if(age >= .10){
						ages.push(age);
					}
				}

			}

			var averageAge = calculateAverageGivenAges(ages);
			return averageAge;
		}


		function calculateAgeOfCompletedItems(listOfItems, timeMeasurement){
			var list = listOfItems;
			var timeMeasurement = timeMeasurement;
			if(timeMeasurement == null){
				timeMeasurement = 'hours';
			}

			var ages = [];
			for(var i=0; i<list.length; i++){
				var individual = list[i];

				if(individual.status == 'completed'){
					var age = DateTimeService.calculateTimeDiff(individual.created_at,individual.updated_at, timeMeasurement);

					// No item should be completed in under 6 mintues
					if(age >= .10){
						ages.push(age);
					}
				}

			}

			var averageAge = calculateAverageGivenAges(ages);
			return averageAge;
		}

		function calculatePercentageOfItemsCompleteWithinATimeframe(listOfItems, timeValue, timeMeasurement){

			var list = listOfItems;
			var timeValue = timeValue;
			var timeMeasurement = timeMeasurement;

			var completeCount = 0;
			for(var i=0; i<list.length; i++){
				var individual = list[i];
				if(individual.status == 'completed'){
					var age = DateTimeService.calculateTimeDiff(individual.created_at,individual.updated_at, timeMeasurement);

					if(age <= timeValue){
						completeCount++;
					}
				}
			}

			return (completeCount/list.length) * 100;
		}

		function sortListByNameFilter(list, regex){
			var list = list;
			var regex = regex;

			var newList = [];
			for(var i=0; i<list.length; i++){
				var individual = list[i];
				var result = regex.exec(individual.name);
				if(result != null){
					newList.push(individual);
				}
			}
			return newList;
		}

		function calculateCompletionRateGivenAList(list){
			var list = list;

			var completed = 0;
			var completedSuccessfully = 0;
			for(var i=0; i<list.length; i++){
				var individual = list[i];

				if(individual.status == 'completed'){
					completed++;
					var completedAt = individual.updated_at;
					var dueAt = DateTimeService.addTime(individual.due_date, 1, 'day');

					// Set a default due date a week after creation if one is missing
					if(individual.due_date == null){
						dueAt = DateTimeService.addTime(individual.created_at, 7, 'day');
					}
					if(DateTimeService.firstTimeIsBeforeSecondTime(completedAt, dueAt)){
						completedSuccessfully++;
					} 
				}	
			}

			return (completedSuccessfully/completed) * 100;
		}

		function calculateAverageGivenAges(ages){
			var ages = ages;
			var totalAge = 0;

			for(var i=0; i<ages.length; i++){
				totalAge += ages[i];
			}

			var averageAge = totalAge/ages.length;
			return averageAge;
		}
	}
}
module.exports = AhaTask;
