'use strict';

var _ = require('lodash');
var Metric = require('../metric/metric.model');
var Context= require('../context/context.model');
var StatsClass= require('../../components/StatsClass');

exports.tracking = function (surveys, sentContext, cb) {
  cb(null, "returns from tracking");
};

exports.analysis = function (surveys, sentContext, cb) {
  var data = {};
  var totalSurveys;
  var splitActivities;
  var allActivities = [
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

  totalSurveys = _.chain(surveys)
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
  var presentActivities = _.chain(splitActivities)
    .pluck('x')
    .value();

  //find the missing ones (e.g. the activities with 0 surveys)
  var difference = _.difference(allActivities, presentActivities);

  //add in missing ones to splitActivities
  var combined = _.forEach(difference, function (item) {
    splitActivities.push({
      x: item,
      y: 0
    });
  });

  //always order in terms of activity name
  //need to keep things in order as we use a custom x axis formatter in rickshaw
  //=> we translate back to activity name using x integer val
  var ordered = _.sortBy(splitActivities, function (dataPoint){return dataPoint.x;});
 
  //console.log('ordered');
  //console.dir(ordered);
  

  //redo the values for order activities for rickshaw
  var redoKeys = _.forEach(ordered, function (item, index) {
    item.x = index+1;
  });

  //console.log('presentActivities');
  //console.dir(presentActivities);
  //console.log('difference');
  //console.dir(difference);
  //console.log('redoKeys');
  //console.dir(redoKeys);

  data.total = totalSurveys;
  data.split = redoKeys;


  cb(null, data);
};

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
  
  
        //HACK: if there are metrics already associated with the context, do not add
        //production version will have a ui for adding/removing metrics for a context
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
  };
  
  
  
  function startTheStatJourney () {
    console.log('startTheStatJourney');
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
  };

}; //end summary 



var handleError = function (err) {
  console.dir(err);
};