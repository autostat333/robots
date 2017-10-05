module.exports.$inject = ['$scope','$backend'];
module.exports = function robotsUrlsParsedCntr($scope,$backend)
    {
    $scope.init = init;
    $scope.initPageParams = initPageParams;
    $scope.initReqParams = initReqParams;
    $scope.getRobotUrls = getRobotUrls;
    $scope.initSortingOptions = initSortingOptions;


    PAGINATION_LIMIT = 10;
    $scope.$watchGroup(['SELECTED_ROBOT["robotName"]','SELECTED_ROUND["roundId"]'],watcherRobotChange);
    //tracking should be for current page and for lastInit
    //because lastInit - changes after InitParams and force getRobotUrls
    //the rest PARAMS parameters mustnot enforce sending request to backend
    $scope.$watchGroup([
        'PARAMS["pagination"]["current"]',
        'PARAMS["lastInit"]',
        'PARAMS["sortingFieldId"]'
        ],watcherParams,true);

    $scope.$watch('PARAMS["filtring"]["name"]',watcherFiltring);

    $scope.init();


    function init()
        {
        $scope.initPageParams();
        $scope.initReqParams();
        $scope.initSortingOptions();
        }


    function initPageParams()
        {
        var p,pp;
        $scope.PARAMS = p = $scope.PARAMS||{};
        p['pagination'] = pp = {};
        pp['current'] = 1;
        pp['limit'] = PAGINATION_LIMIT; //this param is sended to DB
        pp['skip'] = PAGINATION_LIMIT*(pp['current']-1); //this param is sended to DB
        pp['pages'] = 0;
        //to enforce after init sending request for new Data
        //because if SELECTED_ROUND || ROBOT change - PARAMS may be the same
        p['lastInit'] = (new Date())*1;

        //it is for sorting select field
        //it is converted to sorting param within watcher
        p['sortingFieldId'] = 'no_sorting';//it means no sorting, in watcher '' will be transformed to sorting:{};
        }

    function initReqParams()
        {
        $scope.PARAMS['filtring'] = {'name':''};
        }



    function initSortingOptions()
        {
        $scope.sortingOptions = [];
        $scope.sortingOptions.push({'id':'no_sorting','label':'No Sorting'});
        $scope.sortingOptions.push({'id':1,'label':'Name ASC','sorting':{'name':1}});
        $scope.sortingOptions.push({'id':2,'label':'Name DESC','sorting':{'name':-1}});
        }


    function getRobotUrls()
        {
        $scope.PARAMS['pagination']['skip'] = PAGINATION_LIMIT*($scope.PARAMS['pagination']['current']-1);

        $backend.getRobotUrls($scope.SELECTED_ROBOT['robotName']+'Urls',$scope.PARAMS).then(function(response)
            {
            if (response.Error)
                {
                return false;
                }
            $scope.ROBOT_URLS = response.data.docs;
            var total = response.data.count;
            $scope.PARAMS.pagination['pages'] = !(total%PAGINATION_LIMIT)?total/PAGINATION_LIMIT:(parseInt(total/PAGINATION_LIMIT)+1);
            });
        }



    function watcherRobotChange(newVal,oldVal)
        {
        if (!newVal[0]||!newVal[1]) return false;
        $scope.initPageParams();
        $scope.initReqParams();
        }


    function watcherFiltring(newVal,oldVal)
        {
        $scope.initPageParams();
        }


    function watcherParams(newVal,oldVal)
        {
        if (!$scope.SELECTED_ROUND||!$scope.SELECTED_ROBOT) return false;

        //transform sorting ng-model of select to sorting params for backend
        var id;
        if ((id=$scope.PARAMS['sortingFieldId'])!='no_sorting')
            {
            var option = $scope.sortingOptions.filter(function(el){return el['id']==id;})[0];
            $scope.PARAMS['sorting'] = option['sorting'];
            }
        else
            $scope.PARAMS['sorting'] = {};


        $scope.getRobotUrls();


        }

    }