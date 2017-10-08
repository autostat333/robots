var express = require('express');
var fs = require('fs');
var http = require('http');
var utils = require('util');
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var config = require('./config');
var async = require('async');
var apiErrors = require('logger').createLogger('ApiErrors.log');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');




require('./server/validators.js')();


var app = express();
app.use(bodyParser.json());
app.use(cookieParser());

//require socketIO
var server = require('http').Server(app);
var io = require('socket.io')(server);


var db = '';
mongo.connect('mongodb://'+config.HOST+':27017/'+config.DATABASE,function(err,db_)
	{
	if (err){console.log('Error establish connection to DB');return false;};
	if (!config.DB_USER_NAME)
		{
		db = db_;
		console.log('Connected to MongoDB successfully!');
		initControllers();
		return false;
		}
	db_.admin().authenticate(config['DB_USER_NAME'],config['DB_USER_PASS'],function(err)
		{
		if (err){console.log('Error authenticate admin user');return false;}
		console.log('Connected to MongoDB successfully!');
		db = db_;
		initControllers();
		})
	})



var injector = {};
var robotExample, robotDok, roundCntr, accountCntr, ROBOTS,API;  //determine pointer to controllers
function initControllers()
	{
	robotExample = injector['robotExample'] = require('./server/RobotExampleCntr.js')(db,injector,emit); //emit - functions to send current round
	robotDok = injector['robotDok'] = require('./server/RobotDokCntr.js')(db,injector,emit); //emit - functions to send current round
	roundCntr = injector['roundCntr'] = require('./server/RoundCntr.js')(db,injector,emit);
	accountCntr = injector['accountCntr'] = function(){return require('./server/AccountCntr.js')(db,injector,config,jwt)};

	ROBOTS = injector['ROBOTS'] = [];
	ROBOTS.push(robotExample); //push pointer to robot, to calculate diferent stat over all robots;
	ROBOTS.push(robotDok);

	API = function (){return require('./server/ApiCntr.js')(db,roundCntr,ROBOTS)};


	for (var each in injector)
		{
		if (typeof injector[each]['inject']=='function')
			injector[each].inject();
		}
	}


//server static files
app.use('/views',express.static(__dirname+'/app/views/'));
app.use('/fonts',express.static(__dirname+'/app/fonts/'));
app.use('/dist',express.static(__dirname+'/dist'));

//decode user for AUTH
app.use('/',function(req,resp,next)
	{
	accountCntr().getUser(req,next)
	});


//for index html - admin theme
app.get('/',function(req,resp)
	{
	fs.readFile('./index.html','utf-8',function(err,res)
		{
		resp.send(res);
		})

	})


app.post('/api/login',function(req,resp,next)
	{
	accountCntr().login(req.body,function(err,res)
		{
		if (err)
			{
			err.message_ = "Problem to login user!";
			next(err);
			return false;
			}
		resp.send(res);
		})

	})


//for robot downloaded pages
app.get('/pages/:robotName/:fileName',function(req,resp)
	{
	//check for AUTH
	if (!req.USER)
		{
		setTimeout(function(){resp.send({'data':'','Error':'User is not Authenticated!'})},0);
		return false;
		}
	var errMess = 'Wrong Path, should be /pages/ExampleRobot/filename.html';
	var fileName = req.params.fileName.split('.');
	var robotName = req.params['robotName'];

	if (fileName.length==1||!fileName)
		{
		resp.send(errMess);
		return false;
		}

	if (robotName.indexOf('/')!=-1
		||robotName.indexOf('\\')!=-1
		||fileName.indexOf('/')!=-1
        ||fileName.indexOf('/')!=-1)
		{
		resp.send(errMess);
		return false;
		}

	fileName = fileName[0];
	fs.readFile('./'+robotName+'/'+fileName,'utf-8',function(err,res)
		{
		if (err)
			resp.send(err);
		else
			resp.send(res);
		})
	})

//run robot
app.get('/robot/start',function(req,resp,next)
	{
	//check for AUTH
	if (!req.USER||req.USER.role!='admin')
        {
		setTimeout(function(){resp.send({'data':'','Error':'User is not Authenticated!'})},0);
		return false;
        }


        roundCntr.startRound(); //to set flag to allow runRound
	roundCntr.runRound();
	resp.send({'data':'Robots have been scheduled for start!'});
	setTimeout(emit,2000);
	})


//for stop running next round
app.get('/robot/stop',function(req,resp)
	{
	//check for AUTH
	if (!req.USER||req.USER.role!='admin')
        {
		setTimeout(function(){resp.send({'data':'','Error':'User is not Authenticated!'})},0);
		return false;
        }

	roundCntr.stopRound();
	resp.send({'data':'Robot will have stopped till this round finished!'});
	})



//API
//for current round status
app.post('/api/round/current',function(req,resp,next)
	{
	//check for AUTH
	if (!req.USER)
        {
		setTimeout(function(){resp.send({'data':'','Error':'User is not Authenticated!'})},0);
		return false;
        }

	API().roundCurrent(function(err,res)
		{
		if (err)
			{
			err.message = "Error from server when get statistic for current round!";
			setTimeout(function(){next(err)},0);
			return false;
			}
            resp.send({'data':res,'Error':''});
		})
	})



//for get docs from collections by some field value
app.post('/api/:collection/:field/:value',function(req,resp,next)
	{
	//check for AUTH
	if (!req.USER)
        {
		setTimeout(function(){resp.send({'data':'','Error':'User is not Authenticated!'})},0);
		return false;
        }


	var params = _.assignIn({},req.params,req.body);

    API().simpleFromCollection(params, function(err,res)
    	{
        if (err)
        	{
            err.message_ = "Error from server when get statistic for collection!";
            setTimeout(function(){next(err)},0);
            return false;
        	}
        resp.send({'data':res,'Error':''});
    	})
	})



//for get docs from collections also by roundId
app.post('/api/:collection/:mongoId',function(req,resp,next)
	{
	//check for AUTH
	if (!req.USER)
        {
		setTimeout(function(){resp.send({'data':'','Error':'User is not Authenticated!'})},0);
		return false;
        }

	var params = _.assignIn({},req.params,req.body);
	API().simpleFromCollection(params, function(err,res)
    //API().simpleFromCollection(params, function(err,res)
    	{
        if (err)
        	{
            err.message_ = "Error from server when get statistic for collection!";
            setTimeout(function(){next(err)},0);
            return false;
        	}
        resp.send({'data':res,'Error':''});
    	})
	})



app.get('/socket/users',function(req,resp)
	{
	resp.send({'data':{'totalSessions':totalSessions},'Error':''})
	})



/////////////WEB ERROR///////////////////
app.use(handleWebError);
////////////////////////////////////////



//ERRORS HANDLERS
//WEB
//original error is saved in apiError logs
//err.message_ is sent to front within data object
function handleWebError(err,req,res,next)
	{
	var data = {};
	apiErrors.error(err);
	data['Error'] = err.message_;
	data['Error'] = data['Error']||"Internal server error!";
	res.send(data);
	}


//SOCKET HANDLERS
//for auth
/*
io.use(function(socket, next){
    if (socket.handshake.query && socket.handshake.query.token){
        jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
            if(err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
            next();
        });
    }
    next(new Error('Authentication error'));
})
*/
var totalSessions = 0;
io.on('connection',function(socket)
	{


	totalSessions++;
	socket.on('disconect',function(data){totalSessions--});
	})

function emit()
	{
	API().roundCurrent(function(err,round)
		{
		io.emit('currentRound',round);
		});
	}

server.listen(config['PORT']);
//app.listen(config.PORT,config.HOST);

