module.exports = function config($stateProvider,$urlRouterProvider,$httpProvider)
    {

    $httpProvider.interceptors.push(['$injector',function($injector)
        {
        return {
            'request':function(config)
                {
                //var token;
                //if ((token=window.localStorage.getItem('token'))!=null)
                    //config.headers['Authorization'] = ' Bearer '+token;

                return config;
                },
            'response':function(response)
                {
                //if new token
                if (response&&response.data&&response.data.token)
                    {
                    //get cookies and put it
                    var $cookies = $injector.get('$cookies');
                    $cookies.put('Authentication',' Bearer '+response.data.token);
                    window.localStorage.setItem('token',response.data.token);
                    window.location.reload();

                    }
                return response;
                }

            }
        }])


    $urlRouterProvider.when('','/')
        .otherwise('/main/rounds/parsed')
        .when('/','/main/rounds/parsed')
        .when('/main','/main/round/parsed')
        .when('/main/rounds','/main/rounds/parsed')
        .when('/main/reports','/main/reports/details');



        $stateProvider

            .state('login',
                {
                templateUrl:'./views/login/login.html',
                controller:'loginCntr',
                url:'/login'
                })

            .state('main',
                {
                templateUrl:'./views/main/main.html',
                controller:'mainCntr',
                url:'/main'
                })

            .state('main.rounds',
                {
                templateUrl:'./views/rounds/rounds.html',
                controller:'roundsCntr',
                url:'/rounds'
                })

                .state('main.rounds.urls',
                    {
                    templateUrl:'./views/rounds/robotBaseUrls.html',
                    controller:'robotBaseUrlsCntr',
                    url:'/urls'
                    })
                .state('main.rounds.parsed',
                    {
                    templateUrl:'./views/rounds/robotUrlsParsed.html',
                    controller:'robotUrlsParsedCntr',
                    url:'/parsed'
                    })
                .state('main.rounds.errors',
                    {
                    templateUrl:'./views/rounds/robotErrors.html',
                    controller:'robotErrorsCntr',
                    url:'/errors'
                    })



            .state('main.reports',
                {
                templateUrl:'./views/reports/reports.html',
                controller:'reportsCntr',
                url:'/reports'
                })

                .state('main.reports.details',
                    {
                    templateUrl:'/views/reports/reportsDetails.html',
                    controller:'reportsDetailsCntr',
                    url:'/details'
                    })

                .state('main.reports.cars',
                    {
                    templateUrl:'/views/reports/reportsCars.html',
                    controller:'reportsCarsCntr',
                    url:'/cars'
                    })




    }
module.exports.$inject = ['$stateProvider','$urlRouterProvider','$httpProvider'];


