'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContextSchema = new Schema({
  name: String,
  info: String,
  population: Number,
  metrics: [{type: Schema.Types.ObjectId, ref: 'Metric'}]
});

module.exports = mongoose.model('Context', ContextSchema);
