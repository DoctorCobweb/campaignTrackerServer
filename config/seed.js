/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Customized Forms',
    info : 'Choose what you want to measure for any activity your campaign uses.'
  }, {
    name : 'Mobile Friendly',
    info : 'Data entry out in the field is just as easy as sitting in front of a laptop.'
  }, {
    name : 'Campaign Progress',
    info : 'Track performance for each activity and how far off you are from achieving your goals.'
  },  {
    name : 'Activity Analysis',
    info : 'Compare and analyse which activities are the most efficient, labour intensive, most popular etc. for generating meaningful interactions with electors and volunteers. '
  },  {
    name : 'Performance Granularity',
    info : 'Track the performance of the campaign from Statewide to Region to District to all the way down to individual people.'
  },{
    name : 'Reports',
    info : 'Easily generate a report for your campaign at any granularity.'
  });
});

User.find({}).remove(function() {
  //not providing role is ok because mongoose has a default set to 'dataEntry'
  User.create({
    provider: 'local',
    name: 'Individual',
    email: 'individual@wv.com',
    password: 'teamlloyd2014i'
  }, {
    provider: 'local',
    role: 'teamLeader',
    name: 'Team Leader',
    email: 'teamLeader@wv.com',
    password: 'teamlloyd2014tl'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@wv.com',
    password: 'teamlloyd2014a'
  }, function() {
      console.log('finished populating users');
    }
  );
});
