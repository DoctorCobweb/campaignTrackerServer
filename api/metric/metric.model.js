'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MetricSchema = new Schema({
  name: String,
  info: String,
  goal: Number,
  activity: String,
  context: String
});

module.exports = mongoose.model('Metric', MetricSchema);
