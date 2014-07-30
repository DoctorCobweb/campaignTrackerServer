'use strict';

var _ = require('lodash');
var Metric = require('../metric/metric.model');
var Context= require('../context/context.model');
var StatsClass= require('../../components/StatsClass');


exports.lowerHouseSummaryFilter = function (surveys, sentContext, cb) {

  attachAllMetricsToContext();


  function attachAllMetricsToContext() {
    Metric.find({context: sentContext}, function (err, metrics) {
      if (err) return handleError(err);
      console.log('have all the metrics for sentContext:' + sentContext);
      console.log(metrics.length);
  
      //if there are no metrics for the context, return
      if (!_.size(metrics)) {return cb({'ERR': 'no metrics present for context'}, null);};
  
      Context.findOne({name: sentContext}, function (err, context){
        if (err) return handleError(err);
        if (!context) return handleError({'ERROR':'context is null'});
  
        //HACK: if there are metrics already associated with the context, do not add
        //production version will have a ui for adding/removing metrics for a context
        if (_.size(context.metrics)) {
  
          context.save(function (err){
            if (err) return handleError(err);
            startTheStatJourney();
          });
  
        } else {
          //if there are no metrics in context's metrics array then push onto
          //it the found metrics
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
    Context 
      .find({ name: sentContext })
      .populate('metrics')
      .exec(function (err, context) {
        if (err) return cb(err);
        //console.log('The metrics in context are: ');
        //console.dir(context[0].metrics);
        console.log('context:');
        console.dir(context);
  
        //check to see if context does not exist. e.g. nothing for 'Geelong'
        if (!_.size(context)) {return cb({'error':'context not set this distrct'},null);}
        
        var stats = new StatsClass(surveys, context, context[0].metrics);
        var summaryStats = stats.getSummaryStats();
  
        cb(null, summaryStats);
      });
  };
}; //end lowerHouseSummaryFilter function


var handleError = function (err) {
  console.log(err);
};
