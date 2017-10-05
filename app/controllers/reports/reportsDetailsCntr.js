module.exports.$inject = ['$scope','$controller','$backend'];
module.exports = function($scope,$controller,$backend)
    {

    $controller('baseTableCntr',{'$scope':$scope});

    $scope.getData = getData;
    $scope.initFiltringOptions = initFiltringOptions;
    $scope.initSortingOptions = initSortingOptions;
    $scope.getRobotNames = getRobotNames;



    $scope.SELECTED_ROUND = {'roundId':'test'};
    $scope.SELECTED_ROBOT = {'robotName':'test'};

    $scope.$watch('selectedRoundId',watcherRoundId);

    $scope.$on('selectedRoundId',function(e,val){$scope.selectedRoundId = val});

    if ($scope.ROUNDS.data.length!=0) $scope.selectedRoundId = $scope.ROUNDS.data[0]['roundId'];

    function initSortingOptions()
        {
        //$scope.selectedRoundId = '';

        $scope.sortingOptions = [];
        $scope.sortingOptions.push({'id':'no_sorting','label':'No Sorting'});
        $scope.sortingOptions.push({'id':1,'label':'Name ASC','sorting':{'fileName':1}});
        $scope.sortingOptions.push({'id':2,'label':'Name DESC','sorting':{'fileName':-1}});

        }

    $scope.init();

    function initFiltringOptions()
        {
        $scope.filtringOptions = {'fileName':''};

        return $scope.filtringOptions;//it will be putted in PARAMS and watched for apply
        }

    function getData()
        {
        $scope.spinner = true;

        var params = {};
        var option = $scope.sortingOptions.filter(function(el){return el['id']==$scope.PARAMS['sortingFieldId']})[0];
        if (option['id']!='no_sorting')
            params['sorting'] = option['sorting'];


        params['pagination'] = {};
        params['pagination']['limit'] = $scope.PAGINATION_LIMIT;
        params['pagination']['skip'] = $scope.PAGINATION_LIMIT*($scope.PARAMS_PAGINATION['current']-1);

        params['filtring'] = $scope.PARAMS['filtring'];

        $backend.getReportsDetails(
            $scope.SELECTED_ROUND['roundId'],
            params).then(function(response)
                {
                $scope.spinner = false;
                if (response.Error) return false;

                $scope.ROBOT_DATA = response.data.docs.filter(function(el){return !el['ExampleRobot']});
                $scope.getRobotNames();
                var total = response.data.count;
                $scope.PARAMS_PAGINATION['pages'] = !(total%$scope.PAGINATION_LIMIT)?total/$scope.PAGINATION_LIMIT:(parseInt(total/$scope.PAGINATION_LIMIT)+1);

                })
        }




    function watcherRoundId(newVal,oldVal)
        {
        if (!newVal) return false;
        $scope.SELECTED_ROUND = $scope.ROUNDS.data.filter(function(el){return el['roundId']==newVal})[0];
        $scope.initParams();
        $scope.initParamsPagination();
        }


    function getRobotNames()
        {
        $scope.robotNames = [];
        for (var each in $scope.ROBOT_DATA[0])
            {
            if (each.toLowerCase().indexOf('robot')!=-1)
                $scope.robotNames.push(each);
            }

        }

    }