//this is basic example of robot controller
//to create new robot you should create special ExampleRobotUrls collection
//also add robot to roundCntr next async series
//also add controller require to server.js
//also add special folder for views
//also create folder for parsed htmls

module.exports = function RobotExampleCntr(db,injector,emit)
    {
    var proxyCntr,roundCntr;
    function inject()
        {
        proxyCntr = injector['proxyCntr'];
        roundCntr = injector['roundCntr'];
        }

    var fs = require('fs');
    var request = require('request');
    var async = require('async');
    var config = require('../config.js');
    var htmlParser = require('./parsers/exampleRobotParser.js');

    var $scope = {};
    $scope.inject = inject;

    $scope.robotName = 'ExampleRobot';
    $scope.status = '';

    $scope.next = next;
    $scope.getCursor = getCursor;
    $scope.nextAsyncCallback = nextAsyncCallback;
    $scope.restart = restart;
    $scope.getStat = getStat;
    $scope.setDefaultOpt = setDefaultOpt;
    $scope.writeResponse = writeResponse;
    $scope.parse = parse;
    $scope.saveToDb = saveToDb;
    $scope.saveToReport = saveToReport;
    $scope.refreshRobotStat = refreshRobotStat;
    $scope.sendRequest = sendRequest;

    $scope.setDefaultOpt();
    $scope.restart();


    return $scope;


    function setDefaultOpt()
        {
        $scope.options = {};
        $scope.options.headers = {};
        //set headers as google bot
        $scope.options.headers['User-Agent'] = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

        //path for responses (only last responses);
        $scope.options.responseDir = './'+this.robotName+'/';

        }



    //object for transmitting informtation grom callback to callback
    //and saving to the Robot results of parsing
    function createNextElement(url,fileName,proxyIp,roundId,proxyRoundId)
        {

        var d = {};
        d['url'] = url;
        d['fileName'] = fileName;
        d['startTime'] = (new Date()).getTime();
        d['ip'] = proxyCntr.currentProxy.ip
        d['roundId'] = roundCntr.round.roundId;
        d['proxyRoundId'] = proxyCntr.currentProxy.proxyRoundId;
        d['endTime'] = '';
        d['duration'] = '';

        return d;
        }

    //create document to insert in database in report collection
    function createReportForDb()
        {
         var d = {};

         d['fileName'] = $scope.nextElement.fileName;
         d[$scope.robotName] = '';
         d['roundId'] = $scope.nextElement.roundId;
         return d;
        }


    function restart()
        {
        this.startPosition = 0;
        this.status = 'Working';
        $scope.cursor = '';
        $scope.refreshRobotStat();
        }


        //get stat for UI and for savin MAIN ROUND
    function getStat()
        {
        return $scope.stat;
        }


        //yo stop the robot from UI
    function stop()
        {
        $scope.status = 'Stopped';
        $scope.cursor = '';
        }



    //this is statistic block which is saved to rounds
    function refreshRobotStat()
        {
        $scope.stat = {};
        $scope.stat.totalUrls = 0; //get from DB total count
        $scope.stat.finishedUrls = 0; //parsed urls
        $scope.stat.errors = []; //number of errors
        $scope.stat.robotName = $scope.robotName; //to pass robot name to round dict
        //$scope.stat.parsingErrors = ''; //number of parsing errors
        }



    function next(callback)
        {
        try
            {
            if ($scope.status == 'Finished' || $scope.status == 'Stopped')
                {
                setTimeout(callback, 0);
                return false;
                }

            //if no cursor - set new and get count of documents
            if (!$scope.cursor)
                {
                $scope.getCursor(callback);
                return false;
                }

            $scope.cursor.next(function (err, doc)
                {
                try
                    {
                    if (!doc)
                        {
                        $scope.status = 'Finished';
                        callback();
                        return false;
                        }

                    $scope.nextElement = createNextElement(doc['url'],doc['name']);

                    async.series([
                        $scope.sendRequest,
                        $scope.writeResponse,
                        $scope.parse
                        ],function(err,res){$scope.nextAsyncCallback(err,res,callback)})
                    }
                catch (err)
                    {
                    err.message+='; Cannot start async in robot.next()!';
                    err.created = (new Date())*1;
                    err.robotName = $scope.robotName;err.fileName = $scope.nextElement['fileName'];
                    callback(err);
                    }
                })

            } //close try-wrap for next function
        catch(err)
            {
            err.robotName = $scope.robotName;err.created = (new Date())*1;
            err.message+='; Error in robot.next() before getting count of urls!';
            callback(err)};
        }


    //get cursor for all urls of robot from RobotName collection
    //callback - main callback, which comes from roundCntr
    function getCursor(callback)
        {
        $scope.cursor = db.collection($scope.robotName + 'Urls').find();
        $scope.cursor.count(function (err, count)
            {
            try
                {
                if (err) throw err;
                $scope.stat.totalUrls = count;
                setTimeout(function (){$scope.next(callback)}, 0);
                return false;
                }
            catch (err)
                {
                err.message += "; Error when get total urls (cursor.count) for robot " + $scope.robotName+'!';
                callback(err);
                return false;
                }
            })
        }


    //callback - callback which comes from nex()
    function nextAsyncCallback(err,res,callback)
        {
        try
            {
            if (err) throw err;

            proxyCntr.currentProxy.status = proxyCntr.currentProxy.status || {};
            proxyCntr.currentProxy.status[$scope.robotName] = true;
            async.parallel([
                $scope.saveToDb,
                $scope.saveToReport
                ], function (err)
                    {
                    $scope.stat.finishedUrls++;
                    if (err)
                        {
                        err.message += '; Error when save robot results to DB, ' + $scope.robotName;
                        callback(err);
                        return false;
                        }
                    setTimeout(callback, 0);
                    emit(); //send current round by websocket
                    return false;
                    })
            }
        //this Error does not stop round, only will be saved to DB
        //because it is likely problems with one url (or parsing, or not respond etc)
        catch (err)
            {
            err.message += "; Error in nextAsyncCallback() before async parallel!";
            var d = {};
            d['Error'] = err.toString();
            d['roundId'] = $scope.nextElement.roundId;
            d['created'] = (new Date())*1;
            d['robotName'] = $scope.robotName;
            d['fileName'] = $scope.nextElement['fileName'];

            emit(); //send current round by websocket

            db.collection('errors').insert(d, function (err_, doc)
                {
                try
                    {
                    if (err_) throw err;
                    $scope.stat.errors.push(doc['ops'][0]['_id']);
                    $scope.stat.finishedUrls++;
                    proxyCntr.currentProxy.status = proxyCntr.currentProxy.status || {};
                    proxyCntr.currentProxy.status[$scope.robotName] = doc['ops'][0]['_id'];
                    $scope.nextElement.error = doc['ops'][0]['_id']; //to save error to db
                    //save nextElement to DB
                    $scope.saveToDb(callback);
                    }
                catch(err){
                    err.robotName = $scope.robotName;err.created = (new Date())*1;
                    err.message+="; Error when insert error to Errors collection (in nextAsyncCallback)";
                    callback(err)}
                })
            }
        }



    function sendRequest(callback)
        {
        try
            {
            if (!$scope.nextElement||!$scope.nextElement.ip||!$scope.nextElement.url) throw new Error('No data as nextElement!');
            var params = {};
            params['headers'] = $scope.options.headers;
            params['url'] = $scope.nextElement.url;
            //to set proxy
            params['proxy'] = $scope.nextElement['ip'];
            params['timeout'] = config['REQUEST_TIMEOUT'];

            async.retry({'times':config.ATTEMPTS},function(callback)
                {
                request.get(params,callback);
                },function(err,res){
                try
                    {
                    if (err) throw err;
                    $scope.response = res.body;
                    setTimeout(callback,0);
                    }
                catch(err)
                    {
                    err.message+='; Error obtain response from '+params['url']+', '+$scope.nextElement['ip'];
                    callback(err);
                    return false;
                    }
                });

            }
        catch(err)
            {
            err.message+='; Error when start request '+$scope.nextElement['url']+', '+$scope.nextElement['ip'];
            callback(err);
            return false;
            }
        }



    function writeResponse(callback)
        {
        try
            {
            if (!$scope.response) throw new Error('No response to save from '+$scope.nextElement['url']+' '+$scope.nextElement['ip']);

            var folder = $scope.options.responseDir+$scope.nextElement['fileName'];
            fs.writeFile(folder, $scope.response, function (err, res)
                {
                try
                    {
                    if (err) throw err;
                    setTimeout(callback,0);
                    return false;
                    }
                catch(err){err.message+='; Error write to file '+folder;callback(err);return false;}
                })
            }
        catch(err)
            {
            callback(err);
            }
        }


    //must return object with properties
    //object will be saved to DB to keep history what was parsed
    function parse(callback)
        {
        try
            {
	    var result = htmlParser($scope.response);
            if (!result) throw new Error('Null or undefined is a result of parsing!');
	    $scope.parsedResponse = {'res':result};
	    callback();
            }

        catch(err){err.message+='; Error when parsing response, '+$scope.nextElement['url'];callback(err);return false;}
        }

    //saving results of current request
    //results save to robotName collection
    //document for saving - nextElement (with errorsId)
    function saveToDb(callback)
        {
        try
            {
            var a;
            $scope.nextElement.endTime = a = (new Date()).getTime();
            $scope.nextElement.duration = a - $scope.nextElement.startTime;
            db.collection($scope.robotName).insertOne($scope.nextElement,function(err,res)
                {
                if (err)
                    {
                    err.message+="; Error in saveToDb results of robot (not to report)";
                    callback(err);
                    return false;
                    }
                setTimeout(callback,0);
                return false;
                });

            }
        catch(err){err.message+='; Error when start saving to robot results collection';callback(err);return false}

        }

    //save data to main report
    function saveToReport(callback)
        {
        try
            {
            if (!$scope.parsedResponse) throw new Error('No data to put in main price robot collection');
            db.collection('report').findOne({'roundId':$scope.nextElement['roundId'],'fileName':$scope.nextElement['fileName']},
                function(err,doc)
                    {
                    if (!doc)
                        {
                        var new_doc = createReportForDb();
                        new_doc[$scope.robotName] = $scope.parsedResponse;
                        db.collection('report').insertOne(new_doc,callback);
                        return false;
                        }
                    var r_name = $scope.robotName;
                    db.collection('report').update({'_id':doc['_id']},
                            {$set:{r_name:$scope.parsedResponse}},callback);
                    })
            }
        catch(err){err.message+='; Error when saveToReport';callback(err);return false;}
        }



    }


