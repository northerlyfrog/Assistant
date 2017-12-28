'use strict'
const moment = require('moment');
const businessDayMoment = require('moment-business-days');

/**
 * Timestamp handling helper class
 *
 */

class DateTimeService{
	constructor(){}

	/**
	 * @return Unix string representing now
	 */
	static now(){
		return moment();
	}

	static calculateBusinessDayDiff(start, end){
		
		var start = businessDayMoment(start);
		var end = businessDayMoment(end);

		return start.businessDiff(end);
	}

	static calculateTimeDiff(earlyDate,lateDate, expectedOutput){
		var ageFormat = expectedOutput;
		if(ageFormat == null){
			ageFormat = 'days';
		}
		var earlyMoment = moment(earlyDate);
		var lateMoment = moment(lateDate);
		var ageCalc = lateMoment.diff(earlyMoment, ageFormat, true);

		var age = Math.abs(ageCalc);
		return age;
	}

	static firstTimeIsBeforeSecondTime(first,second){
		
		return moment(second).isAfter(first);
	}

	static determineWeekNumberEventOccurred(date){
		var weekNumber = moment(date).isoWeek();
		return weekNumber;
	}

	static timeIsWithinLastXDays(time, days){
		var bool = false;
		var time = moment(time);
		var lookBackTime = moment().subtract(days, 'days');

		if(time > lookBackTime){
			bool = true;
		}
		return bool;
	}

	static addTime(startTime, value, unit){

		return moment(startTime).add(value, unit).valueOf();
	}

	static subtractTime(startTime, value, unit){

		return moment(startTime).subtract(value,unit).valueOf();
	}

	static calculateUnixTime(timeString){
		return Date.parse(timeString);
	}
}

module.exports = DateTimeService;
