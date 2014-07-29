'use strict';

var _ = require('lodash');
var Context = require('./context.model');

// Get list of contexts
exports.index = function(req, res) {
  Context.find(function (err, contexts) {
    if(err) { return handleError(res, err); }
    return res.json(200, contexts);
  });
};

// Get a single context
exports.show = function(req, res) {
  Context.findById(req.params.id, function (err, context) {
    if(err) { return handleError(res, err); }
    if(!context) { return res.send(404); }
    return res.json(context);
  });
};

// Creates a new context in the DB.
exports.create = function(req, res) {
  Context.create(req.body, function(err, context) {
    if(err) { return handleError(res, err); }
    return res.json(201, context);
  });
};

// Updates an existing context in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Context.findById(req.params.id, function (err, context) {
    if (err) { return handleError(err); }
    if(!context) { return res.send(404); }
    var updated = _.merge(context, req.body);
    updated.save(function (err) {
      if (err) { return handleError(err); }
      return res.json(200, context);
    });
  });
};

// Deletes a context from the DB.
exports.destroy = function(req, res) {
  Context.findById(req.params.id, function (err, context) {
    if(err) { return handleError(res, err); }
    if(!context) { return res.send(404); }
    context.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}