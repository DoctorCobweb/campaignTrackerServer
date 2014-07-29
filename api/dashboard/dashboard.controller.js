'use strict';

var _ = require('lodash');
var Dashboard = require('./dashboard.model');
var Survey = require('../survey/survey.model');
var overviewUtils = require('./overviewUtils');
var upperHouseUtils = require('./upperHouseUtils');
var lowerHouseUtils = require('./lowerHouseUtils');
var personUtils = require('./personUtils');
var neighbourhoodTeamUtils = require('./neighbourhoodTeamUtils');

// Get list of dashboards
exports.index = function(req, res) {
  Dashboard.find(function (err, dashboards) {
    if(err) { return handleError(res, err); }
    return res.json(200, dashboards);
  });
};



// Get dashboard overview 
exports.statewide = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }

    overviewUtils.overviewFilter(surveys, 'Statewide', function (error, results){
      if(error) { return handleError(res, err); }
      return res.json(200, results);
    });
  });
};


// Get dashboard upperHouse summary
exports.regionSummary = function(req, res) {
  Survey.find({region: req.params.region}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    console.log('region: ' + req.params.region);

    upperHouseUtils.upperHouseSummaryFilter(
      surveys,
      req.params.region,
      function(error, results) {
        if(error) { return handleError(res, err); }
        return res.json(200, results);
      });
  });
};

/*
// Get dashboard upperHouse 
exports.regionSummary = function(req, res) {
  console.log('region: ' + req.params.region);
  Survey.find({region: req.params.region}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    //return res.json(200, surveys);
    //console.log(upperHouseUtils.upperHouseFilter(surveys));
    return res.json(200, upperHouseUtils.upperHouseFilter(surveys));
  });
};
*/

// Get dashboard lowerHouse 
exports.districtSummary = function(req, res) {
  Survey.find({district: req.params.district}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    //return res.json(200, surveys);
    return res.json(200, lowerHouseUtils.lowerHouseFilter(surveys));
  });
};

// Get dashboard person 
exports.personSummary = function(req, res) {
  Survey.find({personName: req.params.personName}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    //return res.json(200, surveys);
    return res.json(200, personUtils.personFilter(surveys));
  });
};

// Get dashboard person 
exports.neighbourhoodTeamSummary = function(req, res) {
  Survey.find({neighbourhoodTeam: req.params.team}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    //return res.json(200, surveys);
    return res.json(200, neighbourhoodTeamUtils.teamFilter(surveys));
  });
};


// Get a single dashboard
exports.show = function(req, res) {
  Dashboard.findById(req.params.id, function (err, dashboard) {
    if(err) { return handleError(res, err); }
    if(!dashboard) { return res.send(404); }
    return res.json(dashboard);
  });
};

// Creates a new dashboard in the DB.
exports.create = function(req, res) {
  Dashboard.create(req.body, function(err, dashboard) {
    if(err) { return handleError(res, err); }
    return res.json(201, dashboard);
  });
};

// Updates an existing dashboard in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Dashboard.findById(req.params.id, function (err, dashboard) {
    if (err) { return handleError(err); }
    if(!dashboard) { return res.send(404); }
    var updated = _.merge(dashboard, req.body);
    updated.save(function (err) {
      if (err) { return handleError(err); }
      return res.json(200, dashboard);
    });
  });
};

// Deletes a dashboard from the DB.
exports.destroy = function(req, res) {
  Dashboard.findById(req.params.id, function (err, dashboard) {
    if(err) { return handleError(res, err); }
    if(!dashboard) { return res.send(404); }
    dashboard.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
