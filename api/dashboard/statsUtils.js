'use strict';

var _ = require('lodash');
var Metric = require('../metric/metric.model');
var Context= require('../context/context.model');
var StatsClass= require('../../components/StatsClass');

exports.tracking = function (surveys, sentContext, cb) {
  //TODO: implement tracking data
  cb(null, "returns from tracking");
};

exports.analysis = function (surveys, sentContext, cb) {

  var data = {},
    allActivities = [
      'Door Knocking',
      'Phone Banking',
      'Volunteer Recruitment Phone Calling',
      'One On One',
      'Neighbourhood Team Meeting',
      'Volunteer House Gathering',
      'Stall',
      'Voter House Meeting',
      'Training Session'
    ];

  data.activityTotals             = makeIndividualActivityTotals();
  data.activityTimelineTotals     = makeIndividualActivityTimelineTotals();
  data.activityConversions        = makeActivityConversions();
  data.activityTotalVolWorkHrs    = makeActivityTotalVolWorkHrs();
  data.activityTimelineMITotals   = makeActivityTimelineMITotals();
  data.activityTimelineMIWeekly   = makeActivityTimelineMIWeekly();

  //send data off
  cb(null, data);


  //individual functions
  function makeIndividualActivityTotals() {
    var individualActivityTotals,
      splitActivities,
      presentActivities,
      difference,
      combined,
      ordered;
    
    splitActivities = _.chain(surveys)
      .countBy(function(survey){return survey.activity[0].activityType})
      .pairs()
      .map(function(pair, index){
        return {
          x: pair[0],
          y: pair[1]
        };
      })
      .sortBy(function (dataCount) {return dataCount.x;})
      .value();
  
    //does not hold zero value activities
    //console.log('splitActivities');
    //console.dir(splitActivities);
  
    //find which activities are present
    presentActivities = _.chain(splitActivities)
      .pluck('x')
      .value();
  
    //find the missing ones (e.g. the activities with 0 surveys)
    difference = _.difference(allActivities, presentActivities);

    //add in missing ones to splitActivities
    combined = _.forEach(difference, function (item) {
      splitActivities.push({
        x: item,
        y: 0
      });
    });
  
    //*** IMPORTANT ****
    //always order in terms of activity name
    //need to keep things in order as we use a custom x axis formatter in rickshaw
    //=> we translate back to activity name using x integer val
    ordered = _.sortBy(splitActivities, function (dataPoint){return dataPoint.x;});
   
    //console.log('ordered');
    //console.dir(ordered);
  
    //redo the values for order activities for rickshaw
    individualActivityTotals = _.forEach(ordered, function (item, index) {
      item.x = index + 1;
    });
  
    //console.log('presentActivities');
    //console.dir(presentActivities);
    //console.log('difference');
    //console.dir(difference);
    //console.log('individualActivityTotals');
    //console.log(individualActivityTotals);

    return individualActivityTotals;
  }

  function makeIndividualActivityTimelineTotals() {
    var individualActivityTimelineTotals,
      dayLength = 60 * 60 * 24 * 1000, //day length in milliseconds
      i,
      earliestActDate,
      latestActDate,
      grouped,
      blooper,
      allMapped = {},
      deltaTime,
      numberOfDays,
      defaultValues = [],
      dummyDataPoint = {},
      paddedMapped = [];

    //outputs an object with activity name as keys and arrays of surveys for that 
    //activity as values
    grouped = _.groupBy(surveys, function (survey) {
      return survey.activity[0].activityType;
    });
    //console.dir('grouped');
    //console.dir(grouped);

    //calc earliest activity date
    _.forEach(grouped, function (val, key){
      _.forEach(val, function (act) {
        if (!earliestActDate) {
          earliestActDate = act.activity[0].activityDate.getTime();
          return;
        };
        if (act.activity[0].activityDate.getTime() <= earliestActDate) {
          earliestActDate = act.activity[0].activityDate.getTime();
        }
      });      
    });

    //calc latests activity date
    _.forEach(grouped, function (val, key){
      _.forEach(val, function (act) {
        if (!latestActDate) {
          latestActDate = act.activity[0].activityDate.getTime();
          return;
        };
        if (act.activity[0].activityDate.getTime() >= latestActDate) {
          latestActDate = act.activity[0].activityDate.getTime();
        }
      });      
    });

    deltaTime = latestActDate - earliestActDate;
    numberOfDays = (deltaTime / dayLength) + 1;

    /*
    console.log('*** activityTimeTotals ***');
    console.log('latestActDate: ' + latestActDate);
    console.log('earliestActDate: ' + earliestActDate);
    console.log('deltaTime: ' + deltaTime);
    console.log('numberOfDays: ' + numberOfDays);
    */
    
    for (i = 0; i <= numberOfDays; i++) {
      dummyDataPoint = {},
      dummyDataPoint.x = (earliestActDate + (i * dayLength)) /1000; //back to seconds
      dummyDataPoint.y = 0;
      defaultValues.push(dummyDataPoint);
    }
    //console.log(defaultValues);

    //want to find the earliest date activity and last date activity
    //then generate a collection with every date from earliest to last. default to have
    //null val for each date
    //then for each activity we add count for the day to this collection
    //=> ensures each activiy collection has the same length as required by rickshaw

    _.forEach(grouped, function (value, key) {
      var mappedAct =  _.chain(value)
        .countBy(function(survey){return survey.activity[0].activityDate})
        .pairs()
        .map(function(pair){
          return {
            x: (new Date(pair[0]).getTime())/1000,
            y: pair[1]
          };
        })
        .sortBy(function(dateCount){return dateCount.x;})
        .value();
      //console.log('mappedAct');
      //console.log(mappedAct);
      allMapped[key] = mappedAct;
    });
    //console.dir('allMapped');
    //console.dir(allMapped);

    //munge data into format expected by rickshaw 
    //[
    //  {name:'Door Knocking', data: [{}, {}, {}] },
    //  {name:'Phone Banking', data: [{}, {}, {}]},
    //  {name:'Stall', data: [{}, {}, {}]}
    //]
    //and change all non zero data points in defaultValues corresponding to an activity
    _.forEach(allMapped, function (val, key) {
      var tempDefaults = _.cloneDeep(defaultValues);
      var mObj = {};

      _.forEach(val, function (v, k) {
        tempDefaults[k] = v;  
      });

      mObj.name = key;      
      mObj.data = _.sortBy(tempDefaults, function (item) {return item.x;});
      paddedMapped.push(mObj);
    });
    //console.dir('paddedMapped');
    //console.dir(paddedMapped);
    
    //return newFormat;
    return paddedMapped;
  }

  function makeActivityConversions() {
    var individualActivityTotals,
      grouped,
      splitActivities,
      presentActivities,
      difference,
      combined,
      ordered;
    
    //outputs an object with activity name as keys and arrays of surveys for that 
    //activity as values
    grouped = _.groupBy(surveys, function (survey) {
      return survey.activity[0].activityType;
    });
    //console.dir('grouped');
    //console.dir(grouped);

    //these are the only activities which have relevant metrics associated with them
    //for making the activity conversions
    var relevantActivities = [
      'Door Knocking',
      'Phone Banking',
      'Volunteer Recruitment Phone Calling',
      'One On One',
      'Stall'
    ];

    //find which of the relevant activities we actually have in grouped collection
    var presentRelevantActivities = _.intersection(_.keys(grouped), relevantActivities);
    //console.log('presentRelevantActivities');
    //console.log(presentRelevantActivities);

    var stats = [];
    _.forEach(presentRelevantActivities, function (activityName) {
      var accum = {};
      accum.attempts = 0; 
      accum.answers  = 0; 
      accum.mis      = 0; 

      var reduced = _.reduce(grouped[activityName], function (stat, survey) {

        stat.attempts = stat.attempts + survey.activity[0].attempts; 
        stat.answers  = stat.answers  + survey.activity[0].answered; 
        stat.mis      = stat.mis      + survey.activity[0].meaningfulInteractions; 
        return stat;
      }, accum);

      reduced.activity = activityName;
      stats.push(reduced);
    });

    //console.log('stats');
    //console.dir(stats);

    //now transform these stats to percentages
    var percentageStats = _.map(stats, function (actStats) {
      var pStatContainer = {};
      var pStat = {};
      pStat.totAttemptsPercent = (actStats.attempts / actStats.attempts) * 100; 
      pStat.totAnsweredPercent = (actStats.answers/ actStats.attempts) * 100; 
      pStat.totMIPercent = (actStats.mis/ actStats.attempts) * 100; 
      pStat.activity = actStats.activity;
      //pStatContainer[actStats.activity] = pStat;
      //return pStatContainer;
      return pStat;
    });     
    //console.log('percentageStats');
    //console.log(percentageStats);

    return percentageStats;
  }

  function makeActivityTotalVolWorkHrs() {
    console.log('MAKING ACTIVITY TOTAL VOL WORK HRS');
    var grouped,
      presentRelevantActivities,
      relevantActivities = [
        'Door Knocking',
        'Phone Banking',
        'Volunteer Recruitment Phone Calling'
      ];

    //outputs an object with activity name as keys and arrays of surveys for that 
    //activity as values
    grouped = _.groupBy(surveys, function (survey) {
      return survey.activity[0].activityType;
    });
    //console.dir('grouped');
    //console.dir(grouped);

    //find which of the relevant activities we actually have in grouped collection
    presentRelevantActivities = _.intersection(_.keys(grouped), relevantActivities);
    //console.log('presentRelevantActivities');
    //console.log(presentRelevantActivities);

    var stats = [];
    _.forEach(presentRelevantActivities, function (activityName) {
      var accum = {};
      accum.volTotalWorkHrs = 0; 

      var reduced = _.reduce(grouped[activityName], function (stat, survey) {
        stat.volTotalWorkHrs = stat.volTotalWorkHrs + survey.activity[0].volTotalWorkHrs; 
        return stat;
      }, accum);

      reduced.activity = activityName;
      stats.push(reduced);
    });
    //console.log('stats');
    //console.dir(stats);
    return stats;
  }

  function makeActivityTimelineMITotals() {
    var individualActivityTimelineTotals,
      dayLength = 60 * 60 * 24 * 1000, //day length in milliseconds
      i,
      earliestActDate,
      latestActDate,
      grouped,
      allMapped = {},
      deltaTime,
      numberOfDays,
      defaultValues = [],
      dummyDataPoint = {},
      paddedMapped = [
        {'name': 'Door Knocking', 'data': []}
      ];

    /*
    var relevantActivities = [
      'Door Knocking',
      'Phone Banking',
      'Volunteer Recruitment Phone Calling',
      'One On One',
      'Stall'
    ];
    */
    
    //only do this for dking for now
    var relevantActivities = [
      'Door Knocking'
    ];

    //get rid of activities that don't have meaningful interactions field
    var relevantSurveys = _.filter(surveys, function (val, index) {
      return _.contains(relevantActivities, val.activity[0].activityType);
    });
    //console.log('relevantSurveys');
    //console.log(relevantSurveys);

    //outputs an object with activity name as keys and arrays of surveys for that 
    //activity as values
    grouped = _.groupBy(relevantSurveys, function (survey) {
      return survey.activity[0].activityType;
    });
    //console.dir('grouped');
    //console.dir(grouped);

    //calc earliest & latests activity date
    _.forEach(grouped, function (val, key){
      _.forEach(val, function (act) {

	//***IMPORTANT***
	//for the activityDate sometimes the time component of the date is different.
	//=> affects how we translate to timestamp values which is needed when using 
	//rickshaw. therefore, we MUST rid the activityDate of all time-like details
	//before proceeding. 
	//this is also done later on in this function
	//get rid of the hours,mins,seconds,millisecs
	var dateWithNoTime = act.activity[0].activityDate.setHours(0,0,0,0);

        if (!earliestActDate) {
          earliestActDate = dateWithNoTime;
        };
	if (!latestActDate) {
          latestActDate = dateWithNoTime;
	}
        if (dateWithNoTime <= earliestActDate) {
          earliestActDate = dateWithNoTime;
        }
        if (dateWithNoTime >= latestActDate) {
          latestActDate = dateWithNoTime;
        }
      });      
    });

    deltaTime = latestActDate - earliestActDate;
    numberOfDays = (deltaTime / dayLength) + 1;

    /*
    console.log('***activityTimelineMITotals***');
    console.log('typeof(latestActDate): ' + typeof(latestActDate)); //number
    console.log('latestActDate: ' + latestActDate);
    console.log('earliestActDate: ' + earliestActDate);
    console.log('deltaTime: ' + deltaTime);
    console.log('numberOfDays: ' + numberOfDays);
    */
    
    for (i = 0; i < numberOfDays; i++) {
      dummyDataPoint = {},
      dummyDataPoint.x = (earliestActDate + (i * dayLength)) / 1000; //back to seconds
      dummyDataPoint.y = 0;
      defaultValues.push(dummyDataPoint);
    }
    //console.log('defaultValues');
    //console.log(defaultValues);

    
    //want to find the earliest date activity and last date activity
    //then generate a collection with every date from earliest to last. default to have
    //null val for each date
    //then for each activity we add count for the day to this collection
    //=> ensures each activiy collection has the same length as required by rickshaw

    _.forEach(grouped, function (value, key) {
      var mappedAct = _.reduce(value, function (result, survey, k) {

	//get rid of the hours,mins,seconds,millisecs
	var dateKey = survey.activity[0].activityDate.setHours(0,0,0,0) / 1000;
	var mi = survey.activity[0].meaningfulInteractions;

	if (result[dateKey] === undefined) {
	  result[dateKey] = mi;
          //console.log('FIRST TIME dateKey: ' + dateKey);
          //console.log('mi: ' + mi);
	  //console.log('result[dateKey]');
	  //console.log(result[dateKey]);
	} else {
	  result[dateKey] = result[dateKey] + mi;
          //console.log('dateKey ALREADY PRESENT: ' + dateKey);
          //console.log('mi: ' + mi);
	  //console.log('result[dateKey]');
	  //console.log(result[dateKey]);
	}

	return result;
      }, {});

      //console.log('mappedAct for ' + key);
      //console.log(mappedAct);
      allMapped[key] = mappedAct;
    });
    //console.dir('allMapped');
    //console.dir(allMapped);

    //munge data into format expected by rickshaw 
    //[
    //  {name:'Door Knocking', data: [{}, {}, {}] },
    //  {name:'Phone Banking', data: [{}, {}, {}]},
    //  {name:'Stall', data: [{}, {}, {}]}
    //]
    //and change all non zero data points in defaultValues corresponding to an activity
    _.forEach(allMapped, function (val, key) {
      var tempDefaults = _.cloneDeep(defaultValues);
      var mObj = {};

      _.forEach(val, function (v, k) {
	var cObj = {},
	  foundIndex,
	  tempDate;

	tempDate = parseInt(k, 10);
	foundIndex = _.findIndex(tempDefaults, {x: tempDate});

	cObj.x = tempDate;
	cObj.y = v;
	//console.log('cObj:');
	//console.log(cObj);

	if (foundIndex !== -1) {
          //must replace in tempDefaults an actual non-zero survey
	  tempDefaults[foundIndex] = cObj;
	}
	//console.log('tempDefaults');
	//console.log(tempDefaults);
      });

      mObj.name = key;      
      mObj.data = _.sortBy(tempDefaults, function (item) {return item.x;});
      paddedMapped[_.findIndex(paddedMapped, {'name': key})] = mObj;
    });
    //console.dir('paddedMapped[0].data');
    //console.dir(paddedMapped[0].data);
    return paddedMapped;
  }


  function makeActivityTimelineMIWeekly() {
    var individualActivityTimelineTotals,
      dayLength = 60 * 60 * 24 * 1000,      //day length in milliseconds
      weekLength = 60 * 60 * 24 * 7 * 1000, //week length in milliseconds
      electionDate = (new Date('2014-12-01')).setHours(0,0,0,0), //milliseconds
      i,j,
      earliestActDate,
      latestActDate,
      grouped,
      allMapped = {},
      deltaTime,
      numberOfDays,
      defaultValues = [],
      dummyDataPoint = {},
      paddedMapped = [
        {'name': 'Door Knocking', 'data': []}
      ];


    //only do this for dking for now
    var relevantActivities = [
      'Door Knocking'
    ];

    //get rid of activities that don't have meaningful interactions field
    var relevantSurveys = _.filter(surveys, function (val, index) {
      return _.contains(relevantActivities, val.activity[0].activityType);
    });
    //console.log('relevantSurveys');
    //console.log(relevantSurveys);

    //outputs an object with activity name as keys and arrays of surveys for that 
    //activity as values
    grouped = _.groupBy(relevantSurveys, function (survey) {
      return survey.activity[0].activityType;
    });
    //console.dir('grouped');
    //console.dir(grouped);

    //calc earliest & latests activity date
    _.forEach(grouped, function (val, key){
      _.forEach(val, function (act) {

	//***IMPORTANT***
	//for the activityDate sometimes the time component of the date is different.
	//=> affects how we translate to timestamp values which is needed when using 
	//rickshaw. therefore, we MUST rid the activityDate of all time-like details
	//before proceeding. 
	//this is also done later on in this function
	//get rid of the hours,mins,seconds,millisecs
	var dateWithNoTime = act.activity[0].activityDate.setHours(0,0,0,0);

        if (!earliestActDate) {
          earliestActDate = dateWithNoTime;
        };
	if (!latestActDate) {
          latestActDate = dateWithNoTime;
	}
        if (dateWithNoTime <= earliestActDate) {
          earliestActDate = dateWithNoTime;
        }
        if (dateWithNoTime >= latestActDate) {
          latestActDate = dateWithNoTime;
        }
      });      
    });

    deltaTime = latestActDate - earliestActDate;
    numberOfDays = (deltaTime / dayLength) + 1;

    /*
    console.log('***activityTimelineMIWeekly***');
    console.log('typeof(latestActDate): ' + typeof(latestActDate)); //number
    console.log('latestActDate: ' + latestActDate);
    console.log('earliestActDate: ' + earliestActDate);
    console.log('deltaTime: ' + deltaTime);
    console.log('numberOfDays: ' + numberOfDays);
    console.log('electionDate');
    console.log(electionDate);
    console.log('weekLength');
    console.log(weekLength);
    */

    var weekStart = electionDate;
    var weekStartArray = [];

    while (weekStart >= (earliestActDate - weekLength)) {
      //console.log(new Date(weekStart))
      weekStartArray.push(weekStart);
      weekStart -= weekLength; 
    }
    //console.log('weekStartArray, has timestamps of weeks starting:');
    //console.log(weekStartArray);

    var weekNumbers = [];
    for (j = 0 ; j < weekStartArray.length; j++) {
      weekNumbers.push(j);
    }

    var allTestles = {};
    _.forEach(grouped, function (value, key) {
      _.forEach(value, function (survey) {
        var week = 0,
	  actTimeStamp = survey.activity[0].activityDate.setHours(0,0,0,0);

        for (var k = 0; k < weekStartArray.length; k++) {
          if (actTimeStamp < weekStartArray[k]) {
            continue;
	  }
	  week = k - 1;
	  break;
        }	
	//console.log('actTimeStamp');
	//console.log(actTimeStamp);
	//console.log('week:');
	//console.log(week);

	if (!allTestles[week]) {
          allTestles[week] = survey.activity[0].meaningfulInteractions; 
        } else {
          allTestles[week] +=survey.activity[0].meaningfulInteractions;
	}
      });
      console.log('allTestles:');
      console.log(allTestles);
    });

    var testleKeys = _.keys(allTestles);
    var maxTestle = parseInt(_.max(testleKeys), 10);
    var minTestle = parseInt(_.min(testleKeys), 10);

    for (var g = minTestle; g < maxTestle; g++) {
      if (_.contains(testleKeys, g.toString())) {
        continue; 
      } else {
        allTestles[g] = 0;
      }
    }
    //console.log('testleKeys');
    //console.log(testleKeys);
    //console.log('allTestles:');
    //console.log(allTestles);

    return allTestles;
  }
}; //end export.analysis



exports.summary = function (surveys, sentContext, cb) {

  attachAllMetricsToContext();

  function attachAllMetricsToContext () {
    Metric.find({context: sentContext}, function (err, metrics) {
      if (err) return handleError(err);
      console.log('have all the metrics for sentContext:' + sentContext);
      console.log('metrics.length:');
      console.log(metrics.length);
  
      //if there are no metrics for the context, return
      if (!_.size(metrics)) {return cb({'ERR': 'no metrics present for context'}, null);};
  
      Context.findOne({name: sentContext}, function (err, context){
        if (err) return handleError(err);
        if (!context) return handleError({'ERROR':'context is null'});

        //console.log('context:');
        //console.log(context);
  
	//******* IMPORTANT *********
        //HACK: if there are metrics already associated with the context, do not add.
	//
        //production version should have a ui for adding/removing metrics for a context
        if (_.size(context.metrics)) {
          context.save(function (err){
            if (err) return handleError(err);
            startTheStatJourney();
          });
  
        } else {
          _.forEach(metrics, function (metric) {
            context.metrics.push(metric._id); 
          });
    
          context.save(function (err){
            if (err) return handleError(err);
            startTheStatJourney();
          });
        }
      });
    });
  }
  
  function startTheStatJourney () {
    console.log('startTheStatJourney: sentContext');
    console.log(sentContext);
    
    Context 
      .find({ name: sentContext })
      .populate('metrics')
      .exec(function (err, context) {
        if (err) return cb(err);
        //console.dir('context:');
        //console.dir(context);
        //console.log('The metrics in context are: ');
        //console.dir(context[0].metrics);
        
        var stats = new StatsClass(surveys, context, context[0].metrics);
        var summaryStats = stats.getSummaryStats();
  
        cb(null, summaryStats);
      });
  }
}; //end exports.summary 

var handleError = function (err) {
  console.dir(err);
};
