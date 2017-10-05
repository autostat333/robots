module.exports.$inject = ['$scope','$controller','$backend'];
module.exports = function robotsErrorsCntr($scope,$controller,$backend)
    {

    $controller('baseTableCntr',{'$scope':$scope});

    $scope.getData = getData;
    $scope.initSortingOptions = initSortingOptions;
    $scope.initFiltringOptions = initFiltringOptions;
    $scope.transformOneDoc = transformOneDoc;
    $scope.transformAndFiltring = transformAndFiltring;

    $scope.init();


    function initSortingOptions()
        {
        $scope.sortingOptions = [];
        $scope.sortingOptions.push({'id':'no_sorting','label':'No Sorting'});

        $scope.sortingOptions.push({'id':1,'label':'Created ASC','sorting':{'created':1}});
        $scope.sortingOptions.push({'id':2,'label':'Created DESC','sorting':{'created':-1}});

        $scope.sortingOptions.push({'id':3,'label':'File Name ASC','sorting':{'fileName':1}});
        $scope.sortingOptions.push({'id':4,'label':'File Name DESC','sorting':{'fileName':-1}});

        }


    function initFiltringOptions()
        {
        $scope.filtringOptions = {'fileName':'','_and':{'from':'','to':''}};
        $scope.filtringOptions['robotName'] = $scope.SELECTED_ROBOT['robotName'];
        return $scope.filtringOptions;//it will be putted in PARAMS and watched for apply
        }

    function getData()
        {
        $scope.spinner = true;

        var params = {};
        var option = $scope.sortingOptions.filter(function(el){return el['id']==$scope.PARAMS['sortingFieldId']})[0];
        if (option['id']!='no_sorting')
            params['sorting'] = option['sorting'];


        params['pagination' ] = {};
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

        //additionally, as static param I pass robotName to filtringOptions
        //it can not be changeds
        $backend.getErrors(
            $scope.SELECTED_ROUND['roundId'],
            params).then(function(response)
                {
                $scope.spinner = false;
                if (response.Error) return false;

                $scope.ROBOT_ERRORS = response.data.docs;
                var total = response.data.count;
                $scope.PARAMS_PAGINATION['pages'] = !(total%$scope.PAGINATION_LIMIT)?total/$scope.PAGINATION_LIMIT:(parseInt(total/$scope.PAGINATION_LIMIT)+1);

                })
        }


    function transformOneDoc(doc)
        {
        doc['created'] = doc['startTime']*1;
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
            and.push({'created':{'$gt':params['_and']['from']*1}})

        if (params['_and']['to'])
            and.push({'created':{'$lt':roundToEndDay(params['_and']['to']*1)}})

        if (and.length!=0)
            params['$and'] = and;

        delete params['_and'];
        return params;
        }

    }