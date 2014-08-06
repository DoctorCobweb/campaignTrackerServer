'use strict';

var express = require('express');
var controller = require('./dashboard.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/statewide/summary', controller.statewideSummary);
router.get('/statewide/analysis', controller.statewideAnalysis);
router.get('/statewide/tracking', controller.statewideTracking);
router.get('/region/:region/summary', controller.regionSummary);
router.get('/region/:region/analysis', controller.regionAnalysis);
router.get('/district/:district/summary', controller.districtSummary);
router.get('/district/:district/analysis', controller.districtAnalysis);

router.get('/person/summary/:personName', controller.personSummary);
router.get('/neighbourhoodTeam/summary/:team', controller.neighbourhoodTeamSummary);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
