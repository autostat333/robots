module.exports = function RoundCntr(db,injector,emit)
    {

    var ROBOTS;
    function inject()
        {
        ROBOTS = injector['ROBOTS'];
        }


    var config = require('../config.js');
    var logger = require('logger').createLogger('Errors.log');
    var async = require('async');





    var $scope = {};
    $scope.inject = inject;
    $scope.runRound = runRound; //create new round stat and save all data to DB
    $scope.stopRound = stopRound; //set stopped flag to interrupt round cycles
    $scope.startRound = startRound; //set flag to begin rounds
    $scope.finishRound = finishRound; //save data to DB and create empty round
    $scope.createRound = createRound; //create empty round object
    $scope.runIterations = runIterations; //iterations over all robots cntrollers
    $scope.handleError = handleError; //handle error in
    $scope.robotsIsFinished = robotsIsFinished;
    $scope.robotsIsStopped = robotsIsStopped;

    createRound(); //to remain stat about current round (next save to DB)
    $scope.stopRunningRound = true;

    return $scope;


    //contain decription of round object
    function createRound()
        {
        $scope.round = r = {};
        r['roundId'] = (new Date()).getTime();
        r['startTime'] = ''; //because start time should be setted after first iteration
        r['endTime'] = '';
        r['duration'] = '';
        r['ROBOTS'] = {}; //for collecting and save to DB stat for ROBOTS
        r['errors'] = []; //for collecting errors in rounds
        r['status'] = 'Waiting For Start ROBOT';
        r['willStart'] = '';
        //possible
        // "Waiting for Start ROBOT"
        // "Waiting For Start Round",
        // "Waiting For Iteration",
        // "Iteration",
        // "Stopped",
        // "Error"
        // "Finished"

        }

    //cals from robot/start to set flag for running robot
    function startRound()
        {
        $scope.stopRunningRound = false;
        }

    //cals from robot/stop to set flag for break robot
    function stopRound()
        {
        $scope.stopRunningRound = true;
        }

    function runRound()
        {

        //finish round if mainRound is not empty and round does not have status "Waiting for Start Round"
        if ($scope.round['status']!='Waiting For Start ROBOT')
            {
            $scope.finishRound(function(err)
                {
                try
                    {
                    if (err) throw err;
                    $scope.createRound();
                    if (!$scope.stopRunningRound)
                        {
                        $scope.round['status'] = 'Waiting For Start Round';
                        //set future start time, with the first iteration will be setted real startTime
                        $scope.round['willStart'] = (new Date())*1+config.ROUND_INTERVAL;
                        setTimeout($scope.runIterations,config.ROUND_INTERVAL)
                        }
                    else
                        $scope.round['status'] = 'Waiting For Start ROBOT';
                    emit(); //send current round by websocket
                    }
                catch(err)
                    {
                    err.message+='; Error in finishRound function!';
                    $scope.handleError(err);
                    $scope.round = {};
                    }
                });
            }
        else //it is only when robot start after Waiting For ROBOT (after robot stopped or app restarted)
            {
            $scope.createRound();
            $scope.round['status'] = 'Waiting For Start Round';
            //set future start time, with the first iteration will be setted real startTime
            $scope.round['willStart'] = (new Date())*1+config.ROUND_INTERVAL;
            setTimeout($scope.runIterations,config.ROUND_INTERVAL);
            emit(); //send current round by websocket
            }

        }

    //save round results to DB and restart all robots
    function finishRound(callback)
        {
        try
            {
            $scope.round['endTime'] = (new Date()).getTime();
            $scope.round['duration'] = -$scope.round['startTime'] + $scope.round['endTime'];


            //restart all robots and gather statistic
            //set to round['ROBOTS'][RobotName] = some statistic
            var robot;
            for (var i=0;robot = ROBOTS[i++];)
                {
                $scope.round['ROBOTS'][robot['robotName']] = robot.getStat();
                robot.restart();
                }

            //save round to database rounds collection
            db.collection('rounds').insertOne($scope.round,callback);

            }
        catch(err){err.message+="; Error in finishRound!";callback(err)}
        }

    //this callback recursively iterates in a some interval
    function runIterations()
        {
        //set real start time of robot
        if (!$scope.round['startTime']) $scope.round['startTime'] = (new Date())*1;

        $scope.round['status'] = 'Iteration';

        emit(); //send current round by websocket

        async.series([
            ROBOTS[0].next,   //run the first robot (Example)
            ROBOTS[1].next   //run the first robot (DocRobot)
            ],
            function(err,res)
                {
                try
                    {
                    //if error comes from async - error in robot
                    if (err) throw err;

                    //if every robot has status stopped - do not run iteration
                    //to stop round - necc stop every robot
                    //robotIsFinished & robotIsStopped necc to set the right status of round
                    //if enforce interruption of round (stop every robot) - status is 'stopped'
                    //if robots are finished - status Finished;
                    if ($scope.robotsIsFinished())
                        {
                        $scope.round['status'] = 'Finished';
                        setTimeout($scope.runRound,0);
                        }
                    else if (!$scope.robotsIsStopped())
                        {
                        $scope.round['status'] = 'Waiting For Iteration';
                        setTimeout($scope.runIterations,config.REQUESTS_INTERVAL);
                        }

                    else
                        {
                        $scope.round['status'] = 'Stopped';
                        setTimeout($scope.runRound,0);
                        }

                    emit(); //send current round by websocket
                    }
                catch(err)
                    {
                    err.message+='; Error during runIteration (maybe in callback for async or in series)';
                    $scope.round['status'] = 'Error';
                    //save error and restart round
                    $scope.handleError(err,$scope.runRound);
                    emit(); //send current round by websocket
                    };
                })

        }

    //if every robot is stopped - main round will be stopped
    //if only one robot stopped - the rest will continue
    function robotsIsStopped()
        {
        for (var each in ROBOTS)
            {
            if (ROBOTS[each]['status']!='Stopped')
                return false;
            return true;
            }
        }


//if every robot is stopped - main round will be stopped
//if only one robot stopped - the rest will continue
    function robotsIsFinished()
        {
        for (var each in ROBOTS)
            {
            if (ROBOTS[each]['status']!='Finished')
                return false;
            return true;
            }
        }


    //send error to errors collection and log it
    //callback is used to wait till error will be writed to DB
    //because the ID of new doc must be pushed to round.error statistic
    function handleError(err,callback)
        {
        logger.error(err); //to save more data (e.g. ts)
        var d = {};
        d['Error'] = err.toString();
        d['roundId'] = $scope.round.roundId;
        d['robotName'] = err.robotName;
        d['created'] = err.created;
        d['fileName'] = err.fileName;
        d['timestamp'] = (new Date()).getTime();
        db.collection('errors').insertOne(d,function(err,res)
            {
            $scope.round['errors'].push(res['_id']);
            setTimeout(callback,0);//to save id of error to current round and than save round to db with errorId
            });
        }



    }
