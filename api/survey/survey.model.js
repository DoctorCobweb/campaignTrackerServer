'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    activity = require('../activity/activity.model').ActivitySchema;

var SurveySchema = new Schema({
  type:              {type:String, required:true},
  region:            {type:String, required:true}, 
  district:          {type:String, required:true},
  organizerPerson:   {type:String, required:true},
  dataEntryPerson:   {type:String, required:true},
  user:              {type: Schema.Types.ObjectId, ref: 'User'},
  neighbourhoodTeam: String,
  loggedDate:        {type: Date, default: Date.now},
  activity:          [activity]
});

module.exports = mongoose.model('Survey', SurveySchema);
