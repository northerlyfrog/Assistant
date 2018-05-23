'use strict';
const config = require('../../config.json');

const InfluxDatabase = require('../Interfaces/InfluxDatabase.js');
const DataPoint = require('../DataObjects/DataPoint.js');
const HttpService = require('../Interfaces/httpService.js');

class Active911Jira{
	constructor(){
		const influx = new InfluxDatabase();
	
		var authorization = new Buffer(config.jira.user+":"+config.jira.password).toString('base64');

		var headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Basic "+authorization
		}

		var baseUrl = "https://docker2-tx.active911.com:8084/rest/api/2";

		this.collectData = function(){
			//console.log('collecting Data');
			//this.getAnIssue('AC-1271');
			this.getStoriesInOpenSprints();
			this.getStoriesInPastSprints();

		}

		this.getAnIssue = async function(issueKey){
			console.log('getting an issue');
			var parameters = HttpService.setCallParameters(baseUrl+"/issue/"+issueKey, headers);

			var initialResponse = await HttpService.makeJsonRequest(parameters);
			console.log(initialResponse);

		}

		this.getStoriesInOpenSprints = async function(){
			
			// HACK: There is not a procedural way to get a list of sprints and choose the most recent.  We can get all the open sprints using jql, or JIRA query language.
			// We are getting only stories in an attempt to prevent inflation and random "tasks" being 5 points.
			var parameters = HttpService.setCallParameters(baseUrl+"/search?jql=project = AC AND Sprint in openSprints() and issuetype = Story", headers);

			var initialResponse = await HttpService.makeJsonRequest(parameters);

			var stories = initialResponse.issues;
			normalizeAndSaveStoryData(stories);
		}

		this.getStoriesInPastSprints = async function(){
				var parameters = HttpService.setCallParameters(baseUrl+"/search?jql=project = AC AND Sprint in closedSprints() and issuetype = Story", headers);

			var initialResponse = await HttpService.makeJsonRequest(parameters);

			var stories = initialResponse.issues;
			normalizeAndSaveStoryData(stories);
		}

		
		function normalizeAndSaveStoryData(stories){
			var stories = stories;

			var dataPoints = [];
			for(var i=0; i<stories.length; i++){
		
				//example story: https://docker2-tx.active911.com:8084/rest/api/2/issue/11420
				var story = stories[i];

				var fields = {
					id: story.id,
					url: story.self,
					points: setPoints(story)
				};

				var tags = {
					status: story.fields.status.name,
					points: setPoints(story),
					assignedTo: determineAssignee(story),
					createdOn: story.fields.created
				}

				var point = new DataPoint('rawFeatureData', fields, tags, new Date(story.fields.updated));
				dataPoints.push(point);
			}
			influx.writePoints(dataPoints);
			
		}

		function setPoints(story){
		
			var pointValue = story.fields.customfield_10006;

			if(!pointValue){
				pointValue = 0;
			}
			return pointValue;
		}

		function determineAssignee(story){
		
			var assignee = "unassigned";

			if(story.fields.assignee){
				assignee = story.fields.assignee.name;
			}
			return assignee;
		}






	}
}
module.exports = Active911Jira;
