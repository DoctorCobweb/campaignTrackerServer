'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    activity = require('../activity/activity.model').ActivitySchema;

var SurveySchema = new Schema({
  region:            {type: String, required:true}, 
  district:          {type:String, required:true},
  personName:        {type:String, required:true},
  neighbourhoodTeam: String,
  loggedDate:        {type: Date, default: Date.now},
  activity:          [activity]
});

module.exports = mongoose.model('Survey', SurveySchema);
