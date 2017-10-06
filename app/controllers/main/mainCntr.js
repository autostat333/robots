module.exports = function mainCntr($scope,$interval,$timeout,$filter,$backend,$q,socketIo,$rootScope,$cookies)
    {

    $scope.init = init;
    $scope.refreshTime = refreshTime;
    $scope.openMenu = openMenu;
    $scope.sendAjax = sendAjax;
    $scope.transformRound = transformRound;
    $scope.getAllRounds = getAllRounds;
    $scope.getCurrentRound = getCurrentRound;
    $scope.sortRounds = sortRounds;
    $scope.broadcastRoundId = broadcastRoundId;
    $scope.startSocket = startSocket;
    $scope.logOut = logOut;

    $scope.init();


    function init()
        {
        //to make possible share rounds data between reports and round sections
        //and also to make possible change data from socket.io
        $scope.ROUNDS = {'data':''};
        $scope.currentRound = {}; //create obj for current round to update it


        $interval($scope.refreshTime,10000);
        $scope.CURRENT_TIME = {};
        $scope.refreshTime();


        $scope.sendAjax();
        $scope.startSocket();

        }


    function startSocket()
        {
        socketIo.start();
        $scope.socket = socketIo.getSocket();
        $scope.socket.on('currentRound',function(newRound)
            {
            var round = $scope.ROUNDS.data[0]//filter(function(el){return el['roundId']==newRound['roundId']})[0];
            $scope.transformRound(newRound);
            $.extend(round,newRound);
            $rootScope.$broadcast('roundsRefreshed');
            });
        }



    function sendAjax()
        {
        $scope.spinner = 'global';

        $q.all([
            $scope.getAllRounds(),
            $scope.getCurrentRound()
            ]).then(function()
                {
                $scope.spinner = false;

                if (!$scope.ROUNDS) return false;
                $scope.ROUNDS.data.unshift($scope.currentRound);
                $scope.broadcastRoundId();
                })

        }



    function broadcastRoundId()
        {
        $scope.spinner = 'global';
        $timeout(function()
            {
            $scope.$broadcast('selectedRoundId',$scope.currentRound['roundId'])
            $scope.spinner = false;
            },0);
        }


    function getAllRounds()
        {
        return $backend.getAllRounds().then(function(response)
            {
            if (response.Error) return false;
            $scope.ROUNDS.data = response.data.docs.map($scope.transformRound);
            $scope.sortRounds();
            })
        }



        //function-callback for filter method
    function transformRound(round)
        {
        var dt = new Date(round.startTime);
        var dtFuture = new Date(round.willStart);
        if (dt!='Invalid Date')
            round.dateStr = $filter('date')(dt,'d MMMM yyyy,  HH:mm');
        else
            round.dateStr = '-';

        if (dtFuture!='Invalid Date')
            round.futureDateStr = $filter('date')(dtFuture,'d MMMM yyyy,  HH:mm');
        else
            round.futureDate = '-';

        //iterate over robots
        for (var each in round.ROBOTS)
            {
            var robot = round.ROBOTS[each];
            robot['percentage'] = robot.finishedUrls/robot.totalUrls;
            robot['percentage'] =isNaN(robot['percentage'])?0:parseInt(robot['percentage']*100);
            }
        return round;
        }


    function getCurrentRound()
        {
        return $backend.getCurrentRound().then(function(response)
            {
            if (response.Error) return false;
            $scope.currentRound = $scope.transformRound(response.data);
            if ($scope.currentRound['dateStr']!='-')
                $scope.currentRound['dateStr']+=' CURRENT';
            else
                $scope.currentRound['dateStr']='CURRENT (ROBOT NOT STARTED)';
            })
        }




    function sortRounds()
        {
        $scope.ROUNDS.data.sort(function(a,b)
            {
            a = a['startTime']||0;
            b = b['startTime']||0;
            return a>b?-1:(a<b?1:0);
            })

        }


    function logOut()
        {
        window.localStorage.removeItem('token');
        $cookies.remove('Authentication');
        window.location.reload();
        }



    function refreshTime()
        {
        var time = new Date();
        time = $filter('date')(time,'HH:mm!EEE!dd, MMM').split('!');
        $scope.CURRENT_TIME['time'] = time[0];
        $scope.CURRENT_TIME['weekDay'] = time[1];
        $scope.CURRENT_TIME['date'] = time[2];
        }


    function openMenu($mdMenu,e)
        {
        $mdMenu.open();
        }


    }

module.exports.$inject = ['$scope','$interval','$timeout','$filter','$backend','$q','socketIo','$rootScope','$cookies'];

