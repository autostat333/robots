module.exports = function baseTableCntr($scope,$backend)
    {

    $scope.init = init;
    $scope.initParams = initParams;
    $scope.initParamsPagination = initParamsPagination;
    $scope.isParamsChanged = isParamsChanged;
    $scope.applyParams = applyParams;


    //customizable from controller
    $scope.initSortingOptions = initSortingOptions;
    $scope.initFiltringOptions = initFiltringOptions;
    $scope.getData = getData;



    $scope.PAGINATION_LIMIT = 10;
    $scope.$watch('PARAMS_PAGINATION',watcherPagination,true);

    $scope.$watchGroup(['SELECTED_ROBOT["robotName"]','SELECTED_ROUND["roundId"]'],watcherRobotChange);
    //below watcher - is main watcher to refresh data after ROBOT || ROUND change

    $scope.$on('roundsRefreshed',function(){$scope.getData()});

    //$scope.init();

    function getData(){angular.noop();}
    function initSortingOptions(){$scope.sortingOptions = {};}
    function initFiltringOptions(){return $scope.filtringOptions = {};}

    function init()
        {
        $scope.initParams();
        $scope.initParamsPagination();
        $scope.initSortingOptions();
        }


    function initParams()
        {
        $scope.PARAMS = {}; //create new dict to enforce dirty digest
        $scope.PARAMS['filtring'] = $scope.initFiltringOptions();

        //it is for sorting select field
        //it is converted to sorting param within watcher
        $scope.PARAMS['sortingFieldId'] = 'no_sorting';//it means no sorting, in watcher '' will be transformed to sorting:{};
        $scope.PARAMS['sorting'] = {};
        //create origin PARAMS to track changes for showing button
        $scope.PARAMS_ORG = $.extend(true,{},$scope.PARAMS);

        }


    function initParamsPagination()
        {
        var pagination =  {};
        pagination['current'] = 1;
        pagination['limit'] = $scope.PAGINATION_LIMIT; //this param is sended to DB
        pagination['skip'] = $scope.PAGINATION_LIMIT*(pagination['current']-1); //this param is sended to DB
        pagination['pages'] = 0;
        $scope.PARAMS_PAGINATION = pagination;
        $scope.PARAMS_PAGINATION['lastInit'] = (new Date())*1; //to enforce watcherPagination

        }

    function applyParams()
        {
        $scope.getData();
        $scope.PARAMS_ORG = $.extend(true,{},$scope.PARAMS);
        }


    function isParamsChanged()
        {
        return !angular.equals($scope.PARAMS,$scope.PARAMS_ORG);
        }


    function watcherRobotChange(newVal,oldVal)
        {
        if (!newVal[0]||!newVal[1]) return false;
        $scope.initParams();
        $scope.initParamsPagination();
        }



    function watcherPagination(newVal,oldVal)
        {
        if (!$scope.SELECTED_ROUND||!$scope.SELECTED_ROBOT) return false;
        if (newVal['lastInit']!=oldVal['lastInit']||newVal['current']!=oldVal['current'])
            $scope.getData();
        }

    }
module.exports.$inject = ['$scope','$backend'];

