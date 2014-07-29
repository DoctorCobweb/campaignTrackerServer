'use strict';

// ACTIVITY TYPES 
// activities have differenct survey questions, leveraging nosql schemelessness to have
// different document structure for each activity
//
// 1. Door Knocking
// 2. Phone Banking
// 3. Volunteer Recruitment Calling
// 4. One On One
// 5. Door Knock
// 6. Volunteer House Gathering
// 7. Stall
// 8. Voter House Gathering
// 9. Training Session

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActivitySchema = new Schema({
  activityType:           String,
  activityDate:           Date,
  activityStartTime:      Date,
  attendance:             Number,
  attempts:               Number,
  answered:               Number,
  meaningfulInteractions: Number,
  volTotalWorkHrs:        Number,
  volTotalTrainingHrs:    Number,
  volTotalHrsCommitted:   Number,
  comment:                String

});

exports.Activity = mongoose.model('Activity', ActivitySchema);
exports.ActivitySchema = ActivitySchema;