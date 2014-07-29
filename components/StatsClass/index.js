'use strict';

var _ = require('lodash');
var Metric = require('../../api/metric/metric.model');
var Context = require('../../api/context/context.model');

var StatsClass = function (surveys, context, metrics) {
  this.surveys = surveys,
  this.surveysForActivity = [];
  this.metrics = metrics;
  this.metricToAttribute = {
    "Total attempts":"attempts",
    "Total answered":"answered",
    "Total meaningful interactions":"meaningfulInteractions",
    "Total hours spent":"volTotalWorkHrs",
    "Total volunteer training hrs":"volTotalTrainingHrs",
    "Total volunteer participation":"attendance",
    "Total volunteer hrs committed":"volTotalHrsCommitted",
    "Total number of events":"activityCount"
  };
  this.translator = {
    "dk":"Door Knocking",
    "pb":"Phone Banking",
    "vrpc":"Volunteer Recruitment Phone Calling",
    "ooos":"One On One",
    "ntms":"Neighbourhood Team Meeting",
    "vhgs":"Volunteer House Gathering",
    "ss":"Stall",
    "vhms":"Voter House Meeting",
    "tss":"Training Session"
  };
};

StatsClass.prototype.filterSurveysForActivity = function (activity) {
  return _.filter(this.surveys, function (survey) {
    return survey.activity[0].activityType === activity;
  }, this);
};

StatsClass.prototype.filterMetricsForActivity = function (activity) {
  return _.filter(this.metrics, function (metric) {
    return metric.activity === activity;
  }, this);
};

StatsClass.prototype.makeSummaryStats = function (activityMetrics, activitySurveys) {
  return _.map(activityMetrics, function (metric) {
    var metricName = metric.name,
        metricGoal = metric.goal,
        metricCurrent =  _.reduce(activitySurveys, function (sum, item) {
          if (this.metricToAttribute[metric.name] === 'activityCount') {
            return sum = sum + 1;
          } else {
            return sum = sum + item.activity[0][this.metricToAttribute[metric.name]];
          }
        }, 0, this),
        metricPercentComplete = 100 * (metricCurrent / metricGoal);

    return {
      metric : metricName, 
      goal: metricGoal,
      current: metricCurrent,
      percentComplete: metricPercentComplete  
    };
  }, this);
};

StatsClass.prototype.getSummaryStats = function () {
  var i
  var mData = {};

  _.forEach(this.translator, function (val, key) {
    //console.log('key: ' + key);
    //console.log('val: ' + val);
    mData[key] = this.makeASummary(val);
  }, this);
  
  return mData;
};

StatsClass.prototype.makeASummary= function (activity) {
  //filter for activity
  var filteredSurveys = this.filterSurveysForActivity(activity);

  //filter metrics for activity  
  var filteredMetrics = this.filterMetricsForActivity(activity);

  //do actual stats
  var activitySummaryStats = this.makeSummaryStats(filteredMetrics, filteredSurveys);

  //console.log('filteredSurveys is:');
  //console.log(filteredSurveys);
  //console.log('filteredMetrics is:');
  //console.log(filteredMetrics);
  //console.log('activitySummaryStats:');
  //console.log(activitySummaryStats);

  return activitySummaryStats;
};

module.exports = StatsClass;
