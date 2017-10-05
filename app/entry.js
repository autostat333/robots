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




import config from './config.js';
import reportsCntr from './controllers/reports/reportsCntr.js';
import roundsCntr from './controllers/rounds/roundsCntr.js';
import robotBaseUrlsCntr from './controllers/rounds/robotBaseUrlsCntr.js';
import robotUrlsParsedCntr from './controllers/rounds/robotUrlsParsedCntr.js';
import robotErrorsCntr from './controllers/rounds/robotErrorsCntr.js';
import socketIo from './services/socketIo.js';
import loginModalCntr from './controllers/login/loginModalCntr.js';
import loginCntr from './controllers/login/loginCntr.js';
import minLength from './directives/minLength.js';
import autofocus from './directives/autofocus.js';
import enterPress from './directives/enter_press.js';

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