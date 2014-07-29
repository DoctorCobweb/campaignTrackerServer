'use strict';

var _ = require('lodash');
var Metric = require('./metric.model');

// Get list of metrics
exports.index = function(req, res) {
  Metric.find(function (err, metrics) {
    if(err) { return handleError(res, err); }
    return res.json(200, metrics);
  });
};

// Get a single metric
exports.show = function(req, res) {
  Metric.findById(req.params.id, function (err, metric) {
    if(err) { return handleError(res, err); }
    if(!metric) { return res.send(404); }
    return res.json(metric);
  });
};

// Creates a new metric in the DB.
exports.create = function(req, res) {
  Metric.create(req.body, function(err, metric) {
    if(err) { return handleError(res, err); }
    return res.json(201, metric);
  });
};

// Updates an existing metric in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Metric.findById(req.params.id, function (err, metric) {
    if (err) { return handleError(err); }
    if(!metric) { return res.send(404); }
    var updated = _.merge(metric, req.body);
    updated.save(function (err) {
      if (err) { return handleError(err); }
      return res.json(200, metric);
    });
  });
};

// Deletes a metric from the DB.
exports.destroy = function(req, res) {
  Metric.findById(req.params.id, function (err, metric) {
    if(err) { return handleError(res, err); }
    if(!metric) { return res.send(404); }
    metric.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}