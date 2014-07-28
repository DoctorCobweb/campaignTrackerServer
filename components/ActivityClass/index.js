'use strict';

var _ = require('lodash');

var ActivityClass = function (activityName, surveys, metrics) {
  this.activityName = activityName,
  this.surveys = surveys,
  this.metrics = metrics;
};

ActivityClass.prototype.filterForActivity = function () {
  return _.filter(this.surveys, function (survey) {
    return survey.activity[0].activityType === this.activityName;
  }, this);
};

ActivityClass.prototype.getOverviewStats = function () {
  return _.map(this.metrics, function (metric) {
    var metricName = metric.name,
        metricGoal = metric.goal,
        metricCurrent =  _.reduce(this.filterForActivity(), function (sum, item) {
          if (metric.attr === 'activityCount') {
            return sum = sum + 1;
          } else {
            return sum = sum + item.activity[0][metric.attr];
          }
        }, 0),
        metricPercentComplete = 100 * (metricCurrent / metricGoal);

    return {
      metric : metricName, 
      goal: metricGoal,
      current: metricCurrent,
      percentComplete: metricPercentComplete  
    };
  }, this);
};

module.exports = ActivityClass;
