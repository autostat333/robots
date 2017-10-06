module.exports = function reportsCntr($scope,$backend,$q,$filter,$log,$mdDialog,$rootScope)
    {
    $scope.init = init;
    $scope.startRobot = startRobot;
    $scope.stopRobot = stopRobot;
    $scope.selectRobot = selectRobot;
    $scope.setSelectedRoundId = setSelectedRoundId; //necc only once to set cur roundId


    $scope.$watch('selectedRoundId',watcherRoundId);
    $scope.$on('selectedRoundId',$scope.setSelectedRoundId);


    $scope.USER = $rootScope.USER;

    $scope.init();

    function init()
        {

        //$scope.selectedRound = $scope.ROUNDS[0];
        $scope.SELECTED_ROUND = '';
        $scope.SELECTED_ROBOT = {};

        $scope.selectedRoundId ='';//will be determined when event broadcasted
        }


    function setSelectedRoundId(e,val)
        {
        $scope.selectedRoundId = val;
        }


    function selectRobot(robot)
        {
        robot = robot||$scope.SELECTED_ROUND['ROBOTS'][Object.keys($scope.SELECTED_ROUND['ROBOTS'])[0]];
        $scope.SELECTED_ROBOT = robot;
        }



    function startRobot()
        {
        $backend.startRobot().then(function(response)
            {
            if (response.data)
                {
                $mdDialog.show($mdDialog
                    .alert()
                    .title(response.data)
                    .ok('OK'))
                }

            })
        }



    function stopRobot()
        {
        $backend.stopRobot().then(function(response)
            {
            if (response.data)
                {
                $mdDialog.show($mdDialog
                    .alert()
                    .title(response.data)
                    .ok('OK'))
                }
            })
        }



    function watcherRoundId(newVal,oldVal)
        {
        if (!newVal)
            {
            $scope.SELECTED_ROUND = {};
            return false;
            }
        $scope.SELECTED_ROUND = $scope.ROUNDS.data.filter(function(el){return el['roundId']==newVal})[0];
        //set SELECTED_ROBOT to get info for tabs below
        $scope.selectRobot();

        }




    }
module.exports.$inject = ['$scope','$backend','$q','$filter','$log','$mdDialog','$rootScope'];

