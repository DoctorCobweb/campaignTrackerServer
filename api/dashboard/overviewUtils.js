'use strict';

var _ = require('lodash');
var ActivityClass = require('../../components/ActivityClass');

var dkMetrics = [
  {"name": "Total attempts", "goal": 5000.0, "attr":"attempts"},
  {"name": "Total answered", "goal": 2000.0, "attr":"answered"},
  {"name": "Total meaningful interactions", "goal": 1000.0, "attr":"meaningfulInteractions"},
  {"name": "Total hours spent", "goal": 2000.0, "attr":"volTotalWorkHrs"},
  {"name": "Total volunteer training hrs", "goal": 2000.0, "attr":"volTotalTrainingHrs"},
  {"name": "Total volunteer participation", "goal": 5000.0, "attr":"attendance"}];

var pbMetrics = [
  {"name": "Total attempts", "goal": 4000.0, "attr":"attempts"},
  {"name": "Total answered", "goal": 3000.0, "attr":"answered"},
  {"name": "Total meaningful interactions", "goal": 2000.0, "attr":"meaningfulInteractions"},
  {"name": "Total hours spent", "goal": 1000.0, "attr":"volTotalWorkHrs"},
  {"name": "Total volunteer training hrs", "goal": 500.0, "attr":"volTotalTrainingHrs"},
  {"name": "Total volunteer participation", "goal": 5000.0, "attr":"attendance"}];

var vrpcMetrics = [
  {"name": "Total attempts", "goal": 2000.0, "attr":"attempts"},
  {"name": "Total answered", "goal": 1000.0, "attr":"answered"},
  {"name": "Total meaningful interactions", "goal": 4000.0, "attr":"meaningfulInteractions"},
  {"name": "Total volunteer hrs committed", "goal": 7000.0, "attr":"volTotalHrsCommitted"},
  {"name": "Total volunteer work hrs", "goal": 5000.0, "attr":"volTotalWorkHrs"},
  {"name": "Total volunteer training hrs", "goal": 5000.0, "attr":"volTotalTrainingHrs"},
  {"name": "Total attendance", "goal": 5000.0, "attr":"attendance"}];

var oooMetrics = [
  {"name": "Total attempts", "goal": 5000.0, "attr":"attempts"},
  {"name": "Total meaningful interactions", "goal": 1000.0, "attr":"meaningfulInteractions"}];

var ntmMetrics = [
  {"name": "Total number of meetings", "goal": 5000.0, "attr":"activityCount"},
  {"name": "Total attendance", "goal": 2000.0, "attr":"attendance"}];

var vhgMetrics = [
  {"name": "Total number of gatherings", "goal": 5000.0, "attr":"activityCount"},
  {"name": "Total volunteer hrs committed", "goal": 7000.0, "attr":"volTotalHrsCommitted"},
  {"name": "Total attendance", "goal": 2000.0, "attr":"attendance"}];

var sMetrics = [
  {"name": "Total number of stalls", "goal": 5000.0, "attr":"activityCount"},
  {"name": "Total attendance", "goal": 2000.0, "attr":"attendance"},
  {"name": "Total conversations", "goal": 5000.0, "attr":"attempts"},
  {"name": "Total meaningful interactions", "goal": 1000.0, "attr":"meaningfulInteractions"}];

var vhmMetrics = [
  {"name": "Total number of meetings", "goal": 5000.0, "attr":"activityCount"},
  {"name": "Total attendance", "goal": 2000.0, "attr":"attendance"}];

var tsMetrics = [
  {"name": "Total number of training sessions", "goal": 5000.0, "attr":"activityCount"},
  {"name": "Total attendance", "goal": 2000.0, "attr":"attendance"},
  {"name": "Total volunteer training hrs", "goal": 2000.0, "attr":"volTotalTrainingHrs"}];

exports.overviewFilter = function (surveys) {
    var dkStats   = new ActivityClass('Door Knocking', surveys, dkMetrics);
    var pbStats   = new ActivityClass('Phone Banking', surveys, pbMetrics);
    var vrpcStats = new ActivityClass('Volunteer Recruitment Phone Calling', surveys, vrpcMetrics);
    var oooStats  = new ActivityClass('One On One', surveys, oooMetrics);
    var ntmStats  = new ActivityClass('Neighbourhood Team Meeting', surveys, ntmMetrics);
    var vhgStats  = new ActivityClass('Volunteer House Gathering', surveys, vhgMetrics);
    var sStats    = new ActivityClass('Stall', surveys, sMetrics);
    var vhmStats  = new ActivityClass('Voter House Meeting', surveys, vhmMetrics);
    var tsStats   = new ActivityClass('Training Session', surveys, tsMetrics);

    var mData = {
      "dk"  : dkStats.getOverviewStats(),
      "pb"  : pbStats.getOverviewStats(),
      "vrpc": vrpcStats.getOverviewStats(),
      "ooos": oooStats.getOverviewStats(),
      "ntms": ntmStats.getOverviewStats(),
      "vhgs": vhgStats.getOverviewStats(),
      "ss"  : sStats.getOverviewStats(),
      "vhms": vhmStats.getOverviewStats(),
      "tss" : tsStats.getOverviewStats()};

    return mData;
};

