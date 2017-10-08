module.exports = function robotsBaseUrlsCntr($scope,$backend,$controller)
    {

    $controller('baseTableCntr',{'$scope':$scope});

    $scope.initSortingOptions = initSortingOptions;
    $scope.initFiltringOptions = initFiltringOptions;
    $scope.getData = getData;

    $scope.init();

    //for dropping filterss
    function initFiltringOptions()
        {
        return $scope.filtringOptions = {'name':''};
        }

    function initSortingOptions()
        {
        $scope.sortingOptions = [];
        $scope.sortingOptions.push({'id':'no_sorting','label':'No Sorting'});
        $scope.sortingOptions.push({'id':1,'label':'Name ASC','sorting':{'name':1}});
        $scope.sortingOptions.push({'id':2,'label':'Name DESC','sorting':{'name':-1}});
        }

    function getData()
        {
        $scope.spinner = true;
        //some preparations of PARAMS before sending the reuest
        var id;
        if ((id=$scope.PARAMS['sortingFieldId'])!='no_sorting')
            {
            var option = $scope.sortingOptions.filter(function(el){return el['id']==id;})[0];
            $scope.PARAMS['sorting'] = option['sorting'];
            }
        else
            $scope.PARAMS['sorting'] = {};


        var dataToSend = $.extend(true,{},$scope.PARAMS);

        var p;
        dataToSend['pagination'] = p = {};
        p['skip'] = $scope.PAGINATION_LIMIT*($scope.PARAMS_PAGINATION['current']-1);
        p['limit'] = $scope.PAGINATION_LIMIT;


        $backend.getRobotUrls($scope.SELECTED_ROBOT['robotName']+'Urls',dataToSend).then(function(response)
            {
            $scope.spinner = false;
            if (response.Error)
                return false;



            $scope.ROBOT_URLS = response.data.docs;
            var total = response.data.count;
            $scope.PARAMS_PAGINATION['pages'] = !(total%$scope.PAGINATION_LIMIT)?total/$scope.PAGINATION_LIMIT:(parseInt(total/$scope.PAGINATION_LIMIT)+1);

            });


        }

    }

module.exports.$inject = ['$scope','$backend','$controller'];

