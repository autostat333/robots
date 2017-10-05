module.exports.$inject = ['$q','$http','$mdDialog'];
module.exports = function backendService($q,$http,$mdDialog)
    {

    function errorHandle(mess,err)
        {
        var mess_text = err&&err.message?(mess+' ( '+err.message+' )'):mess;
        return $mdDialog.show(
            $mdDialog
                    .alert()
                .multiple(true)
                .title('Error')
                .clickOutsideToClose(true)
                .textContent(mess_text)
                .ok('OK')
            )

        }


    this.getAllRounds = function()
        {
        var defer = $q.defer();
        $http.post('/api/rounds/all',{}).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle('Something bad when run /api/rounds/all',{'message':response.Error}).then(function()
                    {
                    defer.resolve(response);
                    });
                return false;
                }

            defer.resolve(response);
            },function(err)
                {
                errorHandle('Something bad has hapened when run /api/rounds/all',err)
                    .then(function(){defer.resolve({'Error':err});});
                })
        return defer.promise;
        }


    this.getCurrentRound = function()
        {
        var defer = $q.defer();
        $http.post('/api/round/current',{}).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle('Something bad when get CURRENT ROUND data',{'message':response.Error}).then(function()
                    {
                    defer.resolve(response);
                    });
                return false;
                }

            defer.resolve(response);
            },function(err)
                {
                errorHandle('Something bad has hapened when run /api/round/current',err)
                    .then(function(){defer.resolve({'Error':err});});
                })
        return defer.promise;
        }



    this.getRobotUrls = function(robotName,params)
        {
        var defer = $q.defer();
        $http.post('/api/'+robotName+'/all',params).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle('Something bad when get data for '+robotName+'',{'message':response.Error}).then(function()
                    {
                    defer.resolve(response);
                    });
                return false;
                }

            defer.resolve(response);
            },function(err)
                {
                errorHandle('Something bad has hapened when run /api/round/current',err)
                    .then(function(){defer.resolve({'Error':err});});
                })
        return defer.promise;
        }


    this.getParsedUrls = function(robotName,roundId,params)
        {
        var defer = $q.defer();
        $http.post('/api/'+robotName+'/roundId/'+roundId,params).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle('Something bad when send request for parsedUrls',{'message':response.Error}).then(function()
                    {
                    defer.resolve(response);
                    });
                return false;
                }
            defer.resolve(response);

            },function(err)
                {
                errorHandle('Something bad when try to reach server when get parsed Urls',err).then(function()
                    {
                    defer.resolve({'Error':err});
                    });
                })
        return defer.promise;
        }

    this.startRobot = function(robotName,params)
        {
        var defer = $q.defer();
        $http.get('/robot/start').then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle('Something bad when trying to start Robot System',{'message':response.Error}).then(function()
                    {
                    defer.resolve(response);
                    });
                return false;
                }
            defer.resolve(response);
            },function(err)
            {
            errorHandle('Something bad has hapened when run /robot/start',err)
                .then(function(){defer.resolve({'Error':err});});
            })
        return defer.promise;
        }

    this.stopRobot = function(robotName,params)
        {
        var defer = $q.defer();
        $http.get('/robot/stop').then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle('Something bad when trying to stop Robot System',{'message':response.Error}).then(function()
                    {
                    defer.resolve(response);
                    });
                return false;
                }
            defer.resolve(response);
            },function(err)
            {
            errorHandle('Something bad has hapened when run /robot/stop',err)
                .then(function(){defer.resolve({'Error':err});});
            })
        return defer.promise;
        }



    this.getErrors = function(roundId,params)
        {
        var defer = $q.defer();

        $http.post('/api/errors/roundId/'+roundId,params).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle(response.Error).then(function()
                    {
                    defer.resolve(response);
                    return false;
                    });
                }
            defer.resolve(response);
            },function(err)
            {
            errorHandle('Something bad happened when send request to backend for errors',err).then(function()
                {
                defer.resolve({'Error':err});
                });
            })

        return defer.promise;
        }


    this.getReportsDetails = function(roundId,params)
        {
        var defer = $q.defer();

        $http.post('/api/report/roundId/'+roundId,params).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle(response.Error).then(function()
                    {
                    defer.resolve(response);
                    return false;
                    });
                }
            defer.resolve(response);
            },function(err)
                {
                errorHandle('Something bad happened when send request to backend for report details data',err).then(function()
                    {
                    defer.resolve({'Error':err});
                    });
                })

        return defer.promise;
        }


    this.login = function(params)
        {
        var defer = $q.defer();

        $http.post('/api/login',params).then(function(response)
            {
            response = response.data;
            if (response.Error)
                {
                errorHandle(response.Error).then(function()
                    {
                    defer.resolve(response);
                    return false;
                    });
                }
            defer.resolve(response);
            },function(err)
                {
                errorHandle('Something bad happened when send request to backend when login',err).then(function()
                    {
                    defer.resolve({'Error':err});
                    });
                })

        return defer.promise;
        }




    }