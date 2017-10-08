module.exports = function($scope,$controller)
    {

    $controller('baseTableCntr',{'$scope':$scope});

    $scope.getData = getData;
    $scope.initFiltringOptions = initFiltringOptions;
    $scope.initSortingOptions = initSortingOptions;
    $scope.transformOneDoc = transformOneDoc;
    $scope.transformAndFiltring = transformAndFiltring;

    $scope.init();



    function initSortingOptions()
        {
        $scope.sortingOptions = [];
        $scope.sortingOptions.push({'id':'no_sorting','label':'No Sorting'});
        $scope.sortingOptions.push({'id':1,'label':'Name ASC','sorting':{'fileName':1}});
        $scope.sortingOptions.push({'id':2,'label':'Name DESC','sorting':{'fileName':-1}});

        $scope.sortingOptions.push({'id':3,'label':'IP ASC','sorting':{'ip':1}});
        $scope.sortingOptions.push({'id':4,'label':'IP DESC','sorting':{'ip':-1}});

        $scope.sortingOptions.push({'id':5,'label':'StartTime ASC','sorting':{'startTime':1}});
        $scope.sortingOptions.push({'id':6,'label':'StartTime DESC','sorting':{'startTime':-1}});

        }


    function initFiltringOptions()
        {
        $scope.filtringOptions = {'fileName':'','ip':'','_and':{'from':'','to':''},'error':false};

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

        params['filtring'] = $scope.transformAndFiltring(angular.copy($scope.filtringOptions));

        //convert _and to $and, _lt,_gt to $lt,$gt
        //because angular.equals do not compare keys with $
        if (params['filtring']['_and'])
            {
            params['filtring']['$and'] = params['filtring']['_and'];
            }

            delete params['filtring']['_and'];

            //set $exists for errors
            if (params['filtring']['error'])
                params['filtring']['error'] = {'$exists':true};


            $backend.getParsedUrls(
                $scope.SELECTED_ROBOT['robotName'],
                $scope.SELECTED_ROUND['roundId'],
                params).then(function(response)
            {
                $scope.spinner = false;
                if (response.Error) return false;

                $scope.ROBOT_URLS = response.data.docs;
                var total = response.data.count;
                $scope.PARAMS_PAGINATION['pages'] = !(total%$scope.PAGINATION_LIMIT)?total/$scope.PAGINATION_LIMIT:(parseInt(total/$scope.PAGINATION_LIMIT)+1);

            })
        }


    function transformOneDoc(doc)
        {
        doc['startTime'] = doc['startTime']*1;
        doc['endTime'] = doc['startTime']*1;
        doc['duration'] = doc['duration']*1;
        return doc;
        }


    function transformAndFiltring(params)
        {
        function roundToEndDay(ts)
            {
            return ts+24*60*60*1000; //plus one full day for ToTime
            }

        var and = [];
        if (params['_and']['from'])
            and.push({'startTime':{'$gt':params['_and']['from']*1}})

        if (params['_and']['to'])
            and.push({'startTime':{'$lt':roundToEndDay(params['_and']['to']*1)}})

        if (and.length!=0)
            params['$and'] = and;

        delete params['_and'];
        return params;
        }


    }
module.exports.$inject = ['$scope','$controller'];

