import angular from 'angular';
import mainCntr from './controllers/main/mainCntr.js';
import angularMaterial from 'angular-material';
import uiRouter from 'angular-ui-router';
import backendService from './services/backendService.js';
import baseTableCntr from './controllers/rounds/baseTableCntr.js';
import reportsDetailsCntr from './controllers/reports/reportsDetailsCntr.js'
import reportsCarsCntr from './controllers/reports/reportsCarsCntr.js'
import './otherLibs/pagination.js';
import run from './run.js';
import angularMessages from 'angular-messages'
import ngCookies from 'angular-cookies';




var config = require('./config.js');
var reportsCntr = require('./controllers/reports/reportsCntr.js');
var roundsCntr = require('./controllers/rounds/roundsCntr.js');
var robotBaseUrlsCntr = require('./controllers/rounds/robotBaseUrlsCntr.js');
var robotUrlsParsedCntr = require('./controllers/rounds/robotUrlsParsedCntr.js');
var robotErrorsCntr = require('./controllers/rounds/robotErrorsCntr.js');
var socketIo = require('./services/socketIo.js');
var loginModalCntr = require('./controllers/login/loginModalCntr.js');
var loginCntr = require('./controllers/login/loginCntr.js');
var minLength = require('./directives/minLength.js');
var autofocus = require('./directives/autofocus.js');
var enterPress = require('./directives/enter_press.js');

window.$ = window.jQuery = require('jquery');
window.io = require('socket.io-client');
window.jwtDecode = require('jwt-decode');


require('../node_modules/angular-material/angular-material.scss');
require ('./styles/common.scss');


var myApp = angular.module('app',[angularMaterial,uiRouter,'cl.paging',angularMessages,ngCookies])
    .config(config)


    .controller('mainCntr',mainCntr)
    .controller('roundsCntr',roundsCntr)
    .controller('reportsCntr',reportsCntr)


    //base controller for all tables
    //below controllers for tabs inherited baseTable controller and expand it
    .controller('baseTableCntr',baseTableCntr)

    //for robots tabs
    .controller('robotBaseUrlsCntr',robotBaseUrlsCntr)
    .controller('robotUrlsParsedCntr',robotUrlsParsedCntr)
    .controller('robotErrorsCntr',robotErrorsCntr)

    //reports controllers
    .controller('reportsDetailsCntr',reportsDetailsCntr)
    .controller('reportsCarsCntr',reportsCarsCntr)

    //login
    .controller('loginCntr',loginCntr)
    .controller('loginModalCntr',loginModalCntr)

    .service('$backend',backendService)
    .service('socketIo',socketIo)

    //directives
    .directive('minLength',minLength) //for imput min-length=5
    .directive('autofocus',autofocus)
    .directive('enterPress',enterPress)


    .run(run);
