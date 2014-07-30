'use strict';

var express = require('express');
var controller = require('./dashboard.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/overview/statewide', controller.statewide);

router.get('/region/:region/summary', controller.regionSummary);

//TODO: change paths to be like region type above
router.get('/district/:district/summary', controller.districtSummary);
router.get('/person/summary/:personName', controller.personSummary);
router.get('/neighbourhoodTeam/summary/:team', controller.neighbourhoodTeamSummary);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
