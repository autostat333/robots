//proxy rounds current stat saves to PROXIES dict
//after it is finished - save to DB results of it

//collections:
//  proxyRounds - to save results of each url and its results
//    contains docs, where object  is the object from proxyList
//            {
//            ip:'',
//            filename:'', //for save response
//            id:'' //or some another params which maybe used for inserts to DB
//            status: '' //status of execution request (maybe false - not started, { with robots results like time,url  etc} or errorId)
//            roundId:'' //current round of proxy
//            roundId: '' //id of main round within which requests ocured
//            startTime: '' //start time of every request within robot.next
//            endTime: '' //the same
//            duration:''  //time ocnsumption of every request
//            }

//  proxyList - list of proxy
module.exports = function ProxyCntr(db,injector)
    {
    var roundCntr;
    function inject()
        {
        roundCntr = injector['roundCntr'];
        }


    var $scope = {};


    var async = require('async');
    var request = require('request');
    var config = require('../config.js');

    $scope.inject = inject;
    $scope.setProxy = setProxy;
    $scope.saveResults = saveResults;
    $scope.createProxyRound = createProxyRound;
    $scope.isProxyRoundFinished = isProxyRoundFinished;
    $scope.restart = restart;
    $scope.transformProxies = transformProxies;
    $scope.testProxyConnection = testProxyConnection;


    $scope.restart(); //set start state;



    return $scope;



    function setProxy(callback)
        {
        try
            {
            async.series([
                $scope.saveResults,
                $scope.createProxyRound
                ],function(err,res)
                {
                try
                    {
                    if (err) throw err;
                    setTimeout(callback,0);
                    }
                catch(err){err.message+='; Error when callback in async series of proxy';callback(err)}
                })
            }

        catch(err){err.message+="; Error when set proxy!";callback(err)};

        }


    function createProxyRound(callback)
        {
        try
            {
            //within isProxyRoundFinished - new proxy setted in currentProxy
            if (!isProxyRoundFinished())
                {
                $scope.testProxyConnection(function(err,res)
                    {
                    if (err)
                        {
                        $scope.currentProxy.status = 'timeout';
                        setTimeout(function(){createProxyRound(callback)},0);
                        return false;
                        }
                    else
                        callback();
                    })

                return false;
                }
            else //create NEW ROUND
                {
                db.collection('proxyList').find().toArray(function(err,res)
                    {
                    try
                        {
                        if (err) throw err;
                        $scope.transformProxies(res);
                        $scope.currentProxy = $scope.PROXIES[0];
                        $scope.currentProxy.startTime = (new Date()).getTime();

                        $scope.testProxyConnection(function(err,res)
                            {
                            if (err)
                                {
                                $scope.currentProxy.status = 'timeout';
                                setTimeout(function(){createProxyRound(callback)},0);
                                return false;
                                }
                            else
                                setTimeout(callback,0);
                            })


                        }
                    catch(err){err.message+="; Error when obtain list of proxies";callback(err)}
                    })
                }

            }
        catch(err){err.message+="; Error in createRoundProxy";callback(err)}
        }


    function transformProxies(proxies)
        {
        $scope.PROXIES = [];
        $scope.currentRoundId = (new Date()).getTime();
        $scope.PROXIES = proxies.map(function(proxy)
            {
            proxy.status = false; //contains dict with robots to save result each of them
            proxy.proxyRoundId = $scope.currentRoundId;
            proxy.roundId = roundCntr.round['roundId'];
            proxy.startTime = '';
            proxy.endTime = ''; //within robot.next will be calculated
            proxy.duration = ''; //duration of every request for every robot
            return proxy;
            })

        }



    function testProxyConnection(callback)
        {
         try
            {
            var params = {};
            params['url'] = 'http://httpbin.org/get';
            params['proxy'] = $scope.currentProxy['ip'];
            params['timeout'] = config['REQUEST_TIMEOUT'];
            async.retry({'times':config.ATTEMPTS},function(callback)
                {
                request(params,callback);
                },callback);
            }
        catch(err){err.message+='; Error when start request to check test connection to proxy!',callback(err);}

        }


    //save results of proxy to DB (proxyRounds)
    function saveResults(callback)
        {
        try
            {
            if (!$scope.currentProxy)
                {
                setTimeout(callback);
                return false;
                }

            $scope.currentProxy['endTime'] = a = (new Date()).getTime();
            $scope.currentProxy['duration'] = a - $scope.currentProxy['startTime'];
            delete $scope.currentProxy['_id']; //because it contains id from proxyList, and error raised
            db.collection('proxyRounds').insertOne($scope.currentProxy,function(err,res)
                {
                try
                    {
                    if (err) throw err;
                    setTimeout(callback,0);
                    }
                catch(err){err.message+='; Error in calback when save proxy results';callback(err)}
                })

            }
        catch(err){err.message+="; Error when save results to DB in ProxyCntr";callbac(err)}
        }



    function isProxyRoundFinished()
        {
        if (!$scope.PROXIES.length)
            return true;

        for (var i=0;proxy=$scope.PROXIES[i++];)
            {
            if (!proxy['status'])
                {
                $scope.currentProxy = proxy;
                $scope.currentProxy.startTime = (new Date()).getTime();
                return false;
                }
            }
        $scope.currentProxy = '';
        return true; //finished. All proxies have their statuses
        }


    function restart()
        {
        $scope.PROXIES = [];
        $scope.currentProxy = '';
        }

    }