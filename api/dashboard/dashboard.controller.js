'use strict';

var _ = require('lodash');
var Dashboard = require('./dashboard.model');
var Survey = require('../survey/survey.model');
var statsUtils = require('./statsUtils');
var personUtils = require('./personUtils');
var neighbourhoodTeamUtils = require('./neighbourhoodTeamUtils');

// Get list of dashboards
exports.index = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }
    return res.json(200, surveys);
    });
};


//
// STATEWIDE ROUTES
//
// Get dashboard statewide summary 
exports.statewideSummary = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }

    statsUtils.summary(surveys, 'Statewide', function (error, results){
      if(error) { return handleError(res, error); }
      return res.json(200, results);
    });
  });
};

// Get dashboard statewide analysis 
exports.statewideAnalysis = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }

    statsUtils.analysis(surveys, 'Statewide', function (error, results){
      if(error) { return handleError(res, error); }
      return res.json(200, results);
    });
  });
};

// Get dashboard statewide tracking 
exports.statewideTracking = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }

    statsUtils.tracking(surveys, 'Statewide', function (error, results){
      if(error) { return handleError(res, error); }
      return res.json(200, results);
    });
  });
};




//
// UPPER HOUSE ROUTES
//
// Get dashboard upperHouse summary
exports.regionSummary = function(req, res) {
  Survey.find({region: req.params.region}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    console.log('region: ' + req.params.region);
    //console.log('surveys:');
    //console.dir(surveys);

    //must check if surveys are null for a region
    if (!surveys) {return handleError(res, err);}

    statsUtils.summary(surveys, req.params.region, function(error, results) {
        if(error) { return handleError(res, error); }
        return res.json(200, results);
      });
  });
};


//
// LOWER HOUSE ROUTES
//
// Get dashboard lowerHouse 
exports.districtSummary = function(req, res) {
  Survey.find({district: req.params.district}, function (err, surveys) {
    if(err) { return handleError(res, err); }
    console.log('district: ' + req.params.district);
    //console.log('surveys:');
    //console.dir(surveys);


    //must check if surveys are null for a district 
    if (!surveys) {return handleError(res, err);}

    statsUtils.summary(surveys, req.params.district, function(error, results) {
        if(error) { return handleError(res, error); }
        return res.json(200, results);
      });
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
  console.dir(err);
  return res.send(500, err);
}
