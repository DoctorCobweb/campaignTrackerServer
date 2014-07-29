'use strict';

var _ = require('lodash');
var Metric = require('../metric/metric.model');
var Context= require('../context/context.model');
var StatsClass= require('../../components/StatsClass');


exports.upperHouseSummaryFilter = function (surveys, sentContext, cb) {
  //the first two function calls are used to bootstrap a context and attach metrics
  //to that new context doc
  //seedNewContext(sentContext);  
  //attachAllMetricsToContext(surveys, sentContext, cb);
  startTheStatJourney(surveys, sentContext, cb);
};


var attachAllMetricsToContext = function (surveys, sentContext, cb) {
  Metric.find({context: sentContext}, function (err, metrics) {
    if (err) return handleError(err);
    console.log('have all the metrics for sentContext:' + sentContext);
    //console.log(metrics.length);

    Context.findOne({name: sentContext}, function (err, context){
      if (err) return handleError(err);

      _.forEach(metrics, function (metric) {
        context.metrics.push(metric._id); 
      });
      //context.metrics.push(metric_seed._id);

      context.save(function (err){
        if (err) return handleError(err);
        startTheStatJourney(surveys, sentContext, cb);
      });
    });
  });
};



var startTheStatJourney = function (surveys, sentContext, cb) {
  Context 
    .find({ name: sentContext })
    .populate('metrics')
    .exec(function (err, context) {
      if (err) return cb(err);
      //console.log('The metrics in context are: ');
      //console.dir(context[0].metrics);
      
      var stats = new StatsClass(surveys, context, context[0].metrics);
      var summaryStats = stats.getSummaryStats();

      cb(null, summaryStats);
    });
};


var seedNewContext = function (sentContext) {
  var context = new Context({
    name: sentContext,
    info: "Second coursest statistic available for the state, region",
    population: 460000,
    metrics: []
  });
  
  context.save(function (err) {
    if (err) return handleError(err);
    // thats it!
  });
};


var handleError = function (err) {
  console.log('ERROR: could not get metrics for context');
};
