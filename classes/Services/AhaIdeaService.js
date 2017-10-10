'use strict'
const Service = require('./Service.js');
const IdeaDataStore = require('../DataStores/AhaIdeaDataStore.js');
const Metric = require('../DataObjects/Metric.js');
const DateTimeService = require('../Services/DateTimeService.js');

class AhaIdea extends Service{
	constructor(){
		super();
		var dataStore = new IdeaDataStore();
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

			var oodaLoop = new Metric('OODA#TotalLoop', 'Measure how responsive the business is to incoming requests', measureOODALoop);
			metrics.push(oodaLoop);

			return metrics;
		}

		async function measureOODALoop(){

			var totalIdeas = await countNewIdeas();
			var totalDecisionToAct = await measureDecideEffectivenessInTotalNumber();
			var percentageCompleted = await measureDecideAndActEffectivenessInPercentage();
			var averageAgeOfCompletion = await averageAgeOfCompletedIdeas();
			var data = {
				totalIncomingIdeas: totalIdeas,
				totalDecisionsToAct: totalDecisionToAct,
				percentageOfDecisionsCompleted: percentageCompleted,
				averageDaysToComplete: averageAgeOfCompletion
			};

			return data;
		}

		async function countNewIdeas(){
			var data = await getData();
			var count = 0;

			for(var i=0; i<data.length; i++){
				var idea = data[i];

				if(DateTimeService.timeIsWithinLastXDays(idea.created_at, 90)){
					count++;
				}
			}
			return count;
		}

		async function measureDecideEffectivenessInTotalNumber(){

			var sortedIdeas = await sortIdeasByWhatWeChoseToActOn();

			return (sortedIdeas.length);	
		}

		async function measureDecideAndActEffectivenessInPercentage(){

			var sortedIdeas = await sortIdeasByWhatWeChoseToActOn();
			var acted = 0;
			for(var i=0; i<sortedIdeas.length; i++){
				var idea = sortedIdeas[i];

				if(idea.workflow_status.complete){
					acted++;
				} 
			}

			var percentage = (acted / sortedIdeas.length) * 100;

			return (percentage);

		}

		async function percentageOfIdeasCompletedInAWeek(){
			var decisions = await sortIdeasByWhatWeChoseToActOn();

			var countOfAgesUnderAWeek = 0;
			for(var i=0; i<decisions.length; i++){

				var idea = decisions[i];
				if(idea.workflow_status.complete == true){

					var age = DateTimeService.calculateTimeDiff(idea.created_at,idea.updated_at);

					if(age < 7){
						countOfAgesUnderAWeek++;
					}
				} 
			}

			var percentDoneWithinAWeek = (countOfAgesUnderAWeek/ decisions.length) * 100

			return(percentDoneWithinAWeek);
		}

		async function averageAgeOfCompletedIdeas(){

			var decisions = await sortIdeasByWhatWeChoseToActOn();

			var ages = [];
			for(var i=0; i<decisions.length; i++){

				var idea = decisions[i];
				var age;
				if(idea.workflow_status.complete == true){

					age = DateTimeService.calculateTimeDiff(idea.created_at,idea.updated_at);
					ages.push(age);
				}
			} 

			var totalAge;
			for(var i=0; i<ages.length; i++){
				if(ages[i] > 5){
					totalAge =+ ages[i];
				}
			}

			var averageAge = totalAge/ages.length;

			return(averageAge);
		}

		async function sortIdeasByWhatWeChoseToActOn(){
			var data = await getData();

			var ideasWeDecidedToActOn = [];

			for(var i=0; i<data.length; i++){
				var idea = data[i];
				var workflowStatus = idea.workflow_status.name;

				if(DateTimeService.timeIsWithinLastXDays(idea.created_at, 90)){

					if(workflowStatus == 'Planned' || workflowStatus == 'Started' || workflowStatus == 'In beta testing' || workflowStatus == 'Completed'){
						ideasWeDecidedToActOn.push(idea);
					}
				}
			}
			return ideasWeDecidedToActOn;
		}
	}
}
module.exports = AhaIdea;
