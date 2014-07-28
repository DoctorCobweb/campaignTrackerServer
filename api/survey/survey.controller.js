'use strict';

var _ = require('lodash');
var Survey = require('./survey.model');
var Activity = require('../activity/activity.model').Activity;


// Get list of surveys
exports.index = function(req, res) {
  Survey.find(function (err, surveys) {
    if(err) { return handleError(res, err); }
    return res.json(200, surveys);
  });
};


// Get a single survey
exports.show = function(req, res) {
  Survey.findById(req.params.id, function (err, survey) {
    if(err) { return handleError(res, err); }
    if(!survey) { return res.send(404); }
    return res.json(survey);
  });
};


// Creates a new survey in the DB.
exports.create = function(req, res) {
  Survey.create(req.body.campaignDetails, function(err, survey) {
    if(err) { return handleError(res, err); }
    survey.activity.push(req.body.activityDetails);
    survey.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(201, survey);
    });   
  });
};



// Updates an existing survey in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Survey.findById(req.params.id, function (err, survey) {
    if (err) { return handleError(err); }
    if(!survey) { return res.send(404); }
    var updated = _.merge(survey, req.body);
    updated.save(function (err) {
      if (err) { return handleError(err); }
      return res.json(200, survey);
    });
  });
};

// Deletes a survey from the DB.
exports.destroy = function(req, res) {
  Survey.findById(req.params.id, function (err, survey) {
    if(err) { return handleError(res, err); }
    if(!survey) { return res.send(404); }
    survey.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  console.log(err);
  return res.send(500, err);
}
